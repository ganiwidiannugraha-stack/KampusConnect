-- Kebijakan Akses (RLS) untuk Tabel Ruangan (Rooms)
-- Mengizinkan operasi INSERT, UPDATE, dan DELETE
CREATE POLICY "Enable insert for all users" ON "public"."rooms" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."rooms" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."rooms" AS PERMISSIVE FOR DELETE TO public USING (true);

-- Kebijakan Akses (RLS) untuk Tabel Profil/Pengguna (Profiles)
-- Mengizinkan operasi UPDATE dan DELETE (jika diperlukan oleh Admin)
CREATE POLICY "Enable update for all users on profiles" ON "public"."profiles" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users on profiles" ON "public"."profiles" AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY "Enable insert for all users on profiles" ON "public"."profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

-- Kebijakan Akses untuk Master Data lainnya (jika diperlukan)
CREATE POLICY "Enable all for roles" ON "public"."roles" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for organizations" ON "public"."organizations" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
