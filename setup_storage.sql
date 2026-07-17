-- Setup Supabase Storage for Lampiran

-- 1. Membuat Bucket 'lampiran' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('lampiran', 'lampiran', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Mengizinkan Akses Publik untuk Membaca (SELECT)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'lampiran');

-- 3. Mengizinkan User Login (Authenticated) untuk Mengupload File (INSERT)
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lampiran' AND
  auth.role() = 'authenticated'
);

-- 4. Mengizinkan User Login (Authenticated) untuk Menghapus File (DELETE)
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lampiran' AND
  auth.role() = 'authenticated'
);
