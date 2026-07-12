'use client';

import { useState, useRef, useEffect } from 'react';
import { saveOrganization } from './actions';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

type OrganizationModalProps = {
  org?: any; // null if creating
  isOpen: boolean;
  onClose: () => void;
};

export function OrganizationModal({ org, isOpen, onClose }: OrganizationModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      toast.error("Harap isi nama organisasi terlebih dahulu.");
      return;
    }
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveOrganization(formData, org?.id);

    if (result.success) {
      toast.success(org ? 'Organisasi berhasil diperbarui' : 'Organisasi berhasil ditambahkan');
      onClose();
    } else {
      toast.error(result.message);
    }
    
    setIsSaving(false);
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <h2 className="text-xl font-black text-foreground">
            {org ? 'Edit Organisasi' : 'Tambah Organisasi Baru'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Nama Organisasi</label>
              <input 
                name="name" 
                defaultValue={org?.name} 
                required 
                placeholder="Misal: BEM Fakultas, UKM Musik, dll"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/50 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-sm transition-colors text-foreground"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
