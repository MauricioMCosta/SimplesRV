import { ReactNode } from "react";

export interface ColumnSettings {
  label: string;
  type?: 'string' | 'number';
  align?: 'left' | 'right';
  formatOptions?: Intl.NumberFormatOptions;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
}

export interface RowData {
  [key: string]: any;
}

export interface TableRow {
  data: RowData;
  flags?: {
    canEdit?: boolean;
    canDelete?: boolean;
  };
}

export interface DashboardTableProps {
  heading: ReactNode;
  data?: TableRow[];
  columns: { [key: string]: string | ColumnSettings };
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  onColumnRender?: (row: RowData, columnKey: string, value: any) => { cellStyle?: string; cellValue?: ReactNode } | undefined | null;
}
