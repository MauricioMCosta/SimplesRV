import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-brand-line"
            >
              <header className="px-6 py-4 border-b border-brand-line flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </header>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
