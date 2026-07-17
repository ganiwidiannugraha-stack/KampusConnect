'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/actions/auth';

async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  );
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

export async function getFacilities() {
  const adminClient = getSupabaseAdmin();
  const { data: facilities, error } = await adminClient
    .from('fasilitas')
    .select('id_fasilitas, nama_fasilitas, icon')
    .order('nama_fasilitas', { ascending: true });
    
  if (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
  
  return facilities || [];
}

export async function saveFacility(formData: FormData, id?: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized || !user) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola fasilitas.' };
  }

  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;
  
  if (!name) {
    return { success: false, message: 'Nama fasilitas wajib diisi.' };
  }

  const data = {
    nama_fasilitas: name,
    icon: icon || 'Box', // default icon if none provided
  };

  let error;
  const authClient = await getAuthClient();

  if (id) {
    const res = await authClient.from('fasilitas').update(data).eq('id_fasilitas', id);
    error = res.error;
  } else {
    const res = await authClient.from('fasilitas').insert(data);
    error = res.error;
  }

  if (!error) {
    // Audit Log
    await authClient.from('activity_logs').insert({
      id_user: user.id,
      aktivitas: id ? `Memperbarui fasilitas: ${name}` : `Menambahkan fasilitas baru: ${name}`,
      ip_address: 'System'
    });

    revalidatePath('/admin/facilities');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan' };
}

export async function deleteFacility(id: string, name: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized || !user) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const authClient = await getAuthClient();
  const { error } = await authClient
    .from('fasilitas')
    .delete()
    .eq('id_fasilitas', id);
  
  if (!error) {
    // Audit Log
    await authClient.from('activity_logs').insert({
      id_user: user.id,
      aktivitas: `Menghapus fasilitas: ${name}`,
      ip_address: 'System'
    });

    revalidatePath('/admin/facilities');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Gagal menghapus fasilitas' };
}
