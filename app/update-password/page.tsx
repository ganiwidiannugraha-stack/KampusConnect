'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Inisialisasi Supabase Client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hash token diproses otomatis oleh Supabase saat komponen di-mount
  // Kita tinggal memanggil updateUser()
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok. Harap periksa kembali.");
      return;
    }
    
    setPending(true);
    setError(null);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setError("Gagal mereset kata sandi: " + error.message);
    } else {
      setSuccess(true);
    }
    
    setPending(false);
  };

  return (
    <main className="flex h-screen w-full bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 sm:p-10 space-y-8">
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Lock size={24} />
            </div>
            <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Buat Sandi Baru</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Silakan masukkan kata sandi baru untuk akun Anda. Gunakan kombinasi huruf dan angka agar lebih aman.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <p className="text-green-800 font-medium text-sm">
                Kata sandi Anda berhasil diperbarui! Anda sekarang dapat masuk menggunakan kata sandi yang baru.
              </p>
              <Link 
                href="/login"
                className="inline-flex w-full items-center justify-center h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                Masuk Sekarang
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {error && (
                <div className="p-3 text-sm font-medium bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="password">Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="confirmPassword">Konfirmasi Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="confirmPassword"
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="flex h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="Ketik ulang sandi baru"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={pending || !password || !confirmPassword}
                className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : 'Simpan Kata Sandi'}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
