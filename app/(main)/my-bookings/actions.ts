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
    .from('reservasi')
    .select(`
      id_reservasi,
      kode_reservasi,
      ruangan (
        nama_ruangan
      ),
      tanggal_pakai,
      jam_mulai,
      jam_selesai,
      jumlah_peserta,
      keperluan,
      status,
      tanggal_pengajuan,
      lampiran (id_lampiran, nama_file, file_path)
    `)
    .eq('id_user', user.id)
    .order('tanggal_pengajuan', { ascending: false });

  if (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }

  return bookings.map((b: any) => ({
    id: b.id_reservasi,
    booking_id: b.kode_reservasi,
    room: { name: b.ruangan?.nama_ruangan },
    date: b.tanggal_pakai,
    startTime: b.jam_mulai,
    endTime: b.jam_selesai,
    reason: b.keperluan,
    jumlahPeserta: b.jumlah_peserta,
    status: b.status,
    createdAt: b.tanggal_pengajuan,
    lampiran: b.lampiran || []
  }));
}

export async function cancelBooking(bookingIdStr: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Harap login terlebih dahulu' };

  const bookingId = parseInt(bookingIdStr, 10);
  if (isNaN(bookingId)) {
    return { success: false, message: 'ID reservasi tidak valid' };
  }

  // Get booking to check date & ownership
  const { data: booking, error: getError } = await supabaseAdmin
    .from('reservasi')
    .select('id_reservasi, tanggal_pakai, status, id_user')
    .eq('id_reservasi', bookingId)
    .single();
  
  if (getError || !booking) {
    return { success: false, message: 'Reservasi tidak ditemukan' };
  }

  // Ownership check: user hanya bisa batalkan miliknya sendiri
  if (booking.id_user !== user.id) {
    return { success: false, message: 'Anda tidak berhak membatalkan reservasi ini' };
  }

  if (booking.status === 'Ditolak' || booking.status === 'Dibatalkan' || booking.status === 'Selesai') {
    return { success: false, message: 'Reservasi sudah tidak aktif atau selesai' };
  }

  // Cek batas H-1
  const bookingDate = new Date(booking.tanggal_pakai);
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
    .from('reservasi')
    .update({ status: 'Dibatalkan' })
    .eq('id_reservasi', bookingId);
  
  if (!updateError) {
    return { success: true, message: 'Reservasi berhasil dibatalkan' };
  }
  
  return { success: false, message: updateError.message || 'Gagal membatalkan reservasi' };
}
