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
