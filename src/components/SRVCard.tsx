import React, { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export interface SRVCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  title?: string;
  content?: ReactNode;
  footer?: ReactNode;
  titleClassName?: string;
}

export function SRVCard({
  title,
  content,
  footer,
  titleClassName,
  className,
  children,
  ...props
}: SRVCardProps) {
  return (
    <div className={cn("card shadow-sm", className)} {...props}>
      {title && (
        <div className={cn("card-title", titleClassName)}>
          {title}
        </div>
      )}
      
      {content !== undefined && (
        <div className="stat-value">
          {content}
        </div>
      )}

      {children}

      {footer && (
        <div className="card-helper">
          {footer}
        </div>
      )}
    </div>
  );
}
