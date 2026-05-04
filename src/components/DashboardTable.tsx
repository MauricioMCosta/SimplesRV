import { ReactNode, useState, useContext } from 'react';
import { cn } from '@/src/lib/utils';
import { Trash2, Edit2, ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { DataTableContext } from '../context/DataTableContext';

export interface ColumnSettings {
  label: string;
  type?: 'string' | 'number';
  align?: 'left' | 'right';
  formatOptions?: Intl.NumberFormatOptions;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
}

interface RowData {
  [key: string]: any;
}

interface TableRow {
  data: RowData;
  flags?: {
    canEdit?: boolean;
    canDelete?: boolean;
  };
}

interface DashboardTableProps {
  heading: ReactNode;
  data?: TableRow[];
  columns: { [key: string]: string | ColumnSettings };
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
}

export function DashboardTable({ heading, data = [], columns, onEdit, onDelete }: DashboardTableProps) {
  const context = useContext(DataTableContext);
  const columnKeys = Object.keys(columns);

  const handleFilterChange = (key: string, value: string) => {
    if (context) {
      context.setFilter(`data.${key}`, value);
    }
  };

  // If context exists, use its displayData. Otherwise fall back to prop data.
  const sourceData = context ? context.displayData : data;

  return (
    <div className="card !p-0 overflow-hidden">
      <header className="p-5 border-b border-brand-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div className="flex-1">
          {typeof heading === 'string' ? (
            <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">{heading}</h3>
          ) : (
            heading
          )}
        </div>

        {context && (
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filtrar..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-brand-line rounded text-xs outline-none focus:border-brand-accent transition-colors"
                value={context.search}
                onChange={(e) => context.setSearch(e.target.value)}
              />
            </div>
          </div>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columnKeys.map((key) => {
                const col = columns[key];
                const label = typeof col === 'string' ? col : col.label;
                const align = typeof col === 'string' ? 'left' : col.align || 'left';
                return (
                  <th 
                    key={key} 
                    className={cn(
                      align === 'right' ? 'text-right align-top' : 'text-left align-top'
                    )}
                  >
                    <div className={cn("flex flex-col gap-1.5", align === 'right' && "items-end")}>
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-tighter">{label}</span>
                        {context && (
                          <button
                            type="button"
                            onClick={() => context.setSort(`data.${key}`)}
                            className={cn(
                              "p-1 rounded hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-brand-accent outline-none",
                              context.sortBy === `data.${key}` ? "text-brand-accent bg-blue-50/50" : "text-slate-300 opacity-20 group-hover:opacity-100"
                            )}
                            title={
                              context.sortBy === `data.${key}` 
                                ? (context.sortOrder === 'asc' ? "Ordenar Descendente" : "Limpar Ordenação")
                                : "Ordenar Ascendente"
                            }
                          >
                            {context.sortBy === `data.${key}` ? (
                              context.sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                            ) : (
                              <ArrowUpDown size={12} className="opacity-50" />
                            )}
                          </button>
                        )}
                      </div>
                      {typeof col !== 'string' && col.filterable && col.filterOptions && (
                        <select
                          className="bg-white border border-brand-line rounded text-[10px] font-mono outline-none px-1 py-1 text-slate-600 font-normal max-w-[120px]"
                          value={(context?.filters[`data.${key}`]) || ''}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                          onClick={(e) => e.stopPropagation()} // Prevent sort trigger
                        >
                          <option value="">Todos</option>
                          {col.filterOptions.map((opt: any) => {
                            const optionLabel = typeof opt === 'string' ? opt : opt.label;
                            const optionValue = typeof opt === 'string' ? opt : opt.value;
                            return (
                              <option key={optionValue} value={optionValue}>{optionLabel}</option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  </th>
                );
              })}
              {(onEdit || onDelete) && <th className="text-right align-top">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {sourceData.length === 0 ? (
              <tr>
                <td colSpan={columnKeys.length + (onEdit || onDelete ? 1 : 0)} className="p-10 text-center text-slate-400 italic text-[11px]">
                  Nenhum dado encontrado.
                </td>
              </tr>
            ) : (
              sourceData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-50 transition-colors">
                  {columnKeys.map((key) => {
                    const val = row.data[key];
                    const col = columns[key];
                    const type = typeof col === 'string' ? 'string' : col.type || 'string';
                    const align = typeof col === 'string' ? 'left' : col.align || 'left';
                    const formatOptions = typeof col === 'string' ? undefined : col.formatOptions;

                    let displayVal = val;

                    if (type === 'number' && typeof val === 'number') {
                      displayVal = val.toLocaleString(undefined, formatOptions);
                    }

                    return (
                      <td 
                        key={key} 
                        className={cn(
                          "text-[12px]",
                          align === 'right' && "text-right font-mono",
                          key === 'ticker' && "font-bold text-brand-ink font-mono",
                          key === 'date' && "text-[11px] text-slate-500 font-mono italic",
                          key === 'balance' && val >= 0 ? "text-green-600" : key === 'balance' && "text-red-600",
                          key === 'profit' && val >= 0 ? "text-green-600 font-bold" : key === 'profit' && "text-red-600 font-bold"
                        )}
                      >
                        {key === 'type' ? (
                           <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded",
                            val === 'BUY' || val === 'DAY' ? "bg-green-100 text-green-700" : 
                            val === 'SELL' || val === 'SWING' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                          )}>
                            {val}
                          </span>
                        ) : key === 'status' ? (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                            val === 'CONSOLIDADO' ? "bg-blue-100 text-blue-700" : 
                            val === 'OK' ? "bg-green-100 text-green-700" : 
                            "bg-amber-100 text-amber-700"
                          )}>
                            {val}
                          </span>
                        ) : (
                          displayVal
                        )}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        {onEdit && row.flags?.canEdit !== false && (
                          <button
                            onClick={() => onEdit(row.data)}
                            className="p-1.5 text-slate-300 hover:text-brand-accent transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {onDelete && row.flags?.canDelete !== false && (
                          <button
                            onClick={() => onDelete(row.data)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {context && context.totalPages > 1 && (
        <footer className="p-4 border-t border-brand-line bg-slate-50 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-mono">
            PÁGINA {context.page} DE {context.totalPages} | {context.totalRecords} REGISTROS
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => context.prev()}
              disabled={context.page === 1}
              className="p-1.5 rounded border border-brand-line hover:bg-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => context.next()}
              disabled={context.page === context.totalPages}
              className="p-1.5 rounded border border-brand-line hover:bg-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
