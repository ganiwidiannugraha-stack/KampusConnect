'use client';

import { useActionState, useState } from 'react';
import { loginAction } from './actions';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* FULLSCREEN LOADING OVERLAY */}
      {pending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground">Sedang masuk...</p>
          <p className="text-sm text-muted-foreground mt-1">Mohon tunggu sebentar</p>
        </div>
      )}

      <form 
        action={formAction} 
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          if (!e.currentTarget.checkValidity()) {
            e.preventDefault();
            toast.error("Harap isi email dan kata sandi Anda dengan benar.");
          }
        }}
      >
        {state && !state.success && (
          <div className="p-3 text-sm font-medium bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg">
            {state.message}
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-foreground/80">Email</label>
          <input 
            type="email" 
            name="email"
            required
            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all" 
            placeholder="nama@kampus.ac.id"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-foreground/80">Kata Sandi</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 pr-11 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all" 
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={pending}
          className="w-full h-11 mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : 'Masuk'}
        </button>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Gunakan <strong>admin.utama@kampus.ac.id</strong> untuk Admin.<br />
          Gunakan <strong>rina.permata@kampus.ac.id</strong> untuk Mahasiswa.<br />
          <span className="text-xs">Password: <strong>KampusConnect2026!</strong></span>
        </div>
      </form>
    </>
  );
}
