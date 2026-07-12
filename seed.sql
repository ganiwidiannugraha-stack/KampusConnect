-- ==========================================
-- SCRIPT SEEDING DATA & PERBAIKAN AKSES ADMIN
-- Eksekusi seluruh kode ini di Supabase SQL Editor
-- ==========================================

-- 1. Tambahkan Akses RLS untuk Admin agar bisa baca & ubah semua tabel
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
CREATE POLICY "Admins can do everything on profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM roles WHERE roles.id = public.profiles.role_id AND roles.can_manage_users = true)
);

DROP POLICY IF EXISTS "Admins can do everything on rooms" ON rooms;
CREATE POLICY "Admins can do everything on rooms" ON rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.can_manage_rooms = true)
);

DROP POLICY IF EXISTS "Admins can do everything on bookings" ON bookings;
CREATE POLICY "Admins can do everything on bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.can_approve_bookings = true)
);

-- 2. Hapus data lama (jika ada) untuk menghindari duplikasi
TRUNCATE TABLE approvals CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE rooms CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- Hapus Identitas & Akun Auth Lama
DELETE FROM auth.identities WHERE user_id IN ('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002');
DELETE FROM auth.users WHERE id IN ('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002');

-- 3. Masukkan Data Organisasi (UKM/BEM)
INSERT INTO organizations (id, name) VALUES 
('a0000000-0000-0000-0000-000000000001', 'BEM Universitas'),
('a0000000-0000-0000-0000-000000000002', 'UKM Olahraga'),
('a0000000-0000-0000-0000-000000000003', 'HIMA Informatika');

-- 4. Masukkan Data Role (Admin & UKM)
INSERT INTO roles (id, name, can_manage_users, can_manage_rooms, can_approve_bookings, can_book_rooms, can_manage_roles, can_access_dashboard) VALUES 
('b0000000-0000-0000-0000-000000000001', 'Administrator', true, true, true, false, true, true),
('b0000000-0000-0000-0000-000000000002', 'Perwakilan UKM', false, false, false, true, false, true);

-- 5. Masukkan Data Ruangan (Katalog)
INSERT INTO rooms (id, name, capacity, facilities) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Aula Utama', 500, 'AC, Proyektor, Sound System, Panggung'),
('c0000000-0000-0000-0000-000000000002', 'Ruang Rapat 1', 20, 'AC, Papan Tulis, Smart TV'),
('c0000000-0000-0000-0000-000000000003', 'Studio Musik', 15, 'AC, Alat Musik Lengkap, Peredam Suara');

-- 6. Daftarkan Akun Login ke sistem Supabase Auth (auth.users)
-- (Password semuanya adalah: password123)
-- Admin
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES (
  'd0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@kampus.com', 
  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 
  format('{"sub":"%s","email":"%s","provider_id":"%s"}', 'd0000000-0000-0000-0000-000000000001', 'admin@kampus.com', 'd0000000-0000-0000-0000-000000000001')::jsonb, 
  'email', now(), now(), now()
);

-- UKM User
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES (
  'd0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ukm@kampus.com', 
  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 
  format('{"sub":"%s","email":"%s","provider_id":"%s"}', 'd0000000-0000-0000-0000-000000000002', 'ukm@kampus.com', 'd0000000-0000-0000-0000-000000000002')::jsonb, 
  'email', now(), now(), now()
);

-- 7. Sambungkan Akun Login tadi ke tabel Profiles kita
INSERT INTO public.profiles (id, name, email, role_id, organization_id) VALUES 
('d0000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@kampus.com', 'b0000000-0000-0000-0000-000000000001', NULL),
('d0000000-0000-0000-0000-000000000002', 'Ketua BEM', 'ukm@kampus.com', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- SELESAI. Silakan login ke aplikasi!
