'use server';

// Baris ini ngasih tau Next.js kalau semua fungsi di sini cuma boleh dijalanin di Server.
// Ini bikin pengiriman form jadi lebih aman karena user gak bisa ngintip script aslinya.

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fungsi buat bikin koneksi ke database yang bawa token login dari cookies.
// Gunanya biar database tahu kalau "Oh, ini si A yang lagi request".
// Kalau gak pake ini, nanti user biasa bisa ngedit data orang lain secara gak sah.
async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    // Masukin token JWT ke header biar RLS di Supabase ngenalin siapa user-nya
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

// Fungsi buat ngambil daftar ruangan yang bisa dipilih di form pemesanan
export async function getRoomsForSelect() {
  const authClient = await getAuthClient();
  
  // Ambil cuma ID, nama, dan kapasitas aja biar datanya enteng dan load-nya cepet.
  // Dan pastinya, cuma ruangan yang statusnya 'Tersedia' yang boleh tampil.
  const { data: rooms, error } = await authClient
    .from('ruangan')
    .select('id_ruangan, nama_ruangan, kapasitas')
    .eq('status', 'Tersedia');

  if (error) {
    console.error('[Action: getRoomsForSelect] Error ambil ruangan:', error);
    return [];
  }
  
  // Ubah nama variabelnya (format snake_case jadi camelCase) biar sesuai sama frontend
  return (rooms || []).map(r => ({ id: r.id_ruangan, name: r.nama_ruangan, capacity: r.kapasitas }));
}

