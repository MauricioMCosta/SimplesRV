import { db } from './database';
import { Transaction, Position, Sell, Asset, Custodian } from './database.types';

export async function forceRecalculate(tickers?: string[]) {
  await db.transaction('rw', db.transactions, db.positions, db.sells, db.metadata, async () => {
    // If tickers provided, only mark those as pending
    if (tickers && tickers.length > 0) {
      for (const ticker of tickers) {
        const txs = await db.transactions.where('ticker').equals(ticker.toUpperCase()).toArray();
        for (const t of txs) {
          if (t.id) await db.transactions.update(t.id, { is_pending: true });
        }
        // Wipe position for those tickers
        await db.positions.delete(ticker.toUpperCase());
        // Wipe sells for those tickers? Maybe safer to just wipe all sells or filter by ticker
        await db.sells.where('ticker').equals(ticker.toUpperCase()).delete();
      }
    } else {
      // Mark ALL transactions as pending to redo everything
      const all = await db.transactions.toArray();
      for (const t of all) {
        if (t.id) await db.transactions.update(t.id, { is_pending: true });
      }
      // Clear derived tables
      await db.positions.clear();
      await db.sells.clear();
    }

    // Perform consolidation
    await _consolidateTrades();
  });
}

export function computeRightsAvgPriceMem(transactions: Transaction[], subTicker: string, date: string): number {
  const filteredSorted = transactions
    .filter(t => t.ticker.toUpperCase() === subTicker.toUpperCase() && t.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));

  let qty = 0;
  let avgPrice = 0;

  for (const t of filteredSorted) {
    if (t.type === 'BUY') {
      const prevTotal = qty * avgPrice;
      const currentTotal = t.qty * t.price;
      qty += t.qty;
      avgPrice = qty > 0 ? (prevTotal + currentTotal) / qty : 0;
    } else if (t.type === 'SELL' || (t.type as string) === 'EXERCISE') {
      qty -= t.qty;
      if (qty <= 0) {
        qty = 0;
        avgPrice = 0;
      }
    } else if (t.type === 'SPLIT') {
       if (t.qty > 0) {
        qty *= t.qty;
        avgPrice /= t.qty;
       }
    } else if (t.type === 'INPLIT') {
       if (t.qty > 0 && qty > 0) {
        qty = Math.floor(qty / t.qty);
        avgPrice = avgPrice * t.qty;
       }
    }
  }

  return avgPrice;
}

async function getRightsAvgPrice(subTicker: string, date: string): Promise<number> {
  const txs = await db.transactions
    .where('ticker')
    .equals(subTicker.toUpperCase())
    .toArray();
  
  // Sort them by date up to the given date
  const filteredSorted = txs
    .filter(t => t.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));

  let qty = 0;
  let avgPrice = 0;

  for (const t of filteredSorted) {
    if (t.type === 'BUY') {
      const prevTotal = qty * avgPrice;
      const currentTotal = t.qty * t.price;
      qty += t.qty;
      avgPrice = qty > 0 ? (prevTotal + currentTotal) / qty : 0;
    } else if (t.type === 'SELL') {
      qty -= t.qty;
      if (qty <= 0) {
        qty = 0;
        avgPrice = 0;
      }
    } else if (t.type === 'SPLIT') {
       if (t.qty > 0) {
        qty *= t.qty;
        avgPrice /= t.qty;
       }
    } else if (t.type === 'INPLIT') {
       if (t.qty > 0 && qty > 0) {
        qty = Math.floor(qty / t.qty);
        avgPrice = avgPrice * t.qty;
       }
    }
  }

  return avgPrice;
}

