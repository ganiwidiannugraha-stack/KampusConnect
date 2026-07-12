'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

export async function getReportBookings(year: number, month: number, roomId: string | null) {
  const authClient = await getAuthClient();

  // Construct date range for the month
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of the month

  let query = authClient
    .from('bookings')
    .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      reason,
      room:rooms (
        id,
        name,
        capacity
      ),
      user:profiles (
        id,
        name
      )
    `)
    .eq('status', 'DISETUJUI') // Only approved bookings for the report
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (roomId) {
    query = query.eq('room_id', roomId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching report bookings:', error);
    return [];
  }

  return data;
}
