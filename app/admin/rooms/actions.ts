'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
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

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function getRooms() {
  const adminClient = getSupabaseAdmin();
  const { data: rooms, error } = await adminClient
    .from('rooms')
    .select('id, name, capacity, facilities, is_active, images')
    .order('name');
    
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return (rooms || []).map(r => ({
    ...r,
    isActive: r.is_active
  }));
}

export async function saveRoom(formData: FormData, roomId?: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola ruangan.' };
  }

  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string, 10);
  const facilities = formData.get('facilities') as string;
  const isActive = formData.get('isActive') === 'true';
  const existingImagesJson = formData.get('existingImages') as string;
  
  if (!name || isNaN(capacity) || capacity <= 0) {
    return { success: false, message: 'Nama dan kapasitas ruangan wajib diisi dengan benar.' };
  }

  let imageUrls: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

  // Handle new image uploads with validation
  const files = formData.getAll('images') as File[];
  
  for (const file of files) {
    if (file.size > 0) {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, message: `Tipe file "${file.name}" tidak diizinkan. Gunakan JPG, PNG, WebP, atau GIF.` };
      }
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: `File "${file.name}" terlalu besar. Maksimal 5MB per file.` };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrls.push(`/uploads/rooms/${filename}`);
    }
  }

  const data = {
    name,
    capacity,
    facilities,
    is_active: isActive,
    images: imageUrls,
  };

  let error;
  const authClient = await getAuthClient();

  if (roomId) {
    const res = await authClient.from('rooms').update(data).eq('id', roomId);
    error = res.error;
  } else {
    const res = await authClient.from('rooms').insert(data);
    error = res.error;
  }

  if (!error) {
    revalidatePath('/admin/rooms');
    revalidatePath('/rooms');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Terjadi kesalahan' };
}

export async function deleteRoom(id: string) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const authClient = await getAuthClient();
  const { error } = await authClient
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (!error) {
    revalidatePath('/admin/rooms');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Gagal menghapus ruangan' };
}