export async function _consolidateTrades(generateSells: boolean = true) {
  const pending = await db.transactions
    .filter(t => t.is_pending ?? false)
    .toArray();

  if (pending.length === 0) return;

  // Identify all unique tickers that have pending transactions, expanding graph of subscrissao peers
  const pendingSet = new Set(pending.map(t => t.ticker.toUpperCase()));
  const allTxs = await db.transactions.toArray();
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const tx of allTxs) {
      const tUpper = tx.ticker.toUpperCase();
      const sUpper = tx.sub_ticker?.toUpperCase();
      if (pendingSet.has(tUpper) && sUpper && !pendingSet.has(sUpper)) {
        pendingSet.add(sUpper);
        expanded = true;
      }
      if (sUpper && pendingSet.has(sUpper) && !pendingSet.has(tUpper)) {
        pendingSet.add(tUpper);
        expanded = true;
      }
    }
  }
  const pendingTickers = Array.from(pendingSet);

  for (const ticker of pendingTickers) {
    // Reset consolidated state for this ticker
    await db.positions.delete(ticker);
    if (generateSells) {
      await db.sells.where('ticker').equals(ticker).delete();
    }

    // Process ALL transactions for this ticker, plus any virtual exercises where this was a sub_ticker
    const tickerTxs = await db.transactions
      .where('ticker')
      .equals(ticker)
      .sortBy('date');

    const subExercises = allTxs.filter(tx => tx.acquisition_type === 'SUB' && tx.sub_ticker?.toUpperCase() === ticker);

    interface TimelineEvent {
      id?: number;
      ticker: string;
      date: string;
      type: 'BUY' | 'SELL' | 'DIV' | 'JCP' | 'REND' | 'SPLIT' | 'INPLIT' | 'EXERCISE';
      qty: number;
      price: number;
      acquisition_type?: 'REG' | 'BON' | 'SUB';
      sub_ticker?: string;
      is_pending?: boolean;
    }

    const timeline: TimelineEvent[] = [
      ...tickerTxs.map(t => ({
        id: t.id,
        ticker: t.ticker,
        date: t.date,
        type: t.type as any,
        qty: t.qty,
        price: t.price,
        acquisition_type: t.acquisition_type,
        sub_ticker: t.sub_ticker,
        is_pending: t.is_pending
      })),
      ...subExercises.map(tx => ({
        id: tx.id,
        ticker: ticker,
        date: tx.date,
        type: 'EXERCISE' as const,
        qty: tx.qty,
        price: 0,
        is_pending: tx.is_pending
      }))
    ];

    // Sort timeline chronologically
    timeline.sort((a, b) => a.date.localeCompare(b.date));

    const byDate: Record<string, TimelineEvent[]> = {};
    timeline.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = [];
      byDate[t.date].push(t);
    });

    let pos: Position = { ticker, qty: 0, avgPrice: 0 };

    const dates = Object.keys(byDate).sort();

    for (const date of dates) {
      const dayTxs = byDate[date];
      let buyQty = 0;
      let buyTotal = 0;
      let sellQty = 0;
      let sellTotal = 0;
      let exerciseQty = 0;

      for (const t of dayTxs) {
        if (t.type === 'BUY') {
          let priceWithRights = t.price;
          // Subscrição adjusts purchase price with the cost basis of the subscription rights
          if (t.acquisition_type === 'SUB' && t.sub_ticker) {
            const rightsCost = await getRightsAvgPrice(t.sub_ticker, t.date);
            priceWithRights += rightsCost;
          }
          buyQty += t.qty;
          buyTotal += t.qty * priceWithRights;
        } else if (t.type === 'SELL') {
          sellQty += t.qty;
          sellTotal += t.qty * t.price;
        } else if (t.type === 'EXERCISE') {
          exerciseQty += t.qty;
        } else if (t.type === 'DIV' || t.type === 'JCP' || t.type === 'REND') {
          if (generateSells) {
            await db.sells.add({
              ticker,
              date,
              qty: t.qty,
              avgCost: 0,
              sellPrice: t.price,
              profit: t.qty * t.price,
              type: t.type
            });
          }
        }
      }

      const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;
      const avgSellPrice = sellQty > 0 ? sellTotal / sellQty : 0;

      const dayTradeQty = Math.min(buyQty, sellQty);
      if (generateSells && dayTradeQty > 0) {
        const profit = (avgSellPrice - avgBuyPrice) * dayTradeQty;
        await db.sells.add({
          ticker,
          date,
          qty: dayTradeQty,
          avgCost: avgBuyPrice,
          sellPrice: avgSellPrice,
          profit,
          type: 'DAY'
         });
      }

      const netBuy = buyQty - dayTradeQty;
      const netSell = sellQty - dayTradeQty;

      if (netBuy > 0) {
        const prevTotal = pos.qty * pos.avgPrice;
        const currentTotal = netBuy * avgBuyPrice;
        pos.qty += netBuy;
        pos.avgPrice = pos.qty > 0 ? (prevTotal + currentTotal) / pos.qty : 0;
      }

      if (netSell > 0) {
        if (generateSells) {
          const profit = (avgSellPrice - pos.avgPrice) * netSell;
          await db.sells.add({
            ticker,
            date,
            qty: netSell,
            avgCost: pos.avgPrice,
            sellPrice: avgSellPrice,
            profit,
            type: 'SWING'
          });
        }
        pos.qty -= netSell;
        if (pos.qty <= 0) {
          pos.qty = 0;
          pos.avgPrice = 0;
        }
      }

      if (exerciseQty > 0) {
        pos.qty -= exerciseQty;
        if (pos.qty <= 0) {
          pos.qty = 0;
          pos.avgPrice = 0;
        }
      }

      for (const t of dayTxs) {
        if (t.type === 'SPLIT') {
          if (t.qty > 0) {
            pos.qty *= t.qty;
            pos.avgPrice /= t.qty;
          }
        } else if (t.type === 'INPLIT') {
          if (t.qty > 0 && pos.qty > 0) {
            const newTotalQty = pos.qty / t.qty;
            const wholeQty = Math.floor(newTotalQty);
            const fractionalQty = newTotalQty - wholeQty;
            const newAvgPrice = pos.avgPrice * t.qty;

            if (generateSells && fractionalQty > 0) {
              await db.sells.add({
                ticker,
                date,
                qty: fractionalQty,
                avgCost: newAvgPrice,
                sellPrice: newAvgPrice,
                profit: 0,
                type: 'AJUSTE'
              });
            }

            pos.qty = wholeQty;
            pos.avgPrice = newAvgPrice;
          }
        }
      }

      if (generateSells) {
        for (const t of dayTxs) {
          if (t.type !== 'EXERCISE' && t.id) {
            await db.transactions.update(t.id, { is_pending: false });
          }
        }
      }
    }

    if (pos.qty > 0) {
      await db.positions.put(pos);
    } else {
      await db.positions.delete(ticker);
    }
  }

  await db.metadata.put({ key: 'last_updated_at', value: new Date().toISOString() });
}

