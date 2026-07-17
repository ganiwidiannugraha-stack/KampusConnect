'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getActivityLogs() {
  const adminClient = getSupabaseAdmin();
  
  const { data: logs, error } = await adminClient
    .from('activity_logs')
    .select(`
      id_log,
      aktivitas,
      ip_address,
      created_at,
      profiles (
        nama,
        nim
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Fetch top 100 recent logs
    
  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
  
  return logs || [];
}
