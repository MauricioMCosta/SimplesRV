import { db } from '../db/database';
import { ReportDefinition } from './reports.types';

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
    let totalQty = 0;

    // Grouping by type
    const summaryByType: Record<string, { type: string; qty: number; invested: number }> = {};

    // Sort positions by ticker
    positions.sort((a, b) => a.ticker.localeCompare(b.ticker));

    let firstTableLines = '';

    for (const p of positions) {
      const asset = assets.find(a => a.ticker === p.ticker);
      const description = asset?.description || '-';
      const type = asset?.type?.trim() || 'NÃO DEFINIDO';
      const total = p.qty * p.avgPrice;
      
      totalInvested += total;
      totalQty += p.qty;

      if (!summaryByType[type]) {
        summaryByType[type] = { type, qty: 0, invested: 0 };
      }
      summaryByType[type].qty += p.qty;
      summaryByType[type].invested += total;

      firstTableLines += `| **${p.ticker}** | ${description} | ${p.qty} | R$ ${p.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | **R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |\n`;
    }

    let markdown = `## Sumário de Patrimônio\n\n`;
    markdown += `| Ticker | Descrição | Qtd | Preço Médio | Total Investido |\n`;
    markdown += `| :--- | :--- | :---: | :---: | :---: |\n`;
    markdown += firstTableLines;

    markdown += `\n---\n\n`;
    markdown += `### Total Geral Investido: **R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n\n`;
    markdown += `### Quantidade Total de Cotas/Ações (Qtd): **${totalQty.toLocaleString('pt-BR')}**\n\n`;

    markdown += `## Alocação e Resumo por Tipo de Ativo\n\n`;
    markdown += `| Tipo | Qtd Total | Valor Investido | Alocação Qtd (%) | Alocação Valor (%) |\n`;
    markdown += `| :--- | :---: | :---: | :---: | :---: |\n`;

    // Sort types alphabetically
    const typesList = Object.values(summaryByType).sort((a, b) => a.type.localeCompare(b.type));

    for (const t of typesList) {
      const allocQtyPercent = totalQty > 0 ? (t.qty / totalQty) * 100 : 0;
      const allocValPercent = totalInvested > 0 ? (t.invested / totalInvested) * 100 : 0;

      markdown += `| **${t.type}** | ${t.qty} | R$ ${t.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${allocQtyPercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% | **${allocValPercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%** |\n`;
    }

    markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;

    return markdown;
  }
};
