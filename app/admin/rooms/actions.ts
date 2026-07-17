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
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function getRoomsData() {
  const adminClient = getSupabaseAdmin();
  
  // Fetch Rooms
  const { data: rooms, error: roomsError } = await adminClient
    .from('ruangan')
    .select(`
      *,
      gedung (id_gedung, nama_gedung),
      ruangan_fasilitas (
        id,
        fasilitas (id_fasilitas, nama_fasilitas, icon)
      )
    `)
    .order('nama_ruangan');
    
  if (roomsError) console.error('Error fetching rooms:', roomsError);

  // Fetch Buildings
  const { data: buildings } = await adminClient.from('gedung').select('*').order('nama_gedung');
  
  // Fetch Facilities
  const { data: facilities } = await adminClient.from('fasilitas').select('*').order('nama_fasilitas');

  return {
    rooms: rooms || [],
    buildings: buildings || [],
    facilities: facilities || []
  };
}

export async function saveRoom(formData: FormData, roomId?: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat mengelola ruangan.' };
  }

  const adminClient = getSupabaseAdmin();
  
  const id_gedung = parseInt(formData.get('id_gedung') as string, 10);
  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string, 10);
  const lantai = parseInt(formData.get('lantai') as string, 10);
  const deskripsi = formData.get('deskripsi') as string;
  const status = formData.get('status') as string || 'Tersedia';
  const existingImagesJson = formData.get('existingImages') as string;
  
  // Fasilitas array (from checkbox)
  const fasilitasIds = formData.getAll('fasilitas').map(id => parseInt(id as string, 10));

  if (!name || isNaN(capacity) || capacity <= 0 || isNaN(id_gedung)) {
    return { success: false, message: 'Nama, gedung, dan kapasitas ruangan wajib diisi dengan benar.' };
  }

  let imageUrl: string = existingImagesJson ? JSON.parse(existingImagesJson)[0] : '';

  // Handle new image uploads with validation (we only save one photo for V2 `foto`)
  const files = formData.getAll('images') as File[];
  
  for (const file of files) {
    if (file.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, message: `Tipe file "${file.name}" tidak diizinkan.` };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: `File terlalu besar. Maksimal 5MB per file.` };
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/rooms/${filename}`;
    }
  }

  const roomData = {
    id_gedung,
    nama_ruangan: name,
    kapasitas: capacity,
    lantai: isNaN(lantai) ? null : lantai,
    deskripsi,
    status,
    foto: imageUrl || null
  };

  let newRoomId = roomId;

  if (roomId) {
    const { error } = await adminClient.from('ruangan').update(roomData).eq('id_ruangan', roomId);
    if (error) return { success: false, message: error.message };
  } else {
    const { data, error } = await adminClient.from('ruangan').insert(roomData).select('id_ruangan').single();
    if (error) return { success: false, message: error.message };
    newRoomId = data.id_ruangan.toString();
  }

  // Update fasilitas
  if (newRoomId) {
    // Delete existing relations
    await adminClient.from('ruangan_fasilitas').delete().eq('id_ruangan', newRoomId);
    
    // Insert new relations
    if (fasilitasIds.length > 0) {
      const rfData = fasilitasIds.map(fid => ({
        id_ruangan: parseInt(newRoomId as string, 10),
        id_fasilitas: fid
      }));
      await adminClient.from('ruangan_fasilitas').insert(rfData);
    }
  }

  // Log activity
  await adminClient.from('activity_logs').insert({
    id_user: user?.id,
    aktivitas: roomId ? `Memperbarui ruangan: ${name}` : `Menambahkan ruangan baru: ${name}`,
    ip_address: 'System'
  });

  revalidatePath('/admin/rooms');
  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoom(id: string, name: string) {
  const { authorized, user } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient
    .from('ruangan')
    .delete()
    .eq('id_ruangan', id);
  
  if (!error) {
    await adminClient.from('activity_logs').insert({
      id_user: user?.id,
      aktivitas: `Menghapus ruangan: ${name}`,
      ip_address: 'System'
    });

    revalidatePath('/admin/rooms');
    revalidatePath('/rooms');
    return { success: true };
  }
  
  return { success: false, message: error.message || 'Gagal menghapus ruangan' };
}
