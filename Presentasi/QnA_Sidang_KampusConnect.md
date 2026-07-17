# 🛡️ Prediksi Pertanyaan Sidang & Jawaban (Khusus Dosen Senior Dev)

Karena dosen Anda adalah seorang **Senior Fullstack Developer**, pertanyaan yang diajukan pasti dirancang untuk mengetes apakah Anda benar-benar paham arsitektur aplikasi (bukan sekadar tau cara pakai). 

Berikut adalah skenario pertanyaan dari level *Basic* hingga *Advanced* beserta cara menjawabnya secara profesional dan teknis.

---

## LEVEL 1: Pertanyaan Pemanasan (Mengecek Pemahaman Dasar)

### 1. "Aplikasi ini dibangun menggunakan stack teknologi apa?"
**Cara Menjawab:** 
> "Aplikasi ini dibangun menggunakan bahasa pemrograman **TypeScript**. Untuk *framework frontend* dan *backend*-nya menggunakan **Next.js** (berbasis React). Sisi UI (desain) dibantu dengan **Tailwind CSS**. Sedangkan untuk database dan autentikasi, saya menggunakan **Supabase** yang berjalan di atas database relasional **PostgreSQL**."

### 2. "Saya lihat ada fitur Login Google (SSO) dan Lupa Sandi. Itu aslinya jalan (mengirim email) atau bohongan?"
**Cara Menjawab:** 
> "Secara logika *backend*, fungsinya sudah siap menggunakan fitur bawaan Supabase Auth. Namun karena di tahap ini saya menggunakan email *dummy* (palsu) dan belum melakukan konfigurasi SMTP/Client ID Google, pada bagian akhir fungsinya saya lakukan **Mocking (Simulasi)**. Tujuannya agar presentasi alur UI/UX tetap berjalan utuh dan tidak *crash* karena masalah verifikasi *provider*."

### 3. "Bagaimana kalian menerapkan model JAD (Joint Application Development) yang sudah ditentukan di materi ke dalam studi kasus ini?"
**Cara Menjawab:**
> "Sesuai dengan ketentuan materi untuk menggunakan model JAD, kami mengimplementasikannya dengan memposisikan diri seolah sedang melakukan lokakarya (workshop) bersama *end-user*, yaitu pihak kemahasiswaan dan admin kampus. Studi kasus *KampusConnect* ini lahir dari proses tersebut, dimana perancangan Use Case dan ERD kami buat sangat spesifik untuk langsung memecahkan masalah birokrasi peminjaman ruang yang ada di lapangan, bukan sekadar perancangan sepihak dari sisi *developer*."

---

## LEVEL 2: Pertanyaan Menengah (Arsitektur Frontend - Backend)

### 4. "Di Next.js kan ada pemisahan Client Component dan Server Component. Coba jelaskan kapan kamu pakai Client dan kapan pakai Server Component?"
**Cara Menjawab:**
> "Secara *default*, saya menggunakan **Server Component** agar proses memuat data (fetch) terjadi di server, sehingga aplikasi lebih cepat dan aman (kredensial database tidak bocor). Saya baru mengubahnya menjadi **Client Component** (dengan deklarasi `'use client'`) jika komponen tersebut membutuhkan interaksi langsung dari pengguna (seperti `onClick`), penggunaan *form state*, atau butuh React Hooks seperti `useState` dan `useEffect`."

### 5. "Bagaimana cara aplikasi kamu mengirim data (misal data form booking) ke database tanpa menggunakan API (REST API) tradisional?"
**Cara Menjawab:**
> "Saya memanfaatkan fitur **Server Actions** dari Next.js. Jadi, logika mutasi data (seperti `INSERT` ke tabel booking) saya tulis sebagai *async function* murni di sisi server. Fungsi server ini kemudian di-*import* langsung ke *form* di frontend. Ini membuat kode jauh lebih bersih dan menghilangkan kebutuhan pembuatan *endpoint* API secara manual."

