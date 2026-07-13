'use client';

import { useActionState, useState } from 'react';
import { resetPasswordAction } from './actions';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);
  const [email, setEmail] = useState('');

  return (
    <main className="flex h-screen w-full bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 sm:p-10 space-y-8">
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Mail size={24} />
            </div>
            <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Lupa Sandi?</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Jangan khawatir! Masukkan alamat email yang terdaftar, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
          </div>

          {state?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <p className="text-green-800 font-medium text-sm">
                {state.message}
              </p>
              <Link 
                href="/login"
                className="inline-flex w-full items-center justify-center h-11 rounded-xl bg-white border border-green-200 text-green-700 font-bold hover:bg-green-50 transition-colors"
              >
                Kembali ke halaman Login
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-6">
              {state && !state.success && (
                <div className="p-3 text-sm font-medium bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg animate-in fade-in">
                  {state.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    id="email"
                    type="email" 
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="nama@kampus.ac.id"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={pending || !email}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim Link...
                  </>
                ) : 'Kirim Link Reset'}
              </button>
            </form>
          )}

          <div className="pt-4 flex justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
