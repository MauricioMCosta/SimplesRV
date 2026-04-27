import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  ticker: string;
  date: string;
  type: 'BUY' | 'SELL' | 'INPLIT' | 'SPLIT';
  qty: number;
  price: number;
  created_at?: string;
  is_pending?: boolean;
}

export interface Metadata {
  key: string;
  value: string;
}

export interface Position {
  ticker: string;
  qty: number;
  avgPrice: number;
}

export interface Sell {
  id?: number;
  ticker: string;
  date: string;
  qty: number;
  avgCost: number;
  sellPrice: number;
  profit: number;
  type: 'DAY' | 'SWING';
}

export interface Asset {
  id?: number;
  ticker: string;
  description: string;
  type: string;
  is_pending?: boolean;
}

export class AppDatabase extends Dexie {
  transactions!: Table<Transaction>;
  metadata!: Table<Metadata>;
  positions!: Table<Position>;
  sells!: Table<Sell>;
  assets!: Table<Asset>;

  constructor() {
    super('FinDB');
    this.version(6).stores({
      transactions: '++id, ticker, date, type, [ticker+date]',
      metadata: 'key',
      positions: 'ticker',
      sells: '++id, ticker, date, type',
      assets: '++id, &ticker, is_pending'
    });
  }
}

export const db = new AppDatabase();

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

export async function _consolidateTrades(generateSells: boolean = true) {
    const pending = await db.transactions
      .filter(t=> t.is_pending ?? false)
      .toArray();

    if (pending.length === 0) return;
    
      // Identify all unique tickers that have pending transactions
      const pendingTickers = Array.from(new Set(pending.map(t => t.ticker.toUpperCase())));

      for (const ticker of pendingTickers) {
        // Reset consolidated state for this ticker
        await db.positions.delete(ticker);
        if (generateSells) {
          await db.sells.where('ticker').equals(ticker).delete();
        }

        // Process ALL transactions for this ticker to ensure full history is considered
        const tickerTxs = await db.transactions
          .where('ticker')
          .equals(ticker)
          .sortBy('date');
        
        const byDate: Record<string, Transaction[]> = {};
        tickerTxs.forEach(t => {
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

        for (const t of dayTxs) {
          if (t.type === 'BUY') {
            buyQty += t.qty;
            buyTotal += t.qty * t.price;
          } else if (t.type === 'SELL') {
            sellQty += t.qty;
            sellTotal += t.qty * t.price;
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

        for (const t of dayTxs) {
          if (t.type === 'SPLIT' || t.type === 'INPLIT') {
            if (t.qty > 0) {
              pos.qty *= t.qty;
              pos.avgPrice /= t.qty;
            }
          }
        }
        
        if (generateSells) {
          for (const t of dayTxs) {
            if (t.id) {
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

// Business logic
export async function getTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy(['ticker','date']).reverse().toArray();
}

export async function addTransaction(t: Transaction) {
  const ticker = t.ticker.toUpperCase();
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets], async () => {
    
    // Check if asset exists, if not create it pending
    const existingAsset = await db.assets.where('ticker').equals(ticker).first();
    if (!existingAsset) {
      await db.assets.add({
        ticker,
        description: '',
        type: '',
        is_pending: true
      });
    }

    await db.transactions.add({
      ticker,
      date: t.date,
      type: t.type,
      qty: Number(t.qty),
      price: Number(t.price),
      created_at: new Date().toISOString(),
      is_pending: true
    });
    // Mark only transactions on the same date of this ticker as pending to force re-consolidation
    const sameDateTxs = await db.transactions
      .where('ticker').equals(ticker)
      .and(tx => tx.date === t.date)
      .toArray();
      
    for (const tx of sameDateTxs) {
        if (tx.id) await db.transactions.update(tx.id, { is_pending: true });
    }
    await db.metadata.put({ key: 'last_updated_at', value: new Date().toISOString() });
    await _consolidateTrades(false);
  });
}

export async function deleteTransaction(id: number) {

  await db.transaction('rw', db.transactions, db.metadata, db.positions, db.sells, async () => {

    const tx = await db.transactions.get(id);
    if (!tx) return;
    
    const ticker = tx.ticker.toUpperCase();
    await db.transactions.delete(id);
    
    // Mark transactions on the same date as pending to force re-consolidation
    // If no transactions left on that date, mark the most recent one as pending so the ticker is evaluated
    const otherTxs = await db.transactions.where('ticker').equals(ticker.toUpperCase()).toArray();
    
    const sameDateTxs = await db.transactions
      .where('ticker').equals(ticker)
      .and(t => t.date === tx.date)
      .toArray();
      
    if (sameDateTxs.length > 0) {
      for (const t of sameDateTxs) {
        if (t.id) await db.transactions.update(t.id, { is_pending: true });
      }
    } else if (otherTxs.length > 0) {
      // Just mark the last one as pending
      const last = otherTxs[otherTxs.length - 1];
      if (last && last.id) {
        await db.transactions.update(last.id, { is_pending: true });
      }
    }
    
    // We also need to clear properties to avoid ghost data if no transactions left
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
    qty: p.qty,      // balance is qty
    avgPrice: p.avgPrice // include avgPrice
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
  return JSON.stringify({ transactions, metadata, positions, sells, assets }, null, 2);
}

export async function importDB(data: string) {
  const parsed = JSON.parse(data);
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets], async () => {
    await db.transactions.clear();
    await db.metadata.clear();
    await db.positions.clear();
    await db.sells.clear();
    await db.assets.clear();
    if (parsed.transactions) await db.transactions.bulkAdd(parsed.transactions);
    if (parsed.metadata) await db.metadata.bulkAdd(parsed.metadata);
    if (parsed.positions) await db.positions.bulkAdd(parsed.positions);
    if (parsed.sells) await db.sells.bulkAdd(parsed.sells);
    if (parsed.assets) await db.assets.bulkAdd(parsed.assets);
  });
  // No auto recalculate here unless needed, but importing often means using the saved state.
  // Although recalculating might ensure consistency if the user messed with the JSON.
}

export async function resetDB() {
  await db.transaction('rw', [db.transactions, db.metadata, db.positions, db.sells, db.assets], async () => {
    await db.transactions.clear();
    await db.metadata.clear();
    await db.positions.clear();
    await db.sells.clear();
    await db.assets.clear();
  });
}

// Asset functions
export async function getAssets(): Promise<Asset[]> {
  return await db.assets.orderBy('ticker').toArray();
}

export async function addAsset(a: Omit<Asset, 'id'>) {
  await db.assets.add({ ...a, ticker: a.ticker.toUpperCase() });
}

export async function updateAsset(id: number, data: Partial<Asset>) {
  if (data.ticker) data.ticker = data.ticker.toUpperCase();
  await db.assets.update(id, data);
}

export async function deleteAsset(id: number) {
  await db.assets.delete(id);
}
