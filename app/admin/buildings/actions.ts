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

export async function getBuildings() {
  const adminClient = getSupabaseAdmin();
  const { data: buildings, error } = await adminClient
    .from('gedung')
    .select('id_gedung, nama_gedung, lokasi, created_at, updated_at')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
  
  return buildings || [];
}

export async function saveBuilding(formData: FormData, id?: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized || !user) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola gedung.' };
  }

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  
  if (!name) {
    return { success: false, message: 'Nama gedung wajib diisi.' };
  }

  const data = {
    nama_gedung: name,
    lokasi: location,
  };

  let error;
  const authClient = await getAuthClient();

  if (id) {
    const res = await authClient.from('gedung').update(data).eq('id_gedung', id);
    error = res.error;
  } else {
    const res = await authClient.from('gedung').insert(data);
    error = res.error;
  }

  if (!error) {
    // Audit Log
    await authClient.from('activity_logs').insert({
      id_user: user.id,
      aktivitas: id ? `Memperbarui gedung: ${name}` : `Menambahkan gedung baru: ${name}`,
      ip_address: 'System'
    });

    revalidatePath('/admin/buildings');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan' };
}

export async function deleteBuilding(id: string, name: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized || !user) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const authClient = await getAuthClient();
  const { error } = await authClient
    .from('gedung')
    .delete()
    .eq('id_gedung', id);
  
  if (!error) {
    // Audit Log
    await authClient.from('activity_logs').insert({
      id_user: user.id,
      aktivitas: `Menghapus gedung: ${name}`,
      ip_address: 'System'
    });

    revalidatePath('/admin/buildings');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Gagal menghapus gedung' };
}
