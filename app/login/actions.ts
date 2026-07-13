'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email dan password wajib diisi', email };
  }

  // Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return { 
      success: false, 
      message: error?.message === 'Invalid login credentials' ? 'Email atau kata sandi yang Anda masukkan salah.' : error?.message || 'Email atau kata sandi salah',
      email
    };
  }

  // Fetch user profile and role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*, roles(can_access_dashboard)')
    .eq('id', data.user.id)
    .single();

  const cookieStore = await cookies();
  cookieStore.set('supabase-session', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/'
  });

  // Determine redirect based on role
  if (profile?.roles?.can_access_dashboard) {
    redirect('/admin');
  } else {
    redirect('/my-bookings');
  }
}
