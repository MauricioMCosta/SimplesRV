import { db } from '../db/database';
import { ReportDefinition } from './index';

export const realizedProfitsReport: ReportDefinition = {
  id: 'realized-profits',
  name: 'Lucros Realizados (Vendas)',
  description: 'Histórico de lucros e prejuízos realizados em operações de venda.',
  execute: async () => {
    const sells = await db.sells.toArray();
    
    if (sells.length === 0) {
      return 'Nenhuma venda realizada encontrada no histórico.';
    }

    // Sort sells by date descending
    sells.sort((a, b) => b.date.localeCompare(a.date));

    const totalProfit = sells.reduce((acc, curr) => acc + curr.profit, 0);
    const dayTradeProfit = sells.filter(s => s.type === 'DAY').reduce((acc, curr) => acc + curr.profit, 0);
    const swingTradeProfit = sells.filter(s => s.type === 'SWING').reduce((acc, curr) => acc + curr.profit, 0);
    const divProfit = sells.filter(s => s.type === 'DIV').reduce((acc, curr) => acc + curr.profit, 0);
    const jcpProfit = sells.filter(s => s.type === 'JCP').reduce((acc, curr) => acc + curr.profit, 0);
    const rendProfit = sells.filter(s => s.type === 'REND').reduce((acc, curr) => acc + curr.profit, 0);

    let markdown = `# Relatório de Lucros e Rendimentos Realizados\n\n`;
    
    markdown += `### Resumo Geral\n\n`;
    markdown += `| Categoria | Lucro/Rendimento Total |\n`;
    markdown += `| :--- | :---: |\n`;
    markdown += `| **Day Trade** | R$ ${dayTradeProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    markdown += `| **Swing Trade** | R$ ${swingTradeProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    if (divProfit > 0) markdown += `| **Dividendos** | R$ ${divProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    if (jcpProfit > 0) markdown += `| **JCP** | R$ ${jcpProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    if (rendProfit > 0) markdown += `| **Rendimentos** | R$ ${rendProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    markdown += `| **TOTAL ACUMULADO** | **R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |\n\n`;

    markdown += `### Detalhamento das Operações\n\n`;
    markdown += `| Data | Ticker | Tipo | Qtd | Custo Médio | Preço Venda | Lucro/Prejuízo |\n`;
    markdown += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;

    for (const s of sells) {
      const profitColor = s.profit >= 0 ? '' : 'text-red-600'; // Markdown doesn't support color easily but we can use bold for emphasized results
      const profitStr = s.profit >= 0 
        ? `**R$ ${s.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**`
        : `*R$ ${s.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*`;

      markdown += `| ${s.date} | **${s.ticker}** | ${s.type} | ${s.qty} | R$ ${s.avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | R$ ${s.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${profitStr} |\n`;
    }

    markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;

    return markdown;
  }
};
