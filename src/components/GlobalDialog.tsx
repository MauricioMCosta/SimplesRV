import React from 'react';
import { useDialog } from '../context/DialogContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export function GlobalDialog() {
  const { dialogState, closeDialog } = useDialog();

  return (
    <AnimatePresence>
      {dialogState.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {dialogState.type === 'alert' ? 
                  <AlertCircle className="text-amber-500" size={24} /> :
                  <CheckCircle className="text-blue-500" size={24} />
                }
                <h3 className="text-sm font-bold text-slate-800 uppercase">
                  {dialogState.type === 'alert' ? 'Atenção' : 'Confirmação'}
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">{dialogState.message}</p>
              
              <div className="flex justify-end gap-3">
                {dialogState.type === 'confirm' && (
                  <button
                    onClick={dialogState.onCancel}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                  >
                    CANCELAR
                  </button>
                )}
                <button
                  onClick={dialogState.onConfirm}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded hover:bg-slate-900"
                >
                  {dialogState.type === 'alert' ? 'OK' : 'CONFIRMAR'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
