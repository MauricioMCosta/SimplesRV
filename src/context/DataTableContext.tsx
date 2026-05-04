import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect } from "react";

type SortOrder = 'asc' | 'desc';

interface DataTableState {
  data: any[];
  page: number;
  limit: number;
  search: string;
  filters: Record<string, string>;
  sortBy: string | null;
  sortOrder: SortOrder;
}

type DataTableAction = 
  | { type: 'SET_DATA', payload: any[]}
  | { type: 'SYNC_DATA', payload: any[]}
  | { type: 'SET_PAGE', payload: number }
  | { type: 'SET_LIMIT', payload: number }
  | { type: 'SET_SEARCH', payload: string }
  | { type: 'SET_FILTER', payload: { key: string; value: string } }
  | { type: 'SET_SORT', payload: { field: string; order?: SortOrder } }
  | { type: 'NEXT_PAGE'}
  | { type: 'PREV_PAGE'};

function dataTableReducer(state: DataTableState, action: DataTableAction) : DataTableState {
  switch(action.type) {
    case 'SET_DATA': 
      return { ...state, data: action.payload, page: 1 };
    case 'SYNC_DATA':
      return { ...state, data: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload, page: 1 };
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };
    case 'SET_FILTER': {
      const newFilters = { ...state.filters, [action.payload.key]: action.payload.value };
      if (!action.payload.value) delete newFilters[action.payload.key];
      return { ...state, filters: newFilters, page: 1 };
    }
    case 'SET_SORT': {
      const field = action.payload.field;
      let newSortBy: string | null = field;
      let newSortOrder: SortOrder = 'asc';

      if (state.sortBy === field) {
        if (state.sortOrder === 'asc') {
          newSortOrder = 'desc';
        } else {
          newSortBy = null; // Cycle back to no sort
        }
      }

      return { ...state, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 };
    }
    case 'NEXT_PAGE': 
      return { ...state, page: state.page + 1 };
    case 'PREV_PAGE': 
      return { ...state, page: Math.max(1, state.page - 1) };
    default: return state;
  }
}

interface DataTableContextType extends DataTableState {
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

export const DataTableContext = createContext<DataTableContextType | undefined>(undefined);

interface DataTableProviderProps {
  children: ReactNode;
  initialData?: any[];
  initialLimit?: number;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataTableProvider({ children, initialData = [], initialLimit = 10 }: DataTableProviderProps) {
  const [state, dispatch] = useReducer(dataTableReducer, {
    data: initialData,
    page: 1,
    limit: initialLimit,
    search: '',
    filters: {},
    sortBy: null,
    sortOrder: 'asc'
  });

  // Sync with prop changes if data is provided from outside
  useEffect(() => {
    // Only reset page 1 if data length changed significantly or if it's the initial load
    // For simple updates (like price changes), we use SYNC_DATA to keep current page
    if (state.data.length === 0 && initialData.length > 0) {
      dispatch({ type: 'SET_DATA', payload: initialData });
    } else {
      dispatch({ type: 'SYNC_DATA', payload: initialData });
    }
  }, [initialData]);

  const filteredData = useMemo(() => {
    let result = state.data;

    // Apply column filters
    if (Object.keys(state.filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(state.filters).every(([key, value]) => {
          // Since DashboardTable uses "data.key" for nested access, 
          // but filters might be passed as plain keys or deep keys, 
          // we should handle both.
          const val = getNestedValue(item, key);
          return !value || String(val) === value;
        });
      });
    }

    // Apply search
    if (state.search) {
      const term = state.search.toLowerCase();
      const searchIn = (item: any): boolean => {
        if (item === null || item === undefined) return false;
        if (typeof item !== 'object') return String(item).toLowerCase().includes(term);
        return Object.values(item).some(val => searchIn(val));
      };
      result = result.filter(searchIn);
    }

    return result;
  }, [state.data, state.search, state.filters]);

  const sortedData = useMemo(() => {
    if (!state.sortBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, state.sortBy!);
      const bVal = getNestedValue(b, state.sortBy!);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const sA = String(aVal || '').toLowerCase();
      const sB = String(bVal || '').toLowerCase();
      
      if (sA < sB) return state.sortOrder === 'asc' ? -1 : 1;
      if (sA > sB) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, state.sortBy, state.sortOrder]);

  const displayData = useMemo(() => {
    const start = (state.page - 1) * state.limit;
    return sortedData.slice(start, start + state.limit);
  }, [sortedData, state.page, state.limit]);

  const totalPages = Math.ceil(sortedData.length / state.limit);

  const value: DataTableContextType = {
    ...state,
    displayData,
    totalRecords: sortedData.length,
    totalPages,
    setSearch: (payload) => dispatch({ type: 'SET_SEARCH', payload }),
    setFilter: (key, value) => dispatch({ type: 'SET_FILTER', payload: { key, value } }),
    setSort: (field, order) => dispatch({ type: 'SET_SORT', payload: { field, order } }),
    setPage: (payload) => dispatch({ type: 'SET_PAGE', payload }),
    setLimit: (payload) => dispatch({ type: 'SET_LIMIT', payload }),
    next: () => dispatch({ type: 'NEXT_PAGE' }),
    prev: () => dispatch({ type: 'PREV_PAGE' }),
  };

  return (
    <DataTableContext.Provider value={value}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTable() {
  const context = useContext(DataTableContext);
  if (context === undefined) {
    throw new Error('useDataTable must be used within a DataTableProvider');
  }
  return context;
}
