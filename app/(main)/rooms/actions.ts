'use server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getRooms() {
  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select(`
      id,
      name,
      capacity,
      facilities,
      images,
      is_active,
      bookings (
        id,
        date,
        start_time,
        end_time,
        status
      )
    `)
    .eq('is_active', true)
    .gte('bookings.date', new Date().toISOString().split('T')[0])
    .in('bookings.status', ['MENUNGGU', 'DISETUJUI'])
    .order('name', { ascending: true });

  if (error) {
    console.error("Failed to fetch rooms from Supabase:", error);
    return [];
  }

  // Filter bookings manually if Supabase hasn't filtered them
  return rooms.map(room => {
    return {
      ...room,
      isActive: room.is_active, // Map to camelCase for the UI
      bookings: room.bookings.filter((b: any) => 
        b.status === 'MENUNGGU' || b.status === 'DISETUJUI'
      ).map((b: any) => ({
        ...b,
        startTime: b.start_time,
        endTime: b.end_time
      }))
    }
  });
}