export async function countPendingTransactions(): Promise<number> {
  return await db.transactions.filter(t => !!t.is_pending).count();
}

export async function consolidateTrades() {
  await db.transaction('rw', db.transactions, db.positions, db.sells, db.metadata, async () => {
    await _consolidateTrades();
  });
}

export async function getSells(): Promise<Sell[]> {
  return await db.sells.orderBy('date').reverse().toArray();
}

export async function getTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy(['ticker', 'date']).reverse().toArray();
}

async function ensureCustodianExists(cnpj: string | undefined, name?: string) {
  if (!cnpj) return;
  const normalizedCnpj = cnpj.replace(/\D/g, '');
  if (!normalizedCnpj) return;

  const existing = await db.custodians.where('cnpj').equals(normalizedCnpj).first();
  if (!existing) {
    await db.custodians.add({
      cnpj: normalizedCnpj,
      name: name || ('Pendente: ' + normalizedCnpj),
      is_pending: !name
    });
  }
}

export async function addTransaction(t: Transaction) {
  const ticker = t.ticker.toUpperCase();
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets, db.custodians], async () => {

    const existingAsset = await db.assets.where('ticker').equals(ticker).first();
    if (!existingAsset) {
      await db.assets.add({
        ticker,
        description: '',
        type: '',
        is_pending: true
      });
    }

    const sub_ticker = t.sub_ticker ? t.sub_ticker.toUpperCase().trim() : undefined;

    await db.transactions.add({
      ticker,
      date: t.date,
      type: t.type,
      qty: Number(t.qty),
      price: Number(t.price),
      created_at: new Date().toISOString(),
      is_pending: true,
      acquisition_type: t.acquisition_type || 'REG',
      sub_ticker
    });
    
    const sameDateTxs = await db.transactions
      .where('ticker').equals(ticker)
      .and(tx => tx.date === t.date)
      .toArray();

    for (const tx of sameDateTxs) {
      if (tx.id) await db.transactions.update(tx.id, { is_pending: true });
    }

    // Sync sub_ticker to be pending too if it was specified
    if (sub_ticker) {
      const subTxs = await db.transactions.where('ticker').equals(sub_ticker).toArray();
      for (const tx of subTxs) {
        if (tx.id) await db.transactions.update(tx.id, { is_pending: true });
      }
    }

    await db.metadata.put({ key: 'last_updated_at', value: new Date().toISOString() });
    await _consolidateTrades(false);
  });
}

