import React, { ReactNode } from "react";
import { DataTableProvider } from "../context/DataTableContext";

interface DataTableWrapperProps {
  children: ReactNode;
  initialData: any[];
  initialLimit?: number;
}

export const DataTableWrapper: React.FC<DataTableWrapperProps> = ({ children, initialData, initialLimit }) => {
  return (
    <DataTableProvider initialData={initialData} initialLimit={initialLimit}>
      {children}
    </DataTableProvider>
  );
};
