import { db } from '../db/database';
import { TaxReportData, TaxReportItem } from './taxReport.types';

export async function getTaxReportData(year: number): Promise<TaxReportData> {
  const transactions = await db.transactions.toArray();
  const assets = await db.assets.toArray();
  const custodians = await db.custodians.toArray();

  const prevYear = year - 1;
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;
  const endOfPrevYear = `${prevYear}-12-31`;

  // Sort transactions by date
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  const tickersSet = new Set<string>();
  transactions.forEach(t => tickersSet.add(t.ticker.toUpperCase()));
  const tickers = Array.from(tickersSet).sort();

  const items: TaxReportItem[] = [];

  for (const ticker of tickers) {
    const tickerTxs = transactions.filter(t => t.ticker.toUpperCase() === ticker);
    const asset = assets.find(a => a.ticker.toUpperCase() === ticker);
    const custodian = custodians.find(c => c.cnpj === asset?.custodianCnpj);

    let currentQty = 0;
    let currentAvgPrice = 0;
    let prevYearQty = 0;
    
    let earnings = { div: 0, jcp: 0, rend: 0 };

    for (const t of tickerTxs) {
      if (t.date <= endOfYear) {
        if (t.type === 'BUY') {
          const prevTotal = currentQty * currentAvgPrice;
          const currentTotal = t.qty * t.price;
          currentQty += t.qty;
          currentAvgPrice = currentQty > 0 ? (prevTotal + currentTotal) / currentQty : 0;
        } else if (t.type === 'SELL') {
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

        // Capture previous year quantity
        if (t.date <= endOfPrevYear) {
          prevYearQty = currentQty;
        }

        // Capture current year earnings
        if (t.date >= startOfYear && t.date <= endOfYear) {
          if (t.type === 'DIV') {
            earnings.div += (t.qty * t.price);
          } else if (t.type === 'JCP') {
            earnings.jcp += (t.qty * t.price);
          } else if (t.type === 'REND') {
            earnings.rend += (t.qty * t.price);
          }
        }
      }
    }

    // Only include if there was a position in prev year, current year, or earnings in current year
    if (prevYearQty > 0 || currentQty > 0 || earnings.div > 0 || earnings.jcp > 0 || earnings.rend > 0) {
      items.push({
        ticker,
        description: asset?.description || 'Sem descrição',
        custodianName: custodian?.name || 'Custodiante não cadastrado',
        custodianCnpj: custodian?.cnpj || asset?.custodianCnpj || '-',
        prevYearQty,
        currentYearQty: currentQty,
        currentYearAvgPrice: currentAvgPrice,
        earnings
      });
    }
  }

  return { year, items };
}

export async function getReportYears(): Promise<number[]> {
  const transactions = await db.transactions.toArray();
  if (transactions.length === 0) return [new Date().getFullYear()];
  
  const years = new Set<number>();
  transactions.forEach(t => {
    years.add(new Date(t.date).getFullYear());
  });
  
  // Also include the next year if many transactions are at the end of the year
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  if (sortedYears.length > 0) {
    // Ensure current year is at least available
    const current = new Date().getFullYear();
    if (!years.has(current)) sortedYears.unshift(current);
  } else {
    return [new Date().getFullYear()];
  }

  return Array.from(new Set(sortedYears)).sort((a, b) => b - a);
}

export function formatTaxReportMarkdown(data: TaxReportData): string {
  if (data.items.length === 0) {
    return `### Relatório de Imposto de Renda - Ano ${data.year}\n\nNenhuma movimentação ou custódia encontrada para este ano.`;
  }

  let markdown = `# Relatório Auxiliar de Imposto de Renda - Ano ${data.year}\n\n`;
  markdown += `Este relatório auxilia no preenchimento da Declaração de Ajuste Anual de Imposto de Renda.\n\n`;

  for (const item of data.items) {
    markdown += `### **${item.ticker}** - ${item.description}\n`;
    markdown += `**Custodiante:** ${item.custodianName} - **CNPJ:** ${item.custodianCnpj}\n\n`;
    
    markdown += `#### 📋 Posição em Custódia\n`;
    markdown += `- **31/12/${data.year - 1}:** ${item.prevYearQty.toLocaleString('pt-BR')} unidades\n`;
    markdown += `- **31/12/${data.year}:** ${item.currentYearQty.toLocaleString('pt-BR')} unidades - **Preço Médio:** R$ ${item.currentYearAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} - **Total:** R$ ${(item.currentYearQty * item.currentYearAvgPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

    if (item.earnings.div > 0 || item.earnings.jcp > 0 || item.earnings.rend > 0) {
      markdown += `#### 💰 Rendimentos Recebidos em ${data.year}\n`;
      if (item.earnings.div > 0) {
        markdown += `- **Dividendos:** R$ ${item.earnings.div.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      }
      if (item.earnings.jcp > 0) {
        markdown += `- **Juros sobre Capital Próprio (JCP):** R$ ${item.earnings.jcp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      }
      if (item.earnings.rend > 0) {
        markdown += `- **Rendimentos:** R$ ${item.earnings.rend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  markdown += `\n*Relatório gerado em ${new Date().toLocaleString('pt-BR')}*`;
  return markdown;
}