export async function updateTransaction(id: number, t: Partial<Transaction>) {
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets, db.custodians], async () => {
    const existing = await db.transactions.get(id);
    if (!existing) return;

    const oldTicker = existing.ticker.toUpperCase();
    const newTicker = t.ticker ? t.ticker.toUpperCase() : oldTicker;
    const oldSubTicker = existing.sub_ticker ? existing.sub_ticker.toUpperCase() : undefined;
    const newSubTicker = t.sub_ticker ? t.sub_ticker.toUpperCase().trim() : undefined;

    const updatedData: Partial<Transaction> = {
      ...t,
      ticker: newTicker,
      sub_ticker: newSubTicker,
      is_pending: true
    };

    await db.transactions.update(id, updatedData);

    const tickersToConsolidate = new Set([oldTicker, newTicker]);

    for (const ticker of tickersToConsolidate) {
      const txs = await db.transactions.where('ticker').equals(ticker).toArray();
      for (const tx of txs) {
        if (tx.id) await db.transactions.update(tx.id, { is_pending: true });
      }

      const asset = await db.assets.where('ticker').equals(ticker).first();
      if (asset && asset.id) {
        await db.assets.update(asset.id, { is_pending: true });
      }
    }

    // Sync sub_tickers
    const subTickersToPending = new Set<string>();
    if (oldSubTicker) subTickersToPending.add(oldSubTicker);
    if (newSubTicker) subTickersToPending.add(newSubTicker);

    for (const subT of subTickersToPending) {
      const txs = await db.transactions.where('ticker').equals(subT).toArray();
      for (const tx of txs) {
        if (tx.id) await db.transactions.update(tx.id, { is_pending: true });
      }
    }

    await db.metadata.put({ key: 'last_updated_at', value: new Date().toISOString() });
    await _consolidateTrades(false);
  });
}

export async function deleteTransaction(id: number) {
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells], async () => {
    const tx = await db.transactions.get(id);
    if (!tx) return;

    const ticker = tx.ticker.toUpperCase();
    const sub_ticker = tx.sub_ticker ? tx.sub_ticker.toUpperCase() : undefined;
    await db.transactions.delete(id);

    const otherTxs = await db.transactions.where('ticker').equals(ticker).toArray();

    const sameDateTxs = await db.transactions
      .where('ticker').equals(ticker)
      .and(t => t.date === tx.date)
      .toArray();

    if (sameDateTxs.length > 0) {
      for (const t of sameDateTxs) {
        if (t.id) await db.transactions.update(t.id, { is_pending: true });
      }
    } else if (otherTxs.length > 0) {
      const last = otherTxs[otherTxs.length - 1];
      if (last && last.id) {
        await db.transactions.update(last.id, { is_pending: true });
      }
    }

    if (sub_ticker) {
      const subTxs = await db.transactions.where('ticker').equals(sub_ticker).toArray();
      for (const t of subTxs) {
        if (t.id) await db.transactions.update(t.id, { is_pending: true });
      }
    }

    if (otherTxs.length === 0) {
      await db.positions.delete(ticker);
      await db.sells.where('ticker').equalsIgnoreCase(ticker).delete();
    }

    await db.metadata.put({ key: 'last_updated_at', value: new Date().toISOString() });
    await _consolidateTrades(false);
  });
}

