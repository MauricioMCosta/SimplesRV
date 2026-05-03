import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect } from "react";

type SortOrder = 'asc' | 'desc';

interface DataTableState {
  data: any[];
  page: number;
  limit: number;
  search: string;
  sortBy: string | null;
  sortOrder: SortOrder;
}

type DataTableAction = 
  | { type: 'SET_DATA', payload: any[]}
  | { type: 'SET_PAGE', payload: number }
  | { type: 'SET_LIMIT', payload: number }
  | { type: 'SET_SEARCH', payload: string }
  | { type: 'SET_SORT', payload: { field: string; order?: SortOrder } }
  | { type: 'NEXT_PAGE'}
  | { type: 'PREV_PAGE'};

function dataTableReducer(state: DataTableState, action: DataTableAction) : DataTableState {
  switch(action.type) {
    case 'SET_DATA': 
      return { ...state, data: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload, page: 1 };
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };
    case 'SET_SORT': {
      const field = action.payload.field;
      const order = action.payload.order || (state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc');
      return { ...state, sortBy: field, sortOrder: order, page: 1 };
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
  setSort: (field: string, order?: SortOrder) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  next: () => void;
  prev: () => void;
}

const DataTableContext = createContext<DataTableContextType | undefined>(undefined);

interface DataTableProviderProps {
  children: ReactNode;
  initialData?: any[];
  initialLimit?: number;
}

export function DataTableProvider({ children, initialData = [], initialLimit = 10 }: DataTableProviderProps) {
  const [state, dispatch] = useReducer(dataTableReducer, {
    data: initialData,
    page: 1,
    limit: initialLimit,
    search: '',
    sortBy: null,
    sortOrder: 'asc'
  });

  // Sync with prop changes if data is provided from outside
  useEffect(() => {
    dispatch({ type: 'SET_DATA', payload: initialData });
  }, [initialData]);

  const filteredData = useMemo(() => {
    if (!state.search) return state.data;
    const term = state.search.toLowerCase();
    return state.data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }, [state.data, state.search]);

  const sortedData = useMemo(() => {
    if (!state.sortBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[state.sortBy!];
      const bVal = b[state.sortBy!];

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
