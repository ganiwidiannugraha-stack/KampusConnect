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
    return { authorized: false } as const;
  }
  return { authorized: true } as const;
}

export async function getUsers() {
  const adminClient = getSupabaseAdmin();
  const { data: users, error } = await adminClient
    .from('profiles')
    .select(`
      id,
      name,
      email,
      role:roles (
        id,
        name
      ),
      organization:organizations (
        id,
        name
      )
    `)
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return users || [];
}

export async function getRoles() {
  const adminClient = getSupabaseAdmin();
  const { data: roles, error } = await adminClient
    .from('roles')
    .select('id, name')
    .order('name');
    
  return error ? [] : (roles || []);
}

export async function getOrganizations() {
  const adminClient = getSupabaseAdmin();
  const { data: orgs, error } = await adminClient
    .from('organizations')
    .select('id, name')
    .order('name');
    
  return error ? [] : (orgs || []);
}

export async function saveUser(formData: FormData, userId?: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola pengguna.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const roleId = formData.get('roleId') as string;
  const organizationId = formData.get('organizationId') as string;
  const password = formData.get('password') as string;

  if (!name || !email) {
    return { success: false, message: 'Nama dan email wajib diisi.' };
  }
  
  const data: any = {
    name,
    email,
  };

  if (roleId) {
    data.role_id = roleId;
  }
  
  if (organizationId) {
    data.organization_id = organizationId;
  } else if (userId) {
    data.organization_id = null;
  }

  let error;
  const adminClient = getSupabaseAdmin();
  
  if (userId) {
    const res = await adminClient.from('profiles').update(data).eq('id', userId);
    error = res.error;
  } else {
    // Create new user using Admin API
    const finalPassword = password || 'KampusConnect2026!';
    
    // 1. Create in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    if (authData.user) {
      // 2. Insert into profiles
      const profileData = {
        id: authData.user.id,
        ...data
      };
      
      const { error: profileError } = await adminClient.from('profiles').insert(profileData);
      
      if (profileError) {
        // Rollback auth user creation if profile insert fails
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return { success: false, message: profileError.message || 'Gagal menyimpan profil pengguna' };
      }
    }
  }

  if (!error) {
    revalidatePath('/admin/users');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan saat menyimpan pengguna' };
}

export async function deleteUser(id: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const adminClient = getSupabaseAdmin();
  
  // 1. Validasi: Jangan izinkan penghapusan jika ini adalah Administrator terakhir
  const { data: targetUser } = await adminClient
    .from('profiles')
    .select(`
      id,
      role:roles ( name )
    `)
    .eq('id', id)
    .single();

  const isTargetAdmin = (targetUser as any)?.role?.name?.toLowerCase().includes('admin');

  if (isTargetAdmin) {
    const { data: allUsers } = await adminClient
      .from('profiles')
      .select(`
        id,
        role:roles ( name )
      `);
      
    const adminCount = (allUsers || []).filter((u: any) => u.role?.name?.toLowerCase().includes('admin')).length;
    
    if (adminCount <= 1) {
      return { 
        success: false, 
        message: 'Aksi ditolak! Anda tidak dapat menghapus Administrator terakhir karena sistem setidaknya membutuhkan 1 Administrator aktif.' 
      };
    }
  }

  // 2. Delete from auth.users (CASCADE will delete profile)
  const { error: authError } = await adminClient.auth.admin.deleteUser(id);
  
  if (authError) {
    return { success: false, message: authError.message || 'Gagal menghapus pengguna dari autentikasi' };
  }
  
  // Fallback: manually delete from profiles
  await adminClient.from('profiles').delete().eq('id', id);
  
  revalidatePath('/admin/users');
  return { success: true };
}
