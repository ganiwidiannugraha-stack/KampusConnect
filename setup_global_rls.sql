-- 1. Mengubah nama role "Perwakilan UKM" menjadi "Mahasiswa"
UPDATE roles SET name = 'Mahasiswa' WHERE name = 'Perwakilan UKM';

-- 2. Membuat fungsi aman untuk mengecek apakah user yang login adalah Administrator
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT (r.name = 'Administrator') INTO v_is_admin
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  RETURN coalesce(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Menghapus kebijakan RLS lama agar bisa diperbarui (mencegah error kalau dijalankan ulang)
DROP POLICY IF EXISTS "Public Read Access for Rooms" ON rooms;
DROP POLICY IF EXISTS "Public Read Access for Organizations" ON organizations;
DROP POLICY IF EXISTS "Public Read Access for Roles" ON roles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

DROP POLICY IF EXISTS "Read access for organizations" ON organizations;
DROP POLICY IF EXISTS "Admin full access organizations" ON organizations;
DROP POLICY IF EXISTS "Read access for roles" ON roles;
DROP POLICY IF EXISTS "Admin full access roles" ON roles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access rooms" ON rooms;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
DROP POLICY IF EXISTS "Admin full access approvals" ON approvals;

-- 4. Membuat Kebijakan (Policies) RLS Baru yang mengizinkan Admin bypass

-- Organizations: Semua orang bisa melihat, hanya Admin yang bisa kelola
CREATE POLICY "Read access for organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Admin full access organizations" ON organizations FOR ALL USING (public.is_admin());

-- Roles: Semua orang bisa melihat, hanya Admin yang bisa kelola
CREATE POLICY "Read access for roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Admin full access roles" ON roles FOR ALL USING (public.is_admin());

-- Profiles: User bisa melihat & update miliknya sendiri. Admin bisa semuanya.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Rooms: Semua orang bisa melihat. Admin bisa mengelola.
CREATE POLICY "Public Read Access for Rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admin full access rooms" ON rooms FOR ALL USING (public.is_admin());

-- Bookings: User hanya bisa memproses milik mereka. Admin bisa memproses semua.
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (public.is_admin());

-- Approvals: Hanya Admin yang bisa mengelola persetujuan
CREATE POLICY "Admin full access approvals" ON approvals FOR ALL USING (public.is_admin());
