import React from 'react';
import { cn } from '@/src/lib/utils';

export interface SRVInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  classNameLabel?: string;
}

export function SRVInput({
  label,
  type = 'text',
  className,
  classNameLabel,
  ...props
}: SRVInputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className={cn("block text-[10px] font-bold text-slate-500 uppercase tracking-tighter", classNameLabel)}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 bg-slate-50 border border-brand-line rounded text-sm font-mono outline-none focus:border-brand-accent transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}