export async function getPosition(ticker: string): Promise<Position | undefined> {
  return await db.positions.get(ticker.toUpperCase());
}

export async function getBalances() {
  const positions = await db.positions.toArray();
  return positions.map(p => ({
    ticker: p.ticker,
    qty: p.qty,
    avgPrice: p.avgPrice
  }));
}

export async function getLastUpdated() {
  const meta = await db.metadata.get('last_updated_at');
  return meta?.value || null;
}

export async function exportDB() {
  const transactions = await db.transactions.toArray();
  const metadata = await db.metadata.toArray();
  const positions = await db.positions.toArray();
  const sells = await db.sells.toArray();
  const assets = await db.assets.toArray();
  const custodians = await db.custodians.toArray();
  return JSON.stringify({ transactions, metadata, positions, sells, assets, custodians }, null, 2);
}

export async function importDB(data: string) {
  const parsed = JSON.parse(data);
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets, db.custodians], async () => {
    await db.transactions.clear();
    await db.metadata.clear();
    await db.positions.clear();
    await db.sells.clear();
    await db.assets.clear();
    await db.custodians.clear();
    if (parsed.transactions) await db.transactions.bulkAdd(parsed.transactions);
    if (parsed.metadata) await db.metadata.bulkAdd(parsed.metadata);
    if (parsed.positions) await db.positions.bulkAdd(parsed.positions);
    if (parsed.sells) await db.sells.bulkAdd(parsed.sells);
    if (parsed.assets) await db.assets.bulkAdd(parsed.assets);
    if (parsed.custodians) await db.custodians.bulkAdd(parsed.custodians);
  });
}

export async function resetDB() {
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets, db.custodians], async () => {
    await db.transactions.clear();
    await db.metadata.clear();
    await db.positions.clear();
    await db.sells.clear();
    await db.assets.clear();
    await db.custodians.clear();
  });
}

export async function getAssets(): Promise<Asset[]> {
  return await db.assets.orderBy('ticker').toArray();
}

export async function addAsset(a: Omit<Asset, 'id'>) {
  await db.transaction('rw', [db.assets, db.custodians], async () => {
    if (a.custodianCnpj) {
      await ensureCustodianExists(a.custodianCnpj);
    }
    if (a.cnpj) {
      await ensureCustodianExists(a.cnpj, a.description);
    }
    await db.assets.add({ ...a, ticker: a.ticker.toUpperCase() });
  });
}

export async function updateAsset(id: number, data: Partial<Asset>) {
  await db.transaction('rw', [db.assets, db.custodians], async () => {
    if (data.ticker) data.ticker = data.ticker.toUpperCase();
    if (data.custodianCnpj) {
      await ensureCustodianExists(data.custodianCnpj);
    }
    if (data.cnpj) {
      const existingAsset = await db.assets.get(id);
      const name = data.description || existingAsset?.description;
      await ensureCustodianExists(data.cnpj, name);
    }
    await db.assets.update(id, data);
  });
}

export async function deleteAsset(id: number) {
  await db.assets.delete(id);
}

export async function getCustodians(): Promise<Custodian[]> {
  return await db.custodians.orderBy('cnpj').toArray();
}

export async function addCustodian(c: Omit<Custodian, 'id'>) {
  await db.custodians.add(c);
}

export async function updateCustodian(id: number, data: Partial<Custodian>) {
  await db.custodians.update(id, data);
}

export async function deleteCustodian(id: number) {
  await db.custodians.delete(id);
}
