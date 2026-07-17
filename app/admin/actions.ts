'use server';

/**
 * @file actions.ts
 * @description Mendefinisikan seluruh Server Actions (RPCs) yang digunakan oleh Dashboard Admin.
 * Fungsi-fungsi ini berjalan eksklusif di runtime Node.js / Edge, memastikan bahwa 
 * logika sensitif dan interaksi database tidak pernah terekspos ke bundle klien.
 */
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

// Ensure required environment variables are present to prevent silent failures at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Menginstansiasi Supabase client terautentikasi memanfaatkan `cookies()` dari Next.js App Router.
 * Pendekatan ini menjamin bahwa kebijakan Row Level Security (RLS) dievaluasi dengan tepat
 * berdasarkan konteks sesi pengguna yang sedang aktif.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>} Instansi Supabase client dengan header autentikasi.
 */
async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

/**
 * Authorization Guard: Memvalidasi apakah identitas pemanggil (caller) memiliki 
 * hak istimewa yang cukup untuk mengeksekusi prosedur administratif.
 * 
 * @returns {Promise<{authorized: boolean, user: any}>} Tuple yang berisi status otorisasi dan payload pengguna.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    // Mekanisme Fail-closed: secara default menolak akses jika konteks otorisasi tidak lengkap.
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

/**
 * Mengambil daftar reservasi fasilitas beserta relasinya.
 * Memanfaatkan kapabilitas foreign key join Supabase untuk memuat data relasional (rooms & profiles) secara efisien.
 * 
 * @todo Implementasikan cursor-based pagination untuk rendering dataset skala besar yang lebih efisien.
 * @returns {Promise<Array<any>>} Array berisi entitas reservasi yang sudah dinormalisasi.
 */
export async function getBookings() {
  const authClient = await getAuthClient();
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
    .order('tanggal_pengajuan', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[Action: getBookings] Eksekusi query gagal:', error.message);
    return [];
  }
  
  // Layer Normalisasi: memetakan struktur DB V2 ke UI frontend (BookingList)
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

export async function updateBookingStatus(bookingId: string, status: 'Disetujui' | 'Ditolak') {
  // 1. Fase Otorisasi
  const { authorized, user: admin } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat memproses reservasi.' };
  }

  // 2. Validasi
  if (!bookingId || !['Disetujui', 'Ditolak'].includes(status)) {
    return { success: false, message: 'Parameter tidak valid.' };
  }

  const authClient = await getAuthClient();

  // 3. Update DB
  const { error } = await authClient
    .from('reservasi')
    .update({ status })
    .eq('id_reservasi', bookingId);
    
  if (!error) {
    // 4. Audit Trail (approval)
    await authClient.from('approval').insert({
      id_reservasi: parseInt(bookingId, 10),
      id_admin: admin?.id || null,
      status: status,
      catatan: "Diproses oleh Admin Dashboard"
    });

    // 5. Invalidate Cache
    revalidatePath('/admin');
    revalidatePath('/admin/schedule');
    return { success: true };
  }
  
  console.error(`[Action: updateBookingStatus] Gagal untuk ID ${bookingId}:`, error.message);
  return { success: false, message: error.message || 'Terjadi kesalahan sistem' };
}

export async function getPendingBookingsCount() {
  const authClient = await getAuthClient();
  const { count, error } = await authClient
    .from('reservasi')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Menunggu');
    
  if (error) return 0;
  return count || 0;
}

export async function getDashboardStats() {
  const authClient = await getAuthClient();
  
  const { count: roomsCount } = await authClient
    .from('ruangan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Tersedia');

  const { count: inactiveRoomsCount } = await authClient
    .from('ruangan')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'Tersedia');

  const { count: usersCount } = await authClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return {
    totalRooms: (roomsCount || 0) + (inactiveRoomsCount || 0),
    activeRooms: roomsCount || 0,
    inactiveRooms: inactiveRoomsCount || 0,
    totalUsers: usersCount || 0
  };
}
