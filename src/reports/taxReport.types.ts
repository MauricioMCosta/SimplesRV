export interface TaxReportData {
  year: number;
  items: TaxReportItem[];
}

export interface TaxReportItem {
  ticker: string;
  description: string;
  custodianName: string;
  custodianCnpj: string;
  payingSourceName: string;
  payingSourceCnpj: string;
  prevYearQty: number;
  currentYearQty: number;
  currentYearAvgPrice: number;
  earnings: {
    div: number;
    jcp: number;
    rend: number;
  };
}
