# KampusConnect 🎓
Sistem Informasi Manajemen Fasilitas & Reservasi Kampus terintegrasi, dirancang untuk menyederhanakan proses peminjaman ruangan, manajemen kapasitas, dan analitik penggunaan fasilitas secara real-time.

## 🏗 Architecture Overview

Aplikasi ini dibangun menggunakan arsitektur modern berbasis **Serverless & Edge-ready**, memisahkan layer presentasi (Client Components) dari logika bisnis (Server Actions) guna mencapai performa maksimal dan keamanan tingkat tinggi.

- **Frontend**: Next.js 15 (App Router) dengan React 19. Memanfaatkan React Server Components (RSC) untuk mengurangi *JavaScript payload* di sisi klien.
- **Backend/BaaS**: Supabase (PostgreSQL) sebagai *primary data store*, menangani autentikasi, otorisasi via Row Level Security (RLS), dan manajemen relasi data.
- **Styling**: Tailwind CSS v4 untuk *utility-first styling* dikombinasikan dengan prinsip *Glassmorphism* dan *Micro-interactions*.
- **State Management**: Kombinasi *URL-based state* (untuk filtering/search) dan React hooks lokal, menghindari kompleksitas *global store* yang tidak perlu (seperti Redux).

## 🚀 Tech Stack

### Core Technologies
- **Next.js 15.0.0-rc.0** (App Router, Server Actions, Edge Runtime ready)
- **React 19** (Hooks, Suspense, Concurrent Features)
- **TypeScript** (Strict mode typing)
- **Supabase** (PostgreSQL, GoTrue Auth)

### UI & Styling
- **Tailwind CSS** (Custom utilities, dark mode compatibility)
- **Lucide React** (Consistent SVG iconography)
- **CSS Modules / Globals** (Animasi custom seperti `fade-in`, `slide-in`)

## 💡 Fitur Utama (Core Features)

1. **Role-Based Access Control (RBAC)**
   Sistem otorisasi granular yang memisahkan kapabilitas antara `User` (Pemohon) dan `Administrator` (Pengelola). Admin memiliki akses penuh ke Dashboard analitik, sedangkan User dibatasi pada riwayat dan pengajuan individu.

2. **Real-time Admin Dashboard**
   - **Metrics Aggregation**: Menghitung total reservasi, rasio persetujuan (approval rate), dan kapasitas aktif/non-aktif.
   - **Dynamic Usage Stats**: Grafik analitik interaktif dengan filter dinamis (1 Hari, 1 Minggu, 1 Bulan, dll.) yang memproses data berbasis *timestamp* secara asinkron.

3. **Advanced Filtering & Search**
   Katalog ruangan mendukung pencarian multi-dimensi (Kapasitas, Area, Tipe, Fasilitas) yang dioptimasi tanpa *re-render* berlebih menggunakan *memoization* dan manipulasi state array yang efisien.

4. **Performance & SEO Optimization**
   - Implementasi `loading="lazy"` dan `decoding="async"` pada rendering gambar (Katalog Ruang).
   - Penggunaan `fetchPriority` untuk *Hero Image* / Logo guna menekan skor LCP (Largest Contentful Paint).
   - Skor Core Web Vitals (Pagespeed) rata-rata hijau di tahap *production*.

## 📂 Project Structure

Struktur direktori mematuhi standar *feature-based routing* dari Next.js App Router:

```text
├── app/
│   ├── (main)/              # Publik routing (Beranda, Katalog, Reservasi Saya)
│   ├── admin/               # Protected routing (Dashboard, Manajemen Pengguna, Laporan)
│   ├── login/               # Modul autentikasi
│   ├── layout.tsx           # Root layout & providers
│   └── globals.css          # Tailwind directives & custom CSS animations
├── components/              # Shared UI components (Navbar, Footer, ScrollToTop)
└── public/                  # Static assets (Images, Icons)
```

## 🔐 Security Best Practices

1. **Server Actions Guarding**: Semua *mutations* (seperti `updateBookingStatus`) dilindungi oleh fungsi `requireAdmin()` di sisi server. Memastikan bahwa API tidak bisa di-*bypass* lewat eksekusi *client-side*.
2. **Environment Variables**: *Keys* yang bersifat krusial (`SUPABASE_SERVICE_ROLE_KEY`) diisolasi secara ketat di `.env.local` dan tidak terekspos ke klien.
3. **Graceful Degradation**: Penggunaan *skeleton loaders* dan proteksi rute mencegah UI pecah ketika koneksi bermasalah atau data kosong.

## 🛠 Instalasi & Development Lokal

### Persyaratan Sistem (Prerequisites)
- Node.js versi 18.x atau lebih baru.
- Akun Supabase (untuk konfigurasi URL dan Anon Key).

### Langkah-langkah Setup

1. **Kloning Repositori & Instalasi Dependensi**
   ```bash
   git clone <repository_url>
   cd KampusConnect
   npm install
   ```

2. **Konfigurasi Environment**
   Buat file `.env.local` di root proyek dan tambahkan kredensial database Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Menjalankan Server Development**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Kompilasi Production (Uji Performa Asli)**
   Untuk menguji performa nyata (seperti saat *deploy*), jalankan mode produksi:
   ```bash
   npm run build
   npm start
   ```

---
*Dokumentasi ini disusun secara profesional untuk keperluan peninjauan teknis (Technical Review).*