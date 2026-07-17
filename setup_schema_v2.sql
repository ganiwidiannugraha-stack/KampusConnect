-- ==========================================
-- KAMPUSCONNECT V2 (FULL ERD SCHEMA)
-- Harap jalankan seluruh skrip ini di menu SQL Editor Supabase.
-- ==========================================

-- 1. CLEANUP (Menghapus tabel lama jika ada agar bersih)
DROP TABLE IF EXISTS lampiran CASCADE;
DROP TABLE IF EXISTS approval CASCADE;
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS reservasi CASCADE;
DROP TABLE IF EXISTS ruangan_fasilitas CASCADE;
DROP TABLE IF EXISTS fasilitas CASCADE;
DROP TABLE IF EXISTS jadwal_ruangan CASCADE;
DROP TABLE IF EXISTS ruangan CASCADE;
DROP TABLE IF EXISTS gedung CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS organisasi CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. CREATE MASTER TABLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
INSERT INTO roles (name) VALUES ('Administrator'), ('Mahasiswa');

CREATE TABLE organisasi (
    id_organisasi SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(50) NOT NULL,
    pembina VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gunakan auth.users sebagai basis otentikasi. Kita buat public.profiles sebagai mappingnya (di ERD namanya users).
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id),
    id_organisasi INT REFERENCES organisasi(id_organisasi),
    nama VARCHAR(100) NOT NULL,
    nim VARCHAR(20),
    no_hp VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    foto VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gedung (
    id_gedung SERIAL PRIMARY KEY,
    nama_gedung VARCHAR(100) NOT NULL,
    lokasi VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fasilitas (
    id_fasilitas SERIAL PRIMARY KEY,
    nama_fasilitas VARCHAR(100) NOT NULL,
    icon VARCHAR(100)
);

CREATE TABLE ruangan (
    id_ruangan SERIAL PRIMARY KEY,
    id_gedung INT NOT NULL REFERENCES gedung(id_gedung) ON DELETE CASCADE,
    nama_ruangan VARCHAR(100) NOT NULL,
    kapasitas INT NOT NULL,
    lantai INT,
    deskripsi TEXT,
    status VARCHAR(50) DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Maintenance', 'Tidak Aktif')),
    foto VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many to Many: Ruangan <-> Fasilitas
CREATE TABLE ruangan_fasilitas (
    id SERIAL PRIMARY KEY,
    id_ruangan INT NOT NULL REFERENCES ruangan(id_ruangan) ON DELETE CASCADE,
    id_fasilitas INT NOT NULL REFERENCES fasilitas(id_fasilitas) ON DELETE CASCADE
);

CREATE TABLE jadwal_ruangan (
    id_jadwal SERIAL PRIMARY KEY,
    id_ruangan INT NOT NULL REFERENCES ruangan(id_ruangan) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Terjadwal', 'Maintenance', 'Kosong'))
);

CREATE TABLE reservasi (
    id_reservasi SERIAL PRIMARY KEY,
    kode_reservasi VARCHAR(20) UNIQUE NOT NULL,
    id_user UUID NOT NULL REFERENCES profiles(id),
    id_ruangan INT NOT NULL REFERENCES ruangan(id_ruangan),
    tanggal_pengajuan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tanggal_pakai DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    jumlah_peserta INT NOT NULL,
    keperluan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan', 'Selesai')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id_log SERIAL PRIMARY KEY,
    id_user UUID REFERENCES profiles(id),
    aktivitas TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifikasi (
    id_notifikasi SERIAL PRIMARY KEY,
    id_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    judul VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE approval (
    id_approval SERIAL PRIMARY KEY,
    id_reservasi INT NOT NULL REFERENCES reservasi(id_reservasi) ON DELETE CASCADE,
    id_admin UUID REFERENCES profiles(id),
    status VARCHAR(20) CHECK (status IN ('Disetujui', 'Ditolak')),
    catatan TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lampiran (
    id_lampiran SERIAL PRIMARY KEY,
    id_reservasi INT NOT NULL REFERENCES reservasi(id_reservasi) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gedung ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruangan_fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampiran ENABLE ROW LEVEL SECURITY;

-- 4. FUNCTION HELPER & TRIGGER (Update Timestamp)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function untuk updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organisasi_modtime BEFORE UPDATE ON organisasi FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_gedung_modtime BEFORE UPDATE ON gedung FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_ruangan_modtime BEFORE UPDATE ON ruangan FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_reservasi_modtime BEFORE UPDATE ON reservasi FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 5. RLS POLICIES (Simplified for MVP V2 bypass)
-- Untuk fase V2 ini, agar pengembangan cepat dan tidak terhalang hak akses, kita buka Select untuk publik
-- Sedangkan Insert/Update/Delete dibatasi untuk user yang sesuai atau Admin.
CREATE POLICY "Public Read Organizations" ON organisasi FOR SELECT USING (true);
CREATE POLICY "Admin Full Organizations" ON organisasi FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Roles" ON roles FOR SELECT USING (true);

CREATE POLICY "User Select Profile" ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "User Update Profile" ON profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin Full Profile" ON profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Gedung" ON gedung FOR SELECT USING (true);
CREATE POLICY "Admin Full Gedung" ON gedung FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Fasilitas" ON fasilitas FOR SELECT USING (true);
CREATE POLICY "Admin Full Fasilitas" ON fasilitas FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Ruangan" ON ruangan FOR SELECT USING (true);
CREATE POLICY "Admin Full Ruangan" ON ruangan FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Ruangan Fasilitas" ON ruangan_fasilitas FOR SELECT USING (true);
CREATE POLICY "Admin Full Ruangan Fasilitas" ON ruangan_fasilitas FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Jadwal" ON jadwal_ruangan FOR SELECT USING (true);
CREATE POLICY "Admin Full Jadwal" ON jadwal_ruangan FOR ALL USING (public.is_admin());

CREATE POLICY "User Select Reservasi" ON reservasi FOR SELECT USING (auth.uid() = id_user OR public.is_admin());
CREATE POLICY "User Insert Reservasi" ON reservasi FOR INSERT WITH CHECK (auth.uid() = id_user OR public.is_admin());
CREATE POLICY "User Update Reservasi" ON reservasi FOR UPDATE USING (auth.uid() = id_user OR public.is_admin());
CREATE POLICY "Admin Full Reservasi" ON reservasi FOR ALL USING (public.is_admin());

CREATE POLICY "User Select Lampiran" ON lampiran FOR SELECT USING (
    EXISTS (SELECT 1 FROM reservasi WHERE reservasi.id_reservasi = lampiran.id_reservasi AND (reservasi.id_user = auth.uid() OR public.is_admin()))
);
CREATE POLICY "User Insert Lampiran" ON lampiran FOR INSERT WITH CHECK (true); -- Dibatasi di backend server action
CREATE POLICY "Admin Full Lampiran" ON lampiran FOR ALL USING (public.is_admin());

CREATE POLICY "User Select Notifikasi" ON notifikasi FOR SELECT USING (auth.uid() = id_user OR public.is_admin());
CREATE POLICY "User Update Notifikasi" ON notifikasi FOR UPDATE USING (auth.uid() = id_user OR public.is_admin());
CREATE POLICY "Admin Full Notifikasi" ON notifikasi FOR ALL USING (public.is_admin());

CREATE POLICY "Admin Full Approval" ON approval FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Full Activity Logs" ON activity_logs FOR ALL USING (public.is_admin());

-- 6. DUMMY DATA SEEDING (Untuk mempercepat Demo V2)
INSERT INTO gedung (nama_gedung, lokasi) VALUES 
('Gedung Utama (Rektorat)', 'Kampus Pusat'),
('Gedung Kuliah Bersama (GKB)', 'Sayap Timur'),
('Gedung Unit Kegiatan Mahasiswa', 'Sayap Barat');

INSERT INTO fasilitas (nama_fasilitas, icon) VALUES 
('Proyektor LCD', 'Projector'),
('Papan Tulis (Whiteboard)', 'Presentation'),
('AC Central', 'Wind'),
('Sound System', 'Speaker'),
('Kursi Kuliah', 'Armchair');

-- Tambahkan 1 ruangan contoh
INSERT INTO ruangan (id_gedung, nama_ruangan, kapasitas, lantai, deskripsi) VALUES 
(1, 'Aula Utama Rektorat', 500, 1, 'Aula besar untuk seminar dan acara universitas.');

INSERT INTO ruangan_fasilitas (id_ruangan, id_fasilitas) VALUES 
(1, 1), (1, 3), (1, 4);

-- 7. GRANT PERMISSIONS (SANGAT PENTING UNTUK SUPABASE API)
-- Memberikan hak akses agar PostgREST API bisa membaca tabel-tabel ini
GRANT ALL ON TABLE public.roles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.organisasi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.gedung TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.fasilitas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ruangan TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ruangan_fasilitas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.jadwal_ruangan TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reservasi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.activity_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifikasi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.approval TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lampiran TO anon, authenticated, service_role;

-- Juga grant USAGE ke sequence-nya agar Insert berhasil
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Paksa reload API schema
NOTIFY pgrst, 'reload schema';
