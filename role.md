# Arsitektur Role & Keamanan (Global RLS)
Sistem KampusConnect menggunakan arsitektur keamanan **Row-Level Security (RLS) berbasis Role** di sisi Database (Supabase). Ini berarti aturan hak akses diterapkan secara *global* di level *database*, sehingga sistem jauh lebih aman dan bersih dari celah *bypass* di sisi *backend*.

---

## 1. Daftar Role
Sistem ini menggunakan 2 (dua) tipe *role* utama yang tersimpan di tabel `roles`:

### A. Administrator
- **Fungsi:** Mengelola seluruh sistem (ruangan, pengguna, organisasi, dan persetujuan reservasi).
- **Akses Database (RLS):** Memiliki akses "Dewa". Berkat fungsi keamanan SQL `is_admin()`, database akan selalu mengizinkan fungsi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` ke semua tabel untuk pengguna dengan role ini secara otomatis.
- **Akses UI:** Dapat mengakses menu Admin Dashboard (`/admin/*`).

### B. Mahasiswa
- **Fungsi:** Pengguna umum (mahasiswa/UKM) yang ingin meminjam ruangan.
- **Akses Database (RLS):** Sangat dibatasi oleh Row-Level Security (RLS).
  - Hanya bisa melihat & mengubah data profil (`profiles`) miliknya sendiri.
  - Hanya bisa melihat, membuat, & membatalkan reservasi (`bookings`) miliknya sendiri.
  - Bisa melihat daftar ruangan (`rooms`) dan organisasi (`organizations`) secara *read-only*.
- **Akses UI:** Hanya dapat mengakses halaman publik, katalog ruangan (`/rooms`), dan riwayat reservasinya sendiri (`/my-bookings`).

---

## 2. Pengecualian Akses Admin Global (Fungsi `is_admin`)
Kita **tidak lagi menggunakan *bypass token*** (seperti `supabaseAdmin` / `Service Role Key`) di dalam fungsi *backend*. Sebagai gantinya, Database Supabase secara cerdas mengenali siapa yang sedang mengakses data melalui **PostgreSQL Function**:

```sql
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Mengecek apakah auth.uid() saat ini terhubung dengan role 'Administrator'
  SELECT (r.name = 'Administrator') INTO v_is_admin
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  RETURN coalesce(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

Dengan fungsi ini, setiap kebijakan RLS di tabel-tabel utama dimodifikasi untuk selalu memberikan "Pengecualian Khusus" bagi Admin. Contoh pada tabel `bookings`:
```sql
-- User biasa hanya bisa memanipulasi booking miliknya sendiri (auth.uid() = user_id)
-- ATAU database otomatis memberikan izin penuh jika dia adalah Admin (public.is_admin())
CREATE POLICY "Users can update their own bookings" ON bookings 
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
```

---

## 3. Alur Komunikasi yang Bersih (Backend ke Database)
Karena keamanan RLS sekarang sudah mengenali *role* secara mandiri, kode Next.js (Backend) kita menjadi sangat bersih dan tersentralisasi:
1. **User/Admin login** melalui Supabase Auth.
2. **Next.js menyimpan token JWT otentikasi** di dalam *cookies* browser klien.
3. Saat Next.js butuh mengambil atau merubah data (misal fungsi `getBookings()` atau `createBooking()`), Next.js menggunakan `getAuthClient()`.
4. `getAuthClient()` bertugas menyuntikkan token dari *cookies* browser dan mengirimkannya ke Supabase.
5. **Database (Supabase) menerima token tersebut** dan membaca identitas `auth.uid()`.
6. Database mengeksekusi fungsi `is_admin()`. Jika hasilnya `true`, semua data terkait akan dikembalikan (Bypass). Jika `false`, aturan normal dijalankan di mana *user* hanya dapat melihat datanya sendiri.
7. Tidak ada *Service Key* yang disalahgunakan di level aplikasi, menjadikannya sistem dengan standar keamanan level produksi (*Production-Ready*).
