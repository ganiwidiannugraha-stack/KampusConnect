# Memory — KampusConnect Development Log

> Dokumen ini mencatat seluruh perjalanan pengembangan KampusConnect dari awal hingga saat ini.
> Setiap keputusan arsitektur, perubahan besar, dan trade-off didokumentasikan di sini.
> **Terakhir diperbarui: 12 Juli 2026**

---

## 1. Identitas Proyek

| Atribut | Nilai |
|---------|-------|
| Nama Proyek | KampusConnect — Sistem Informasi Reservasi Ruang Organisasi Kampus |
| Tim | Kelompok 6 — Mata Kuliah Analisis & Desain Sistem Informasi |
| Stack | Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + Supabase (PostgreSQL + Auth) |
| Deployment Target | Railway / Vercel |
| Repository | GitHub (private) |

---

## 2. Kronologi Pengembangan

### Fase 1 — Setup Awal & Prototyping
- Inisialisasi project dengan `create-next-app` (Next.js 15 RC + React 19)
- Pilihan awal: Vite + React, kemudian **dimigrasi ke Next.js App Router** karena kebutuhan SSR dan Server Actions
- Integrasi Tailwind CSS 4 + shadcn/ui untuk komponen UI
- Setup PostgreSQL via **Supabase** (cloud-hosted) — menggantikan rencana awal Docker + PostgreSQL lokal karena keterbatasan environment developer

### Fase 2 — Skema Database & Autentikasi
- Desain skema 6 tabel: `organizations`, `roles`, `profiles`, `rooms`, `bookings`, `approvals`
- `profiles` terhubung ke `auth.users` Supabase via FK `id` (CASCADE delete)
- Implementasi **Row Level Security (RLS)** dengan fungsi helper `is_admin()`
- Login menggunakan Supabase Auth (`signInWithPassword`) → JWT token disimpan di **httpOnly cookie** (`supabase-session`)
- Role-Based Access Control: 2 role utama — `Administrator` dan `Mahasiswa`

### Fase 3 — Katalog Ruangan (Public)
- Halaman `/rooms` menampilkan daftar ruangan aktif dengan galeri gambar
- Data dari Supabase via Server Action `getRooms()`
- Booking modal dengan form tanggal, waktu, dan tujuan kegiatan
- Validasi SOP H-3 (reservasi minimal 3 hari sebelum kegiatan)

### Fase 4 — Alur Pemesanan (Booking)
- `createBooking()` Server Action dengan validasi:
  - Field required check
  - Auth check (harus login)
  - SOP H-3 enforcement
  - Overlap/conflict detection (query database)
  - Waktu mulai < waktu selesai
- Status awal booking: `MENUNGGU`

### Fase 5 — Dashboard Admin
- Layout admin terpisah dengan sidebar navigasi
- Guard di `app/admin/layout.tsx`: redirect ke `/login` jika bukan admin
- Halaman:
  - **Dashboard** (`/admin`) — Statistik ringkasan
  - **Jadwal & Reservasi** (`/admin/schedule`) — Kalender + tabel daftar booking
  - **Kelola Ruangan** (`/admin/rooms`) — CRUD ruangan + upload gambar
  - **Pengelolaan Pengguna** (`/admin/users`) — CRUD user via Supabase Admin API
  - **Organisasi** (`/admin/organizations`) — CRUD organisasi/UKM
  - **Laporan** (`/admin/reports`) — Statistik penggunaan

### Fase 6 — Riwayat & Pembatalan (User)
- Halaman `/my-bookings` — riwayat reservasi user
- Fitur pembatalan booking dengan aturan H-1 (server-side + client-side validation)
- Download bukti reservasi dalam format PDF (via `jspdf`)

### Fase 7 — Polish UI/UX
- Beranda publik dengan hero section, fitur highlights, dan footer
- Dark mode support via `next-themes`
- Mobile responsive untuk semua halaman
- Pagination di tabel pengguna dan reservasi
- Undo mechanism pada approval admin (countdown 5 detik sebelum eksekusi)

### Fase 8 — Stabilisasi & Keamanan (Juli 2026)
- Lock semua versi dependensi (hapus prefix `^`)
- Security audit: admin guard, validasi input, cookie hardening
- Bersihkan file orphan dan debugging scripts
- Seed ulang database dengan data realistis
- Dokumentasi lengkap (memory.md)

