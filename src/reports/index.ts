import { ReportDefinition } from './reports.types';
import { equitySummaryReport } from './equitySummary';
import { profitByTickerReport } from './profitByTicker';
import { annualizedPositionsReport } from './annualizedPositions';
import { realizedProfitsReport } from './realizedProfits';
import { getTaxReportData, formatTaxReportMarkdown } from './taxReport';

export type { ReportResult, ReportDefinition } from './reports.types';

export const reports: ReportDefinition[] = [
  {
    id: 'annual-tax-report',
    name: 'Relatório para Imposto de Renda',
    description: 'Relatório detalhado por ativo com posições de anos anteriores, preço médio e rendimentos recebidos.',
    execute: async () => {
      const year = new Date().getFullYear();
      const data = await getTaxReportData(year);
      return formatTaxReportMarkdown(data);
    }
  },
  equitySummaryReport,
  profitByTickerReport,
  annualizedPositionsReport,
  realizedProfitsReport,
];
