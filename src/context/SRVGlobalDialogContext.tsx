import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SRVGlobalDialogState, SRVGlobalDialogContextType } from './SRVGlobalDialogContext.types';

export const SRVGlobalDialogContext = createContext<SRVGlobalDialogContextType | undefined>(undefined);

export const SRVGlobalDialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogState, setDialogState] = useState<SRVGlobalDialogState>({
    isOpen: false,
    type: 'alert',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlertDialog = (message: string) => {
    setDialogState({
      isOpen: true,
      type: 'alert',
      message,
      onConfirm: () => closeDialog(),
      onCancel: () => closeDialog(),
    });
  };

  const showConfirmDialog = (message: string, onConfirm: () => void) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      message,
      onConfirm: () => {
        onConfirm();
        closeDialog();
      },
      onCancel: () => closeDialog(),
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <SRVGlobalDialogContext.Provider value={{ showAlertDialog, showConfirmDialog, dialogState, closeDialog }}>
      {children}
    </SRVGlobalDialogContext.Provider>
  );
};

export const useSRVGlobalDialog = () => {
  const context = useContext(SRVGlobalDialogContext);
  if (!context) {
    throw new Error('useSRVGlobalDialog must be used within a SRVGlobalDialogProvider');
  }
  return context;
};
