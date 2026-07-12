'use client';

import { useState, useRef, useEffect } from 'react';
import { saveUser } from './actions';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

type UserModalProps = {
  user?: any; // null if creating
  roles: any[];
  organizations: any[];
  isOpen: boolean;
  onClose: () => void;
};

export function UserModal({ user, roles, organizations, isOpen, onClose }: UserModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error("Harap isi semua informasi pengguna yang wajib diisi.");
      return;
    }

    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveUser(formData, user?.id);

    if (result.success) {
      toast.success(user ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan');
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
      <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <h2 className="text-xl font-black text-foreground">
            {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
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
              <label className="block text-sm font-bold text-foreground mb-1.5">Nama Lengkap</label>
              <input 
                name="name" 
                defaultValue={user?.name} 
                required 
                placeholder="Masukkan nama lengkap pengguna"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Alamat Email</label>
              <input 
                name="email" 
                type="email"
                defaultValue={user?.email} 
                required 
                placeholder="email@kampus.id"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Kata Sandi (Password)
                {user && <span className="text-muted-foreground text-xs font-normal ml-2">(Kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  required={!user}
                  placeholder={user ? "Biarkan kosong untuk mempertahankan password lama" : "Minimal 6 karakter"}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Peran (Role)</label>
                <div className="relative">
                  <select 
                    name="roleId" 
                    defaultValue={user?.role?.id || ''} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                  >
                    <option value="" disabled>Pilih Peran</option>
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Organisasi (Opsional)</label>
                <div className="relative">
                  <select 
                    name="organizationId" 
                    defaultValue={user?.organization?.id || ''} 
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Tidak ada Organisasi</option>
                    {organizations.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
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
                  Simpan Pengguna
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
