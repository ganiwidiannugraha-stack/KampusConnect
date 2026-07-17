'use server';

// Baris 'use server' ini penting banget. Ini ngasih tau Next.js kalau semua fungsi di file ini 
// cuma boleh jalan di server (backend). Jadi data rahasia kayak kunci database aman dari user/browser.

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

// Mengambil kunci database dari file .env
// Pakai Service Role Key kalau ada, buat akses khusus admin biar bisa ubah data tanpa batas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Fungsi pembantu buat bikin koneksi database (Supabase) yang bawa sesi login dari cookies
// Ini penting biar database tahu siapa yang lagi nge-request (buat sistem keamanan RLS di Supabase)
async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Kalau ada token login, kita selipkan di header Authorization
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

// Fungsi ini buat ngecek apakah orang yang lagi login itu beneran admin
// Kalau bukan admin atau belum login, aksesnya bakal ditolak (return false)
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

// Fungsi buat ngambil semua data reservasi buat ditampilin di tabel admin
export async function getBookings() {
  const authClient = await getAuthClient();
  
  // Mengambil data dari tabel 'reservasi', dan sekalian ngambil nama ruangan dan nama peminjam 
  // (Ini namanya Foreign Key Join, biar gak usah query berulang kali)
  const { data: bookings, error } = await authClient
    .from('reservasi')
    .select(`
      id_reservasi,
      kode_reservasi,
      ruangan (nama_ruangan),
      profiles (nama),
      tanggal_pakai,
      jam_mulai,
      jam_selesai,
      jumlah_peserta,
      keperluan,
      status,
      tanggal_pengajuan,
      lampiran (id_lampiran, nama_file, file_path)
    `)
    // Urutkan dari yang paling baru diajukan
    .order('tanggal_pengajuan', { ascending: false })
    // Dibatasi 500 data aja biar website nggak ngelag kalau datanya udah ribuan
    .limit(500);

  if (error) {
    console.error('[Action: getBookings] Query gagal:', error.message);
    return [];
  }
  
  // Ngerapihin data dari database (format V2) jadi format yang gampang dibaca sama tabel di frontend
  return (bookings || []).map((b: any) => ({
    id: b.id_reservasi,
    booking_id: b.kode_reservasi,
    room: { name: b.ruangan?.nama_ruangan },
    user: { name: b.profiles?.nama },
    date: b.tanggal_pakai,
    startTime: b.jam_mulai,
    endTime: b.jam_selesai,
    reason: b.keperluan,
    jumlahPeserta: b.jumlah_peserta,
    status: b.status,
    created_at: b.tanggal_pengajuan,
    lampiran: b.lampiran || []
  }));
}

// Fungsi buat mengubah status peminjaman jadi "Disetujui" atau "Ditolak"
export async function updateBookingStatus(bookingId: string, status: 'Disetujui' | 'Ditolak') {
  // 1. Cek dulu, beneran admin gak nih yang nge-klik?
  const { authorized, user: admin } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Cuma Admin yang bisa klik ini.' };
  }

  // 2. Cek datanya bener atau gak (jangan sampai di-hack lewat inspect element)
  if (!bookingId || !['Disetujui', 'Ditolak'].includes(status)) {
    return { success: false, message: 'Data tidak valid.' };
  }

  const authClient = await getAuthClient();

  // 3. Update statusnya di database
  const { error } = await authClient
    .from('reservasi')
    .update({ status })
    .eq('id_reservasi', bookingId);
    
  if (!error) {
    // 4. Catat ke tabel history (audit trail) siapa admin yang nyetujui/nolak
    await authClient.from('approval').insert({
      id_reservasi: parseInt(bookingId, 10), // Ubah id jadi angka
      id_admin: admin?.id || null,
      status: status,
      catatan: "Diproses oleh Admin Dashboard"
    });

    // 5. Suruh Next.js buat refresh halaman tanpa perlu reload (hapus cache lama)
    revalidatePath('/admin');
    revalidatePath('/admin/schedule');
    
    return { success: true };
  }
  
  console.error(`[Action: updateBookingStatus] Gagal update:`, error.message);
  return { success: false, message: error.message || 'Gagal konek ke database' };
}

// Fungsi buat ngitung ada berapa reservasi yang statusnya masih "Menunggu"
export async function getPendingBookingsCount() {
  const authClient = await getAuthClient();
  
  // Pake 'head: true' biar database cuma ngirim jumlah angkanya aja, bukan datanya.
  // Ini bikin loading-nya super cepat buat nampilin angka di badge notifikasi.
  const { count, error } = await authClient
    .from('reservasi')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Menunggu');
    
  if (error) return 0;
  return count || 0;
}

// Fungsi buat ngambil data total buat ditampilin di kartu-kartu halaman depan admin (Dashboard)
export async function getDashboardStats() {
  const authClient = await getAuthClient();
  
  // Hitung berapa banyak ruangan yang statusnya 'Tersedia'
  const { count: roomsCount } = await authClient
    .from('ruangan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Tersedia');

  // Hitung berapa ruangan yang lagi rusak/nggak bisa dipake
  const { count: inactiveRoomsCount } = await authClient
    .from('ruangan')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'Tersedia');

  // Hitung total pengguna/mahasiswa yang udah daftar di web kita
  const { count: usersCount } = await authClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Return datanya dalam bentuk objek biar gampang dipanggil di Frontend
  return {
    totalRooms: (roomsCount || 0) + (inactiveRoomsCount || 0),
    activeRooms: roomsCount || 0,
    inactiveRooms: inactiveRoomsCount || 0,
    totalUsers: usersCount || 0
  };
}
