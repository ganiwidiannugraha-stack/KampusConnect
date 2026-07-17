'use server';

// Ini ngasih tau Next.js kalau file ini tuh khusus jalan di server-side (Backend).
// Jadi kode-kode di sini nggak bakal dikirim ke browser pengguna, aman dari hacker iseng.

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Mengambil kunci-kunci akses ke database Supabase dari file .env (environment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Service Key itu ibarat kunci master (Admin) yang bisa nge-bypass aturan keamanan (RLS) di database.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Klien biasa buat ambil data umum
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Klien master buat ngambil data user/profile (karena profil itu kadang dilindungi aturan RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Fungsi Utama: Buat ngecek "Siapa sih yang lagi buka web ini sekarang?"
// Fungsi ini dipanggil di hampir semua halaman buat nentuin menu apa aja yang boleh dia lihat.
export async function getCurrentUser() {
  // 1. Cek isi cookies (brankas kecil di browser) buat nyari token sesi login
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  // Kalau tokennya nggak ada, berarti dia belum login. Langsung balikin null.
  if (!token) return null;
  
  // 2. Tukerin token tadi ke Supabase buat ngecek akun auth (email/password)-nya masih valid nggak
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null; // Token kedaluwarsa atau palsu

  // 3. Ambil data profil tambahannya (Nama lengkap, jabatan, organisasi, dll) dari tabel 'profiles'
  // Di sini pake supabaseAdmin (Kunci Master) biar dijamin dapet datanya.
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, nama, id_organisasi, roles(name)')
    .eq('id', user.id)
    .single();

  // 4. Kalau datanya ketemu, kita rapihin formatnya (mapping) biar frontend gampang makainya
  if (profile) {
    // Ngecek apakah role/jabatannya itu 'Administrator'
    const isAdmin = profile.roles && (profile.roles as any).name === 'Administrator';
    
    return {
      id: profile.id, // ID unik dari Supabase (UUID)
      name: profile.nama, // Nama lengkap mahasiswa/dosen
      role: {
        canAccessDashboard: isAdmin, // Kalau true, dia bisa buka menu /admin
      },
      organization: profile.id_organisasi ? { id: profile.id_organisasi } : null, // UKM/Hima tempat dia bernaung
    };
  }
  
  // Kalau ternyata user-nya ada tapi profilnya nggak ketemu di database (mungkin kehapus), anggap belum login.
  return null;
}

// Fungsi simpel buat Logout.
// Kerjanya cuma ngehapus tiket/token yang disimpen di cookies, trus lempar user balik ke halaman depan (beranda).
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('supabase-session');
  redirect('/');
}
