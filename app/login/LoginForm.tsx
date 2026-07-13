'use client';

import { useActionState, useState } from 'react';
import { loginAction } from './actions';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* ELEGANT FULLSCREEN LOADING OVERLAY */}
      {pending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-bold text-zinc-900">Mengautentikasi...</p>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Mohon tunggu sebentar</p>
          </div>
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
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
              id="email"
              type="email" 
              name="email"
              required
              className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder="nama@kampus.ac.id"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
            <a className="text-sm font-semibold text-primary hover:text-accent transition-colors" href="#">Forgot Password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              name="password"
              required
              className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-11 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
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
