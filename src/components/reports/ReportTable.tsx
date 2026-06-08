import React from 'react';
import { cn } from '@/src/lib/utils';

// Helper to clean up react-markdown specific properties like 'node'
interface MarkdownComponentProps {
  node?: any;
  children?: React.ReactNode;
  className?: string;
}

export function ReportTable({ node, children, className, ...props }: React.TableHTMLAttributes<HTMLTableElement> & MarkdownComponentProps) {
  return (
    <div className="w-full overflow-x-auto my-6 border border-brand-line rounded-lg shadow-xs bg-white">
      <table className={cn("w-full text-[13px] border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function ReportThead({ node, children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & MarkdownComponentProps) {
  return (
    <thead className={cn("bg-brand-bg text-left border-b border-brand-line text-[10px] uppercase font-bold text-slate-500 tracking-wider", className)} {...props}>
      {children}
    </thead>
  );
}

export function ReportTbody({ node, children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & MarkdownComponentProps) {
  return (
    <tbody className={cn("divide-y divide-brand-line bg-white font-normal text-slate-700", className)} {...props}>
      {children}
    </tbody>
  );
}

export function ReportTr({ node, children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement> & MarkdownComponentProps) {
  return (
    <tr className={cn("hover:bg-slate-50/70 transition-colors duration-150 ease-in-out", className)} {...props}>
      {children}
    </tr>
  );
}

export function ReportTh({ node, children, style, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & MarkdownComponentProps) {
  // Extract text alignment from element style passed down by react-markdown
  const alignClass = style?.textAlign === 'right' 
    ? 'text-right' 
    : style?.textAlign === 'center' 
    ? 'text-center' 
    : 'text-left';
    
  return (
    <th 
      className={cn("p-3 font-bold text-slate-600 font-sans border-b border-brand-line", alignClass, className)} 
      style={style} 
      {...props}
    >
      {children}
    </th>
  );
}

export function ReportTd({ node, children, style, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & MarkdownComponentProps) {
  const alignClass = style?.textAlign === 'right' 
    ? 'text-right font-mono' 
    : style?.textAlign === 'center' 
    ? 'text-center font-mono' 
    : 'text-left';

  return (
    <td 
      className={cn("p-3 text-[12px] font-sans antialiased text-slate-800 leading-relaxed font-normal", alignClass, className)} 
      style={style} 
      {...props}
    >
      {children}
    </td>
  );
}
