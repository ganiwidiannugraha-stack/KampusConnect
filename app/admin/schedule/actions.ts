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

export async function getScheduleBookings() {
  const authClient = await getAuthClient();
  const { data: bookings, error } = await authClient
    .from('bookings')
    .select(`
      id,
      room:rooms (
        id,
        name
      ),
      user:profiles (
        id,
        name
      ),
      date,
      start_time,
      end_time,
      reason,
      status,
      created_at
    `)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedule bookings:', error);
    return [];
  }

  return bookings;
}
