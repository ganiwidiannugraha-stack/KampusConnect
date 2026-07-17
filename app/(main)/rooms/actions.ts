'use server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getRooms() {
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
    .in('status', ['Tersedia', 'Maintenance']) // Only show active rooms
    .gte('reservasi.tanggal_pakai', new Date().toISOString().split('T')[0])
    .in('reservasi.status', ['Menunggu', 'Disetujui'])
    .order('nama_ruangan', { ascending: true });

  if (error) {
    console.error("Failed to fetch rooms from Supabase:", error);
    return [];
  }

  // Transform data to match UI expectations
  return rooms.map(room => {
    return {
      id: room.id_ruangan,
      name: room.nama_ruangan,
      capacity: room.kapasitas,
      lantai: room.lantai,
      gedung: room.gedung?.nama_gedung || '',
      facilities: room.ruangan_fasilitas?.map((rf: any) => rf.fasilitas?.nama_fasilitas).join(', ') || '',
      facilitiesList: room.ruangan_fasilitas?.map((rf: any) => rf.fasilitas) || [],
      images: room.foto ? [room.foto] : [],
      status: room.status,
      deskripsi: room.deskripsi,
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
