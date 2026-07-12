'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  if (!token) return null;
  
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, name, organization_id, roles(can_access_dashboard)')
    .eq('id', user.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      name: profile.name,
      role: {
        canAccessDashboard: (profile.roles as any)?.can_access_dashboard || false,
      },
      organization: profile.organization_id ? { id: profile.organization_id } : null,
    };
  }
  return null;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('supabase-session');
  redirect('/');
}
