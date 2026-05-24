export type SRVGlobalDialogType = 'alert' | 'confirm';

export interface SRVGlobalDialogState {
  isOpen: boolean;
  type: SRVGlobalDialogType;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface SRVGlobalDialogContextType {
  showAlertDialog: (message: string) => void;
  showConfirmDialog: (message: string, onConfirm: () => void) => void;
  dialogState: SRVGlobalDialogState;
  closeDialog: () => void;
}
