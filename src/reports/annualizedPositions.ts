import { db } from '../db/database';
import { Transaction } from '../db/database.types';
import { ReportDefinition } from './reports.types';
import { computeRightsAvgPriceMem } from '../db/operations';

export const annualizedPositionsReport: ReportDefinition = {
  id: 'annualized-positions',
  name: 'Posição Anualizada (31/12)',
  description: 'Mostra a custódia e o preço médio de cada ativo no final de cada ano (31 de Dezembro).',
  execute: async () => {
    const transactions = await db.transactions.toArray();
    const assets = await db.assets.toArray();

    if (transactions.length === 0) {
      return 'Nenhuma transação encontrada no sistema.';
    }

    // Sort all transactions by date
    transactions.sort((a, b) => a.date.localeCompare(b.date));

    const yearsSet = new Set<number>();
    transactions.forEach(t => yearsSet.add(new Date(t.date).getFullYear()));
    const years = Array.from(yearsSet).sort();

    const tickersSet = new Set<string>();
    transactions.forEach(t => tickersSet.add(t.ticker.toUpperCase()));
    const tickers = Array.from(tickersSet).sort();

    // Map to hold annualized results: { year: { ticker: { qty, avgPrice } } }
    const results: Record<number, Record<string, { qty: number; avgPrice: number }>> = {};

    // For each ticker, compute history
    for (const ticker of tickers) {
      const realTxs = transactions.filter(t => t.ticker.toUpperCase() === ticker);
      const subExercises = transactions.filter(t => t.acquisition_type === 'SUB' && t.sub_ticker?.toUpperCase() === ticker);

      const tickerTxs = [
        ...realTxs,
        ...subExercises.map(tx => ({
          ...tx,
          ticker: ticker,
          type: 'EXERCISE' as const,
          qty: tx.qty,
          price: 0
        }))
      ];
      tickerTxs.sort((a, b) => a.date.localeCompare(b.date));

      let currentQty = 0;
      let currentAvgPrice = 0;

      let txIndex = 0;

      for (const year of years) {
        // Process transactions up to 31/12 of this year
        const endOfYear = `${year}-12-31`;

        while (txIndex < tickerTxs.length && tickerTxs[txIndex].date <= endOfYear) {
          const t = tickerTxs[txIndex];
          
          if (t.type === 'BUY') {
            const prevTotal = currentQty * currentAvgPrice;
            let priceWithRights = t.price;
            if (t.acquisition_type === 'SUB' && t.sub_ticker) {
              priceWithRights += computeRightsAvgPriceMem(transactions, t.sub_ticker, t.date);
            }
            const currentTotal = t.qty * priceWithRights;
            currentQty += t.qty;
            currentAvgPrice = currentQty > 0 ? (prevTotal + currentTotal) / currentQty : 0;
          } else if (t.type === 'SELL' || (t.type as string) === 'EXERCISE') {
            currentQty -= t.qty;
            if (currentQty <= 0) {
              currentQty = 0;
              currentAvgPrice = 0;
            }
          } else if (t.type === 'SPLIT') {
             if (t.qty > 0) {
              currentQty *= t.qty;
              currentAvgPrice /= t.qty;
             }
          } else if (t.type === 'INPLIT') {
             if (t.qty > 0 && currentQty > 0) {
              currentQty = Math.floor(currentQty / t.qty);
              currentAvgPrice = currentAvgPrice * t.qty;
             }
          }
          txIndex++;
        }

        if (currentQty > 0) {
          if (!results[year]) results[year] = {};
          results[year][ticker] = { qty: currentQty, avgPrice: currentAvgPrice };
        }
      }
    }

    if (Object.keys(results).length === 0) {
      return 'Não foi possível calcular posições fechadas para os anos registrados.';
    }

    let markdown = `# Relatório de Posições Anualizadas\n\n`;
    markdown += `Este relatório apresenta o saldo em custódia e o preço médio calculado no dia 31 de dezembro de cada ano.\n\n`;

    const sortedYearsDesc = Object.keys(results).map(Number).sort((a, b) => b - a);

    for (const year of sortedYearsDesc) {
      markdown += `## Ano-Calendário: ${year}\n\n`;
      markdown += `| Ticker | Descrição | Quantidade | Preço Médio | Valor em Custódia |\n`;
      markdown += `| :--- | :--- | :---: | :---: | :---: |\n`;

      const yearTickers = Object.keys(results[year]).sort();
      let yearTotal = 0;

      for (const ticker of yearTickers) {
        const data = results[year][ticker];
        const asset = assets.find(a => a.ticker.toUpperCase() === ticker);
        const description = asset?.description || '-';
        const total = data.qty * data.avgPrice;
        yearTotal += total;

        markdown += `| **${ticker}** | ${description} | ${data.qty.toLocaleString('pt-BR')} | R$ ${data.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} | R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
      }

      markdown += `| **TOTAL** | | | | **R$ ${yearTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |\n\n`;
      markdown += `---\n\n`;
    }

    markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;

    return markdown;
  }
};
