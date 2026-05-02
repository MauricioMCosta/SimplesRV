import { db } from '../db/database';
import { ReportDefinition } from './index';

export const equitySummaryReport: ReportDefinition = {
  id: 'equity-summary',
  name: 'Sumário de Patrimônio',
  description: 'Visão detalhada das posições atuais com custo médio e total investido.',
  execute: async () => {
    const positions = await db.positions.toArray();
    const assets = await db.assets.toArray();
    
    if (positions.length === 0) {
      return 'Nenhuma posição aberta encontrada.';
    }

    let totalInvested = 0;
    let markdown = `## Sumário de Patrimônio\n\n`;
    markdown += `| Ticker | Descrição | Qtd | Preço Médio | Total Investido |\n`;
    markdown += `| :--- | :--- | :---: | :---: | :---: |\n`;

    // Sort positions by ticker
    positions.sort((a, b) => a.ticker.localeCompare(b.ticker));

    for (const p of positions) {
      const asset = assets.find(a => a.ticker === p.ticker);
      const description = asset?.description || '-';
      const total = p.qty * p.avgPrice;
      totalInvested += total;

      markdown += `| **${p.ticker}** | ${description} | ${p.qty} | R$ ${p.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | **R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `### Total Geral Investido: **R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n`;
    markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;

    return markdown;
  }
};