### 6. "Kalau saya iseng memanipulasi URL browser dan memaksa masuk ke halaman `/admin`, bagaimana sistem kamu mencegahnya?"
**Cara Menjawab:**
> "Sistem akan memblokirnya, Pak. Saya sudah memasang *Route Guarding* (penjaga rute) di file `layout.tsx` khusus bagian admin. Saat halaman admin diakses, sistem di server akan membaca sesi (token JWT) dari *cookies* pengguna. Jika terdeteksi perannya bukan Administrator, sistem akan otomatis me-redirect (*lempar balik*) pengguna ke beranda atau halaman login."

---

## LEVEL 3: Pertanyaan Sulit (Database, Keamanan & Logika Bisnis)

### 7. "Misal ada mahasiswa nakal yang pintar Inspect Element / memanipulasi request jaringan, bisakah dia membatalkan reservasi milik mahasiswa lain?"
**Cara Menjawab:**
> "Tidak bisa, Pak. Pengamanan sistem ini tidak hanya di level antarmuka (frontend). Di level database (PostgreSQL), saya menerapkan aturan **RLS (Row Level Security)**. Aturan ini memastikan operasi `DELETE` atau `UPDATE` pada tabel reservasi hanya akan berhasil jika ID pengguna (*user ID*) yang meminta request sama persis dengan *user ID* pemilik data tersebut, kecuali request datang dari Admin."

### 8. "Bagaimana logika sistem kamu mencegah terjadinya bentrok jadwal? (Dua orang mem-booking ruangan yang sama di jam yang sama)."
**Cara Menjawab:**
> "Di dalam fungsi `createBooking` di backend, sebelum perintah `INSERT` dieksekusi, sistem akan melakukan pengecekan data (`SELECT`) ke tabel reservasi terlebih dahulu. Sistem mencari apakah ada jadwal yang berstatus **DISETUJUI** pada `ruangan_id` dan `tanggal` yang sama, dimana rentang waktu `jam_mulai` dan `jam_selesai` beririsan (overlap). Jika query menemukan irisan waktu, sistem akan menggagalkan *booking* dan mengembalikan pesan error."

### 9. "Berdasarkan ERD kamu, kenapa tabel Persetujuan (Approval) dipisah dari tabel Reservasi? Kan statusnya bisa ditaruh saja di dalam tabel Reservasi?"
**Cara Menjawab:**
> "Pemisahan ini adalah bentuk normalisasi *database* untuk kebutuhan **Audit Trail** (Jejak Rekam). Memang status singkat ada di tabel reservasi, tapi tabel khusus *Approval* memungkinkan kita mencatat secara pasti **siapa (ID Admin)** yang menyetujui/menolak, di **jam berapa**, dan **apa catatannya**. Jika di masa depan kampus butuh sistem persetujuan bertingkat (misal: BEM dulu, baru Dosen Kemahasiswaan), desain terpisah ini sudah sangat siap mengakomodasi hal tersebut tanpa merusak tabel utama."

### 10. "Saya perhatikan di ERD kalian ada tabel Gedung, Fasilitas, dan Lampiran, tapi di aplikasi web dan database aslinya sepertinya disederhanakan/tidak ada. Kenapa berbeda?"
**Cara Menjawab:**
> "Betul Pak. Sesuai dengan metode JAD, seluruh kebutuhan sistem (*Enterprise Requirements*) sudah kami petakan secara tuntas di awal bersama pengguna, yang tertuang dalam ERD ini sebagai **Logical Design (Blue-print)**. Namun pada fase implementasi fisik (*Coding*), kami memprioritaskan pengerjaan **Core Requirements** (Kebutuhan Utama) yang paling mendesak disepakati saat sesi JAD, yaitu: Pengguna, Ruangan, dan Alur Reservasi. Aplikasi yang kami demokan hari ini adalah realisasi dari prioritas utama tersebut. Tabel pelengkap seperti Gedung dan Lampiran sudah kami siapkan di ERD agar implementasi fisiknya di tahap (fase) selanjutnya tidak akan merusak struktur relasi utama yang sudah berjalan."
