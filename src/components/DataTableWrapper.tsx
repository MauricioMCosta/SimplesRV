import React, { ReactNode } from "react";
import { DataTableProvider } from "../context/DataTableContext";

interface DataTableWrapperProps {
  children: ReactNode;
  initialData: any[];
  initialLimit?: number;
  columns?: any;
}

export const DataTableWrapper: React.FC<DataTableWrapperProps> = ({ children, initialData, initialLimit, columns }) => {
  return (
    <DataTableProvider initialData={initialData} initialLimit={initialLimit} columns={columns}>
      {children}
    </DataTableProvider>
  );
};
