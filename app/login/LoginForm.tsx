'use client';

import { useActionState, useState, startTransition } from 'react';
import { loginAction } from './actions';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSSOModal, setShowSSOModal] = useState(false);

  const handleSSOLogin = (email: string) => {
    setShowSSOModal(false);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', 'KampusConnect2026!');
    
    startTransition(() => {
      formAction(formData);
    });
  };

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
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">Alamat Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
              id="email"
              type="email" 
              name="email"
              defaultValue={state?.email || ''}
              required
              className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder="nama@kampus.ac.id"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">Kata Sandi</label>
            <Link className="text-sm font-semibold text-primary hover:text-accent transition-colors" href="/forgot-password">Lupa Sandi?</Link>
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

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative bg-white dark:bg-slate-900 px-4 text-xs uppercase font-bold tracking-widest text-slate-400">
            Atau
          </div>
        </div>

        <button 
          type="button"
          onClick={() => setShowSSOModal(true)}
          className="w-full h-11 mt-4 inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Masuk dengan Akun Kampus
        </button>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Gunakan <strong>admin.utama@kampus.ac.id</strong> untuk Admin.<br />
          Gunakan <strong>rina.permata@kampus.ac.id</strong> untuk Mahasiswa.<br />
          <span className="text-xs">Password: <strong>KampusConnect2026!</strong></span>
        </div>
      </form>

      {/* MODAL SIMULASI SSO GOOGLE */}
      {showSSOModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center border-b border-slate-100">
              <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h3 className="text-xl font-medium text-slate-900">Sign in with Google</h3>
              <p className="text-slate-600 mt-1">Choose an account to continue to KampusConnect</p>
            </div>
            
            <div className="p-2">
              <div className="px-4 pt-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Demo Mode: Simulated SSO
              </div>
              
              <button 
                type="button"
                onClick={() => handleSSOLogin('admin.utama@kampus.ac.id')}
                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">Admin Utama</div>
                  <div className="text-xs text-slate-500 truncate">admin.utama@kampus.ac.id</div>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => handleSSOLogin('rina.permata@kampus.ac.id')}
                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left mt-1"
              >
                <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">Rina Permata</div>
                  <div className="text-xs text-slate-500 truncate">rina.permata@kampus.ac.id</div>
                </div>
              </button>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                type="button"
                onClick={() => setShowSSOModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
