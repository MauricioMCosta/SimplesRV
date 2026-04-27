import React, { createContext, useContext, useState, ReactNode } from 'react';

type DialogType = 'alert' | 'confirm';

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DialogContextType {
  showAlertDialog: (message: string) => void;
  showConfirmDialog: (message: string, onConfirm: () => void) => void;
  dialogState: DialogState;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
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
    <DialogContext.Provider value={{ showAlertDialog, showConfirmDialog, dialogState, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
