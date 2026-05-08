export type DialogType = 'alert' | 'confirm';

export interface DialogState {
  isOpen: boolean;
  type: DialogType;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface DialogContextType {
  showAlertDialog: (message: string) => void;
  showConfirmDialog: (message: string, onConfirm: () => void) => void;
  dialogState: DialogState;
  closeDialog: () => void;
}
