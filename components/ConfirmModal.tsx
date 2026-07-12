'use client';

import { useEffect, useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDestructive = true
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>
        
        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/20">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all flex items-center gap-2 ${
              isDestructive 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
