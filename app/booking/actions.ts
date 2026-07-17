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
    .from('ruangan')
    .select('id_ruangan, nama_ruangan, kapasitas')
    .eq('status', 'Tersedia');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  // Format ke ekspektasi komponen jika perlu, atau ubah tipe
  return (rooms || []).map(r => ({ id: r.id_ruangan, name: r.nama_ruangan, capacity: r.kapasitas }));
}

export async function createBooking(prevState: any, formData: FormData) {
  const roomIdStr = formData.get('roomId') as string;
  const date = formData.get('date') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const reason = formData.get('reason') as string;
  const jumlahPesertaStr = formData.get('jumlahPeserta') as string;
  const lampiranFile = formData.get('lampiran') as File;

  if (!roomIdStr || !date || !startTime || !endTime || !reason || !jumlahPesertaStr || !lampiranFile) {
    return { success: false, message: 'Semua kolom (termasuk lampiran) wajib diisi!' };
  }
  
  if (lampiranFile.size === 0) {
     return { success: false, message: 'File lampiran tidak valid atau kosong.' };
  }

  const roomId = parseInt(roomIdStr, 10);
  const jumlahPeserta = parseInt(jumlahPesertaStr, 10);

  if (reason.length > 500) {
    return { success: false, message: 'Tujuan kegiatan maksimal 500 karakter.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Silakan login terlebih dahulu!' };
  }

  // Validasi SOP H-3
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 3) {
    return { success: false, message: 'Sesuai SOP, reservasi harus dilakukan minimal H-3 sebelum kegiatan.' };
  }

  const authClient = await getAuthClient();
  
  // Validasi Kapasitas Ruangan
  const { data: roomData } = await authClient
    .from('ruangan')
    .select('kapasitas')
    .eq('id_ruangan', roomId)
    .single();
    
  if (roomData && jumlahPeserta > roomData.kapasitas) {
      return { success: false, message: `Jumlah peserta (${jumlahPeserta}) melebihi kapasitas ruangan (${roomData.kapasitas} orang).` };
  }

  // Cek bentrok jadwal
  const { data: overlapping } = await authClient
    .from('reservasi')
    .select('id_reservasi')
    .eq('id_ruangan', roomId)
    .eq('tanggal_pakai', date)
    .not('status', 'eq', 'Ditolak')
    .not('status', 'eq', 'Dibatalkan')
    .or(`and(jam_mulai.lt.${endTime},jam_selesai.gt.${startTime})`);

  if (overlapping && overlapping.length > 0) {
    return { success: false, message: 'Ruangan sudah dipesan pada waktu tersebut.' };
  }

  if (startTime >= endTime) {
    return { success: false, message: 'Waktu mulai harus sebelum waktu selesai.' };
  }

  // 1. Upload File Lampiran ke Supabase Storage
  const fileExt = lampiranFile.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  
  // Convert File to ArrayBuffer for uploading in Next.js Server Action
  const arrayBuffer = await lampiranFile.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await authClient
    .storage
    .from('lampiran')
    .upload(fileName, buffer, {
      contentType: lampiranFile.type,
      upsert: true
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { success: false, message: 'Gagal mengupload lampiran: ' + uploadError.message };
  }

  // Ambil URL Publik File
  const { data: publicUrlData } = authClient.storage.from('lampiran').getPublicUrl(fileName);
  const fileUrl = publicUrlData.publicUrl;

  // 2. Insert Reservasi
  const kodeReservasi = `RSV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`;
  const { data: reservasiData, error: reservasiError } = await authClient
    .from('reservasi')
    .insert({
      kode_reservasi: kodeReservasi,
      id_ruangan: roomId,
      id_user: user.id,
      tanggal_pakai: date,
      jam_mulai: startTime,
      jam_selesai: endTime,
      jumlah_peserta: jumlahPeserta,
      keperluan: reason,
      status: 'Menunggu'
    }).select('id_reservasi').single();
  
  if (reservasiError || !reservasiData) {
    console.error('Booking error:', reservasiError);
    // Rollback delete file
    await authClient.storage.from('lampiran').remove([fileName]);
    return { success: false, message: 'Gagal melakukan pemesanan: ' + reservasiError?.message };
  }
  
  // 3. Insert Lampiran Data
  const { error: lampiranError } = await authClient
    .from('lampiran')
    .insert({
      id_reservasi: reservasiData.id_reservasi,
      nama_file: lampiranFile.name,
      file_path: fileUrl
    });
    
  if (lampiranError) {
      console.error('Lampiran error:', lampiranError);
      // We don't rollback the booking here, but it's an edge case
  }
  
  revalidatePath('/rooms');
  revalidatePath('/my-bookings');
  return { success: true, message: 'Reservasi berhasil diajukan! Status: Menunggu Persetujuan.' };
}
