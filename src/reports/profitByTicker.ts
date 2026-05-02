import { db } from '../db/database';
import { ReportDefinition } from './index';

export const profitByTickerReport: ReportDefinition = {
  id: 'profit-by-ticker',
  name: 'Lucros Realizados por Ativo',
  description: 'Consolidação de lucro/prejuízo agrupado por ticker.',
  execute: async () => {
    const sells = await db.sells.toArray();
    
    if (sells.length === 0) {
      return 'Nenhuma venda registrada até o momento.';
    }

    const summary: Record<string, { totalProfit: number; totalQty: number }> = {};

    for (const s of sells) {
      if (!summary[s.ticker]) {
        summary[s.ticker] = { totalProfit: 0, totalQty: 0 };
      }
      summary[s.ticker].totalProfit += s.profit;
      summary[s.ticker].totalQty += s.qty;
    }

    let markdown = `## Lucros Realizados por Ativo\n\n`;
    markdown += `| Ticker | Qtd Total Vendida | Resultado Total |\n`;
    markdown += `| :--- | :---: | :--- |\n`;

    const sortedTickers = Object.keys(summary).sort();
    let grandTotal = 0;

    for (const ticker of sortedTickers) {
      const { totalProfit, totalQty } = summary[ticker];
      grandTotal += totalProfit;
      const profitStr = totalProfit >= 0 
        ? `🟢 **R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`
        : `🔴 **R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`;

      markdown += `| **${ticker}** | ${totalQty.toFixed(2)} | ${profitStr} |\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `### Resultado Consolidado: ${grandTotal >= 0 ? '🟢' : '🔴'} **R$ ${grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n`;
    markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;

    return markdown;
  }
};
