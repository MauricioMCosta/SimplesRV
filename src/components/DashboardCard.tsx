import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
}

export function DashboardCard({ title, content, footer }: DashboardCardProps) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="stat-value">{content}</div>
      {footer && (
        <div className="card-helper">
          {footer}
        </div>
      )}
    </div>
  );
}
