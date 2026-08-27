// src/components/ui/Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Fenêtre élargie, pour la lecture d'un article de veille. */
  wide?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, wide = false }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-slate-800 pr-4">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
