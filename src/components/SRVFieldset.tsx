import React from 'react';
import { cn } from '@/src/lib/utils';

export interface SRVFieldsetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  bulletClassName?: string;
  titleClassName?: string;
  hasBorderTop?: boolean;
}

export function SRVFieldset({
  title,
  bulletClassName = 'bg-brand-accent',
  titleClassName = 'text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2',
  hasBorderTop = false,
  className,
  children,
  ...props
}: SRVFieldsetProps) {
  return (
    <div
      className={cn(
        hasBorderTop && "pt-4 border-t border-brand-line",
        children && "space-y-4",
        className
      )}
      {...props}
    >
      <h2 className={titleClassName}>
        <span className={cn("w-1.5 h-3 rounded-full inline-block shrink-0", bulletClassName)} />
        {title}
      </h2>
      {children}
    </div>
  );
}
