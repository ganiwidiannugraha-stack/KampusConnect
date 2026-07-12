'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function getMyBookings() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      rooms (
        name
      ),
      date,
      start_time,
      end_time,
      reason,
      status,
      created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }

  return bookings.map(b => ({
    ...b,
    room: b.rooms,
    startTime: b.start_time,
    endTime: b.end_time,
    createdAt: b.created_at
  }));
}

export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Harap login terlebih dahulu' };

  // Validasi format UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(bookingId)) {
    return { success: false, message: 'ID reservasi tidak valid' };
  }

  // Get booking to check date & ownership
  const { data: booking, error: getError } = await supabaseAdmin
    .from('bookings')
    .select('id, date, status, user_id')
    .eq('id', bookingId)
    .single();
  
  if (getError || !booking) {
    return { success: false, message: 'Reservasi tidak ditemukan' };
  }

  // Ownership check: user hanya bisa batalkan miliknya sendiri
  if (booking.user_id !== user.id) {
    return { success: false, message: 'Anda tidak berhak membatalkan reservasi ini' };
  }

  if (booking.status === 'DITOLAK' || booking.status === 'DIBATALKAN') {
    return { success: false, message: 'Reservasi sudah tidak aktif' };
  }

  // Cek batas H-1
  const bookingDate = new Date(booking.date);
  const today = new Date();
  
  bookingDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays <= 1) {
    return { success: false, message: 'Pembatalan maksimal dilakukan H-1 sebelum tanggal penggunaan ruangan' };
  }

  // Gunakan auth client agar tunduk pada RLS
  const authClient = await getAuthClient();
  const { error: updateError } = await authClient
    .from('bookings')
    .update({ status: 'DIBATALKAN' })
    .eq('id', bookingId);
  
  if (!updateError) {
    return { success: true, message: 'Reservasi berhasil dibatalkan' };
  }
  
  return { success: false, message: updateError.message || 'Gagal membatalkan reservasi' };
}
