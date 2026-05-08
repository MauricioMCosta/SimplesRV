import { ReactNode } from "react";

export type SortOrder = 'asc' | 'desc';

export interface DataTableState {
  data: any[];
  page: number;
  limit: number;
  search: string;
  filters: Record<string, string>;
  sortBy: string | null;
  sortOrder: SortOrder;
}

export type DataTableAction = 
  | { type: 'SET_DATA', payload: any[]}
  | { type: 'SYNC_DATA', payload: any[]}
  | { type: 'SET_PAGE', payload: number }
  | { type: 'SET_LIMIT', payload: number }
  | { type: 'SET_SEARCH', payload: string }
  | { type: 'SET_FILTER', payload: { key: string; value: string } }
  | { type: 'SET_SORT', payload: { field: string; order?: SortOrder } }
  | { type: 'NEXT_PAGE'}
  | { type: 'PREV_PAGE'};

export interface DataTableContextType extends DataTableState {
  displayData: any[];
  totalRecords: number;
  totalPages: number;
  setSearch: (term: string) => void;
  setFilter: (key: string, value: string) => void;
  setSort: (field: string, order?: SortOrder) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  next: () => void;
  prev: () => void;
}

export interface DataTableProviderProps {
  children: ReactNode;
  initialData?: any[];
  initialLimit?: number;
}
