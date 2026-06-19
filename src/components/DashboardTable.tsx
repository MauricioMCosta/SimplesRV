import { useContext, useMemo } from 'react';
import { cn } from '@/src/lib/utils';
import { Trash2, Edit2, ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { DataTableContext } from '../context/DataTableContext';
import { DashboardTableProps } from './DashboardTable.types';
import { filterAST } from '../lib/filterParser';

export function DashboardTable({ heading, data = [], columns, onEdit, onDelete, onColumnRender }: DashboardTableProps) {
  const context = useContext(DataTableContext);
  const columnKeys = Object.keys(columns);

  // If context exists, use its displayData. Otherwise fall back to prop data.
  const sourceData = context ? context.displayData : data;

  const isAstActive = useMemo(() => {
    if (!context || !context.search || !context.search.trim()) return false;
    const ast = filterAST(context.search);
    return ast && ast.type !== 'EMPTY';
  }, [context?.search]);

  return (
    <div className="card !p-0 overflow-hidden">
      <header className="p-5 border-b border-brand-line flex flex-col gap-4 bg-white">
        {/* Line 1: Title and Access/Action Buttons */}
        <div className="w-full flex justify-between items-center">
          {typeof heading === 'string' ? (
            <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">{heading}</h3>
          ) : (
            heading
          )}
        </div>

        {/* Line 2: Single Consolidated Smart Search & Filter */}
        {context && (
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Busca rápida ou filtro avançado (ex: ticker = 'KLBN11' AND :tipo: = 'BUY')..."
                className="w-full pl-9 pr-32 py-2 bg-slate-50 border border-brand-line rounded text-xs font-mono outline-none focus:bg-white focus:border-brand-accent transition-all"
                value={context.search}
                onChange={(e) => context.setSearch(e.target.value)}
                title="Sintaxe de Filtro Avançado: campo = 'valor' AND (campo2 >= numero OR :nome da coluna: ~ 'padrao*')"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
                {isAstActive ? (
                  <span className="text-[9px] font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    Filtro AST Ativo
                  </span>
                ) : context.search.trim() ? (
                  <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    Busca Rápida
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-300">
                    AST / Texto
                  </span>
                )}
              </div>
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
                      align === 'right' ? 'text-right align-middle py-3' : 'text-left align-middle py-3'
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
                    </div>
                  </th>
                );
              })}
              {(onEdit || onDelete) && <th className="text-right align-middle py-3">Ações</th>}
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

                    const customRender = onColumnRender ? onColumnRender(row.data, key, val) : null;

                    return (
                      <td 
                        key={key} 
                        className={cn(
                          "text-[12px]",
                          align === 'right' && "text-right font-mono",
                          customRender?.cellStyle
                        )}
                      >
                        {customRender?.cellValue !== undefined ? customRender.cellValue : displayVal}
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
