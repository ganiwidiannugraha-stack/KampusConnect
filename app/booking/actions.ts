'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

export async function getRoomsForSelect() {
  const authClient = await getAuthClient();
  const { data: rooms, error } = await authClient
    .from('rooms')
    .select('id, name, capacity')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  return rooms || [];
}

export async function createBooking(prevState: any, formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const date = formData.get('date') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const reason = formData.get('reason') as string;

  if (!roomId || !date || !startTime || !endTime || !reason) {
    return { success: false, message: 'Semua kolom wajib diisi!' };
  }

  // Validasi panjang reason
  if (reason.length > 500) {
    return { success: false, message: 'Tujuan kegiatan maksimal 500 karakter.' };
  }

  // Validasi format UUID untuk roomId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(roomId)) {
    return { success: false, message: 'ID ruangan tidak valid.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Silakan login terlebih dahulu!' };
  }

  // Validasi SOP H-3
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 3) {
    return { success: false, message: 'Sesuai SOP, reservasi harus dilakukan minimal H-3 sebelum kegiatan.' };
  }

  // Supabase RLS or database trigger should ideally handle conflict detection, 
  // but let's check it here manually for simple overlap logic
  const authClient = await getAuthClient();
  const { data: overlapping } = await authClient
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .eq('date', date)
    .not('status', 'eq', 'DITOLAK')
    .not('status', 'eq', 'DIBATALKAN')
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

  if (overlapping && overlapping.length > 0) {
    return { success: false, message: 'Ruangan sudah dipesan pada waktu tersebut.' };
  }

  if (startTime >= endTime) {
    return { success: false, message: 'Waktu mulai harus sebelum waktu selesai.' };
  }

  const { error } = await authClient
    .from('bookings')
    .insert({
      room_id: roomId,
      user_id: user.id,
      organization_id: user.organization?.id || null,
      date,
      start_time: startTime,
      end_time: endTime,
      reason,
      status: 'MENUNGGU'
    });
  
  if (error) {
    console.error('Booking error:', error);
    return { success: false, message: 'Gagal melakukan pemesanan: ' + error.message };
  }
  
  revalidatePath('/rooms');
  revalidatePath('/booking');
  return { success: true, message: 'Reservasi berhasil diajukan! Status: Menunggu Persetujuan.' };
}
