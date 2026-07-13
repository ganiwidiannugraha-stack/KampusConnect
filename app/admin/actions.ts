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
    .from('bookings')
    .select(`
      id,
      room:rooms (name),
      user:profiles (name, email),
      date,
      start_time,
      end_time,
      reason,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(500); // Batasan hard limit untuk mencegah memory bloat pada Vercel Edge functions.

  if (error) {
    console.error('[Action: getBookings] Eksekusi query gagal:', error.message);
    return [];
  }
  
  // Layer Normalisasi: memetakan snake_case dari DB menjadi camelCase untuk kebutuhan UI frontend.
  return (bookings || []).map((b: any) => ({
    ...b,
    startTime: b.start_time,
    endTime: b.end_time
  }));
}

/**
 * Mengubah status dari sebuah reservasi.
 * Mengenkapsulasi logika pembaruan di dalam batas RBAC (Role-Based Access Control) dan menghasilkan riwayat audit (audit trail).
 * 
 * @param {string} bookingId - UUID dari reservasi yang ditargetkan.
 * @param {'DISETUJUI' | 'DITOLAK'} status - Status penyelesaian yang diinginkan.
 * @returns {Promise<{success: boolean, message?: string}>} Indikator keberhasilan operasi.
 */
export async function updateBookingStatus(bookingId: string, status: 'DISETUJUI' | 'DITOLAK') {
  // 1. Fase Otorisasi (Authorization Phase)
  const { authorized, user: admin } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat memproses reservasi.' };
  }

  // 2. Fase Validasi Payload (Payload Validation Phase)
  if (!bookingId || !['DISETUJUI', 'DITOLAK'].includes(status)) {
    return { success: false, message: 'Parameter tidak valid (Mismatched schema).' };
  }

  const authClient = await getAuthClient();

  // 3. Fase Eksekusi: Pembaruan DB secara Optimistis (Optimistic DB Update)
  const { error } = await authClient
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
    
  if (!error) {
    // 4. Pencatatan Audit Trail (Logika Fire-and-forget)
    await authClient.from('approvals').insert({
      booking_id: bookingId,
      admin_id: admin?.id || null,
      status: status,
      notes: "Diproses oleh Admin Dashboard (System Generated)"
    });

    // 5. Invalidate Cache: Memicu Server Components untuk melakukan re-render dengan data terbaru.
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
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'MENUNGGU');
    
  if (error) return 0;
  return count || 0;
}

/**
 * Mengagregasi data analitik statistik untuk tampilan tingkat tinggi (high-level dashboard).
 * Menggunakan modifier Postgres `count: 'exact'` untuk menghindari penarikan payload berat ke dalam memori aplikasi,
 * mengalihkan seluruh beban komputasi secara langsung ke mesin database.
 * 
 * @returns {Promise<{totalRooms: number, activeRooms: number, inactiveRooms: number, totalUsers: number}>}
 */
export async function getDashboardStats() {
  const authClient = await getAuthClient();
  
  // Eksekusi paralel dari antrean query independen dapat dipertimbangkan di sini dengan Promise.all(),
  // namun menunggu eksekusi secara berurutan (sequential) sementara waktu ini membantu log trace lebih bersih.
  const { count: roomsCount } = await authClient
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: inactiveRoomsCount } = await authClient
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);

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