// FUNGSI UTAMA: Buat nge-proses saat user klik tombol "Ajukan Reservasi"
// Nerima data dalam bentuk FormData (kayak ngirim form biasa, tapi support kirim file PDF/Gambar)
export async function createBooking(prevState: any, formData: FormData) {
  // 1. Ambil semua isian dari form satu-satu
  const roomIdStr = formData.get('roomId') as string;
  const date = formData.get('date') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const reason = formData.get('reason') as string;
  const jumlahPesertaStr = formData.get('jumlahPeserta') as string;
  const lampiranFile = formData.get('lampiran') as File;

  // 2. Cek kalau ada yang kosong, tolak dan kasih pesan error
  if (!roomIdStr || !date || !startTime || !endTime || !reason) {
    return { success: false, message: 'Semua isian form utama wajib diisi!' };
  }
  
  // Cek kalau filenya rusak atau ukurannya 0 byte
  if (lampiranFile && lampiranFile.size === 0) {
     return { success: false, message: 'File lampiran sepertinya rusak atau kosong.' };
  }

  // Ubah tipe ID Ruangan dan Jumlah Peserta jadi Angka
  const roomId = parseInt(roomIdStr, 10);
  const jumlahPeserta = jumlahPesertaStr ? parseInt(jumlahPesertaStr, 10) : 1;

  // Pencegahan spam: Tujuan kegiatan dibatesin gak boleh lebih dari 500 huruf
  if (reason.length > 500) {
    return { success: false, message: 'Tujuan kegiatan kepanjangan, maksimal 500 karakter aja.' };
  }

  // 3. Pastiin user-nya udah login
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Waduh, sesi login kamu udah abis. Silakan login lagi ya.' };
  }

  // 4. ATURAN KAMPUS (SOP): Cek apakah tanggal minjemnya minimal H-3 dari hari ini
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Di-set jam 00:00 biar adil hitung per harinya
  
  // Menghitung selisih harinya
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Kalau minjemnya kurang dari 3 hari, langsung tolak!
  if (diffDays < 3) {
    return { success: false, message: 'Maaf, sesuai aturan (SOP) kamu harus reservasi minimal H-3 sebelum acara.' };
  }

  const authClient = await getAuthClient();
  
  // 5. CEK KAPASITAS: Jangan sampai ruangan kecil disewa buat orang sekampung
  const { data: roomData } = await authClient
    .from('ruangan')
    .select('kapasitas')
    .eq('id_ruangan', roomId)
    .single();
    
  if (roomData && jumlahPeserta > roomData.kapasitas) {
      return { success: false, message: `Penuh euy! Jumlah peserta (${jumlahPeserta}) melebihi batas ruangan (${roomData.kapasitas} orang).` };
  }

  // 6. CEK BENTROK JADWAL: Nyari apakah ada reservasi lain di ruangan dan hari yang sama
  // Dan jamnya tabrakan sama yang mau kita pesan
  const { data: overlapping } = await authClient
    .from('reservasi')
    .select('id_reservasi')
    .eq('id_ruangan', roomId)
    .eq('tanggal_pakai', date)
    // Cuma peduliin jadwal yang belum ditolak atau batal
    .not('status', 'eq', 'Ditolak')
    .not('status', 'eq', 'Dibatalkan')
    // Rumus irisan jam: (Jam Mulai Lama < Jam Selesai Baru) DAN (Jam Selesai Lama > Jam Mulai Baru)
    .or(`and(jam_mulai.lt.${endTime},jam_selesai.gt.${startTime})`);

  if (overlapping && overlapping.length > 0) {
    return { success: false, message: 'Waduh, ruangan ini udah ada yang booking di jam tersebut. Cari jam lain ya!' };
  }

  // Validasi masuk akal: Jam mulai harus lebih awal dari jam selesai
  if (startTime >= endTime) {
    return { success: false, message: 'Jam mulai acaranya nggak masuk akal (masa lebih lama dari selesainya?).' };
  }

  // 7. PROSES UPLOAD FILE KE STORAGE DATABASE (Jika Ada)
  let fileUrl = '';
  let fileName = '';
  
  if (lampiranFile) {
    // Ambil tipe file (pdf/jpg) lalu kasih nama unik gabungan (ID User + Waktu Sekarang) biar nggak nimpa file orang lain
    const fileExt = lampiranFile.name.split('.').pop();
    fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    // Mengubah data file jadi bentuk buffer (kode biner) biar bisa dikirim lewat NodeJS
    const arrayBuffer = await lampiranFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload ke bucket 'lampiran' di Supabase
    const { error: uploadError } = await authClient
      .storage
      .from('lampiran')
      .upload(fileName, buffer, {
        contentType: lampiranFile.type,
        upsert: true
      });

    if (uploadError) {
      console.error('[Action: createBooking] Gagal upload:', uploadError);
      return { success: false, message: 'Gagal mengupload lampiran surat: ' + uploadError.message };
    }

    // Setelah sukses di-upload, minta link publik (URL) filenya
    const { data: publicUrlData } = authClient.storage.from('lampiran').getPublicUrl(fileName);
    fileUrl = publicUrlData.publicUrl;
  }

  // 8. SIMPAN DATA RESERVASI KE DATABASE
  // Bikin kode booking otomatis (contoh: RSV-1234-99)
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
      status: 'Menunggu' // Pas daftar, statusnya langsung dibikin 'Menunggu' otomatis
    }).select('id_reservasi').single();
  
  // Kalau ternyata gagal nyimpen ke database (tapi file terlanjur ke-upload), 
  // kita hapus aja filenya lagi biar gak nyampah di storage (Rollback)
  if (reservasiError || !reservasiData) {
    console.error('[Action: createBooking] Gagal insert reservasi:', reservasiError);
    // Kalau tadi udah terlanjur upload file, kita hapus lagi filenya (Rollback) biar storage nggak penuh nyampah
    if (fileName) {
      await authClient.storage.from('lampiran').remove([fileName]);
    }
    return { success: false, message: 'Gagal melakukan pemesanan: ' + reservasiError?.message };
  }
  
  // 9. SIMPAN INFO LAMPIRAN KE TABEL LAMPIRAN (Jika ada file)
  if (lampiranFile && fileUrl) {
    const { error: lampiranError } = await authClient
      .from('lampiran')
      .insert({
        id_reservasi: reservasiData.id_reservasi,
        nama_file: lampiranFile.name,
        file_path: fileUrl
      });
      
    if (lampiranError) {
        console.error('[Action: createBooking] Gagal simpan data lampiran:', lampiranError);
        // Nggak usah dibatalin reservasinya kalau error ini, cuma filenya aja yang nggak kelink
    }
  }
  
  // 10. REFRESH HALAMAN (Biar keliatan data barunya tanpa user mencet F5)
  revalidatePath('/rooms');
  revalidatePath('/my-bookings');
  
  return { success: true, message: 'Reservasi berhasil diajukan! Status: Menunggu Persetujuan.' };
}
