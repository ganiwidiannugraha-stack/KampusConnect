'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    return { authorized: false } as const;
  }
  return { authorized: true } as const;
}

export async function getOrganizations() {
  const { data: orgs, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
  return orgs || [];
}

export async function saveOrganization(formData: FormData, id?: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola organisasi.' };
  }

  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    return { success: false, message: 'Nama organisasi wajib diisi' };
  }

  if (name.length > 100) {
    return { success: false, message: 'Nama organisasi maksimal 100 karakter' };
  }

  let error;
  
  if (id) {
    const res = await supabaseAdmin.from('organizations').update({ name: name.trim() }).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseAdmin.from('organizations').insert({ name: name.trim() });
    error = res.error;
  }

  if (!error) {
    revalidatePath('/admin/organizations');
    revalidatePath('/admin/users');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan saat menyimpan organisasi' };
}

export async function deleteOrganization(id: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('id', id);
  
  if (!error) {
    revalidatePath('/admin/organizations');
    revalidatePath('/admin/users');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Gagal menghapus organisasi' };
}