---

## 3. Keputusan Arsitektur

### 3.1 Next.js App Router (bukan Pages Router)
**Alasan:** Server Components untuk fetch data tanpa API route, Server Actions untuk mutasi tanpa REST endpoint. Lebih sederhana untuk tim mahasiswa yang tidak perlu mengelola API layer terpisah.

### 3.2 Supabase (bukan self-hosted PostgreSQL)
**Alasan:** Docker Desktop tidak tersedia di environment lokal developer. Supabase menyediakan PostgreSQL + Auth + RLS out-of-the-box, mempercepat development.

### 3.3 Cookie-based Session (bukan localStorage)
**Alasan:** JWT disimpan di `httpOnly` cookie agar tidak bisa diakses oleh JavaScript di browser (XSS-proof). Server Actions bisa membaca cookie langsung tanpa client-side state management.

### 3.4 Server Actions (bukan API Routes)
**Alasan:** Next.js Server Actions menghilangkan kebutuhan untuk membuat REST endpoint manual. Semua mutasi (create, update, delete) dihandle sebagai fungsi server yang dipanggil langsung dari form atau client component.

### 3.5 Supabase Service Role Key untuk Admin Operations
**Alasan:** Operasi admin (create/delete user, manage semua data) membutuhkan bypass RLS. `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server-side, tidak pernah terekspos ke client.

### 3.6 Dual Supabase Client Pattern
- `getAuthClient()` — membuat Supabase client dengan JWT token user → tunduk pada RLS
- `getSupabaseAdmin()` — membuat Supabase client dengan Service Role Key → bypass RLS
- Setiap server action memilih client yang sesuai dengan kebutuhan operasinya

### 3.7 State Machine Status Booking
```
MENUNGGU → DISETUJUI → DIBATALKAN (oleh user, max H-1)
MENUNGGU → DITOLAK
```
Status bersifat satu arah (one-way), tidak bisa kembali ke status sebelumnya.

---

## 4. Peta File Utama

### Backend (Server Actions)
| File | Fungsi |
|------|--------|
| `app/actions/auth.ts` | `getCurrentUser()`, `logoutAction()` |
| `app/login/actions.ts` | `loginAction()` — autentikasi + set cookie |
| `app/booking/actions.ts` | `createBooking()`, `getRoomsForSelect()` |
| `app/(main)/my-bookings/actions.ts` | `getMyBookings()`, `cancelBooking()` |
| `app/(main)/rooms/actions.ts` | `getRooms()` — katalog publik |
| `app/admin/actions.ts` | `getBookings()`, `updateBookingStatus()`, `getDashboardStats()` |
| `app/admin/rooms/actions.ts` | `getRooms()`, `saveRoom()`, `deleteRoom()` |
| `app/admin/users/actions.ts` | `getUsers()`, `saveUser()`, `deleteUser()` |
| `app/admin/organizations/actions.ts` | `getOrganizations()`, `saveOrganization()`, `deleteOrganization()` |
| `app/admin/schedule/actions.ts` | `getScheduleBookings()` |

### Frontend (Pages)
| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `app/(main)/page.tsx` | Landing page publik |
| `/rooms` | `app/(main)/rooms/` | Katalog ruangan + booking modal |
| `/my-bookings` | `app/(main)/my-bookings/` | Riwayat reservasi user |
| `/login` | `app/login/` | Halaman login |
| `/admin` | `app/admin/page.tsx` | Dashboard admin |
| `/admin/schedule` | `app/admin/schedule/` | Kalender + tabel reservasi |
| `/admin/rooms` | `app/admin/rooms/` | CRUD ruangan |
| `/admin/users` | `app/admin/users/` | CRUD pengguna |
| `/admin/organizations` | `app/admin/organizations/` | CRUD organisasi |

### Database
| File | Fungsi |
|------|--------|
| `supabase_schema.sql` | DDL schema awal (6 tabel + RLS) |
| `setup_global_rls.sql` | Kebijakan RLS lanjutan dengan `is_admin()` |
| `seed_fresh.js` | Script seeding data realistis |

---

## 5. Konvensi Kode

- **Bahasa UI:** Indonesia (label, pesan error, status)
- **Bahasa Kode:** Inggris (variabel, fungsi, komentar teknis)
- **Naming:** camelCase untuk JS/TS, snake_case untuk kolom database
- **File Structure:** Colocate server actions (`actions.ts`) di folder route yang sama
- **Styling:** Tailwind utility classes langsung di JSX, tanpa file CSS terpisah per komponen
- **State Management:** React `useState` + `useActionState` (no external store)

---

## 6. Keamanan

### Yang Sudah Diterapkan
- [x] RLS (Row Level Security) di semua tabel Supabase
- [x] Fungsi `is_admin()` sebagai PostgreSQL function untuk guard RLS
- [x] httpOnly + secure cookie untuk session token
- [x] sameSite cookie policy (`lax`)
- [x] Admin layout guard (server-side redirect)
- [x] Server-side validation pada semua mutation (auth check, input validation)
- [x] Ownership check pada cancelBooking (user hanya bisa batalkan miliknya)
- [x] Last-admin protection (tidak bisa hapus admin terakhir)
- [x] File upload validation (MIME type + ukuran)

### Known Limitations (Trade-offs)
- Tidak ada rate limiting pada login (bergantung pada Supabase built-in rate limit)
- Tidak ada CAPTCHA pada form login
- Tidak ada audit log untuk semua operasi admin (hanya approval yang di-log ke tabel `approvals`)
- Tidak ada email notification saat status booking berubah

---

## 7. Data Seed (Akun & Data Demo)

### Akun Login
| Email | Password | Role |
|-------|----------|------|
| admin.utama@kampus.ac.id | KampusConnect2026! | Administrator |
| admin.fasilitas@kampus.ac.id | KampusConnect2026! | Administrator |
| rina.permata@kampus.ac.id | KampusConnect2026! | Mahasiswa |
| budi.santoso@kampus.ac.id | KampusConnect2026! | Mahasiswa |
| dewi.lestari@kampus.ac.id | KampusConnect2026! | Mahasiswa |
| arif.rahman@kampus.ac.id | KampusConnect2026! | Mahasiswa |
| siti.nurhaliza@kampus.ac.id | KampusConnect2026! | Mahasiswa |

### Statistik Data
- 7 Organisasi (BEM, HIMA, UKM)
- 20 Ruangan kampus
- 20 Reservasi (berbagai status)

---

## 8. Standar Operasional Prosedur (SOP) Development & Deployment

Mengingat aplikasi sudah berstatus **Live** (di-*hosting* di Vercel), setiap perubahan kode harus mengikuti aturan ketat berikut untuk mencegah *build failure* di tahap *production*:

1. **Ubah Kode**: AI Assistant melakukan modifikasi kode sesuai instruksi.
2. **Build Lokal (`npm run build`)**: AI Assistant **WAJIB** menjalankan *build* secara lokal di memori terminal setiap kali selesai mengubah kode untuk memastikan tidak ada *error* kompilasi atau masalah TypeScript.
3. **Minta Izin**: Setelah *build* sukses, AI Assistant harus meminta konfirmasi/persetujuan dari User (Gani) terlebih dahulu.
4. **Push ke Repository**: Hanya setelah mendapat izin tertulis dari User, barulah `git push` boleh dilakukan untuk men-*trigger* proses *deploy* di Vercel.

---

## 9. Update Log

| Tanggal | Perubahan |
|---------|-----------|
| Jun 2026 | Setup awal, migrasi ke Next.js App Router |
| Jun 2026 | Integrasi Supabase Auth + RLS |
| Jun 2026 | Implementasi katalog ruangan + booking flow |
| Jul 2026 | Dashboard admin, CRUD pengguna/ruangan/organisasi |
| Jul 2026 | Jadwal kalender, riwayat booking, PDF export |
| Jul 2026 | Polish UI: dark mode, responsive, pagination |
| 12 Jul 2026 | Stabilisasi: lock versi, security audit, seed data, dokumentasi |
| 13 Jul 2026 | Update layout loading state, integrasi Vercel Speed Insights, penambahan SOP Deployment |
