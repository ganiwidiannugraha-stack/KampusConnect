'use server';

// Baris ini ngasih tau kalau fungsi di file ini cuma dieksekusi di sisi server.
// Ini bikin kita aman ngambil data tanpa nge-bocorin URL database ke browser pengunjung.

import { createClient } from '@supabase/supabase-js';

// Karena data ruangan sifatnya publik (semua orang boleh lihat daftar ruang tanpa login),
// Kita pake Supabase Admin Client biar gampang nge-query bypass RLS untuk tabel publik.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// FUNGSI UTAMA: Ngambil data katalog ruangan buat ditampilin di halaman "Daftar Ruangan"
export async function getRooms() {
  // Query Supabase ini lumayan kompleks karena narik data dari banyak tabel sekaligus (Join).
  // Apa aja yang diambil? Data ruangan, nama gedungnya, fasilitasnya, plus jadwal reservasinya.
  const { data: rooms, error } = await supabaseAdmin
    .from('ruangan')
    .select(`
      *,
      gedung (id_gedung, nama_gedung, lokasi),
      ruangan_fasilitas (
        id,
        fasilitas (id_fasilitas, nama_fasilitas, icon)
      ),
      reservasi (
        id_reservasi,
        tanggal_pakai,
        jam_mulai,
        jam_selesai,
        status
      )
    `)
    // Kenapa di filter 'Tersedia' dan 'Maintenance'? Biar ruangan yang udah dihapus/nonaktif nggak tampil
    .in('status', ['Tersedia', 'Maintenance'])
    // Ini buat ngambil jadwal reservasi mulai dari hari ini ke depan (jadwal lama gak usah dibawa)
    .gte('reservasi.tanggal_pakai', new Date().toISOString().split('T')[0])
    // Cuma ambil reservasi yang lagi 'Menunggu' atau 'Disetujui'. Yang ditolak gak dianggep booking-an.
    .in('reservasi.status', ['Menunggu', 'Disetujui'])
    // Urutin namanya sesuai abjad (A-Z)
    .order('nama_ruangan', { ascending: true });

  if (error) {
    console.error("Gagal ngambil data ruangan dari database:", error);
    return [];
  }

  // DATA MAPPING: Karena data dari database Supabase formatnya agak ribet (banyak nested object),
  // kita ubah (mapping) jadi bentuk yang simpel (camelCase) biar Frontend lebih gampang bacanya.
  return rooms.map(room => {
    return {
      id: room.id_ruangan,
      name: room.nama_ruangan,
      capacity: room.kapasitas,
      lantai: room.lantai,
      gedung: room.gedung?.nama_gedung || '',
      // Fasilitasnya dijadiin satu baris teks biasa (contoh: "Proyektor, AC, Papan Tulis")
      facilities: room.ruangan_fasilitas?.map((rf: any) => rf.fasilitas?.nama_fasilitas).join(', ') || '',
      // Tapi kita simpen juga list asli fasilitasnya buat ditampilin pake icon
      facilitiesList: room.ruangan_fasilitas?.map((rf: any) => rf.fasilitas) || [],
      // Kalau di database ada fotonya, masukin ke array. Kalau kosong, array kosong.
      images: room.foto ? [room.foto] : [],
      status: room.status,
      deskripsi: room.deskripsi,
      // Filter lagi jadwal reservasinya (buat jaga-jaga kalau query di atas tembus)
      // Ini nanti dipakai frontend buat nge-blokir jam yang udah di-booking di kalender UI
      bookings: (room.reservasi || []).filter((b: any) => 
        b.status === 'Menunggu' || b.status === 'Disetujui'
      ).map((b: any) => ({
        id: b.id_reservasi,
        date: b.tanggal_pakai,
        startTime: b.jam_mulai,
        endTime: b.jam_selesai,
        status: b.status
      }))
    }
  });
}
