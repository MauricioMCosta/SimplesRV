export interface ReportResult {
  title: string;
  markdown: string;
  generatedAt: Date;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<string>;
}

import { equitySummaryReport } from './equitySummary';
import { profitByTickerReport } from './profitByTicker';
import { annualizedPositionsReport } from './annualizedPositions';

export const reports: ReportDefinition[] = [
  equitySummaryReport,
  profitByTickerReport,
  annualizedPositionsReport,
];
