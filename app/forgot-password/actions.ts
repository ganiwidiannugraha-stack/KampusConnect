'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Harap masukkan alamat email Anda.' };
  }

  // Set URL redirect ke halaman update-password
  // Kita asumsikan URL utama diambil dari env NEXT_PUBLIC_SITE_URL atau default localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl}/update-password`;

  if (email.endsWith('@kampus.ac.id') || email.includes('dummy')) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Delay agar animasi loading natural
    return { 
      success: true, 
      message: 'Akun Demo / Internal terdeteksi. Sesuai kebijakan keamanan sistem, pengiriman tautan reset untuk akun internal dinonaktifkan. Silakan hubungi Administrator Kampus untuk bantuan lebih lanjut.' 
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { 
      success: false, 
      message: error.message === 'Rate limit exceeded' 
        ? 'Terlalu banyak percobaan. Harap tunggu beberapa saat.'
        : 'Gagal mengirim email reset: ' + error.message,
      email 
    };
  }

  return { 
    success: true, 
    message: 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk (inbox) atau folder spam.' 
  };
}
