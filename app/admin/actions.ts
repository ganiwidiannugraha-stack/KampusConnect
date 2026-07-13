'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
 * Verifikasi bahwa caller adalah admin.
 * Dipakai sebagai guard di setiap mutation admin.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

export async function getBookings() {
  const authClient = await getAuthClient();
  const { data: bookings, error } = await authClient
    .from('bookings')
    .select(`
      id,
      room:rooms (
        name
      ),
      user:profiles (
        name,
        email
      ),
      date,
      start_time,
      end_time,
      reason,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  
  return (bookings || []).map((b: any) => ({
    ...b,
    startTime: b.start_time,
    endTime: b.end_time
  }));
}

export async function updateBookingStatus(bookingId: string, status: 'DISETUJUI' | 'DITOLAK') {
  // Guard: hanya admin yang boleh approve/reject
  const { authorized, user: admin } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat memproses reservasi.' };
  }

  // Validasi input
  if (!bookingId || !['DISETUJUI', 'DITOLAK'].includes(status)) {
    return { success: false, message: 'Parameter tidak valid.' };
  }

  const authClient = await getAuthClient();

  const { error } = await authClient
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
    
  if (!error) {
    // Insert into approvals log
    await authClient.from('approvals').insert({
      booking_id: bookingId,
      admin_id: admin?.id || null,
      status: status,
      notes: "Diproses oleh Admin Dashboard"
    });

    revalidatePath('/admin');
    revalidatePath('/admin/schedule');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan' };
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

export async function getDashboardStats() {
  const authClient = await getAuthClient();
  
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
