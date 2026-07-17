# 📝 Contekan Code Review untuk Gani

Karena kamu dapet bagian **Code Review** (Buka VS Code dan jelasin kode), santai aja! Nggak usah pakai bahasa dewa/terlalu teknis, pakai bahasa sehari-hari aja biar gampang dimengerti dosen/audiens dan nggak memancing pertanyaan susah. 

Berikut adalah panduan **di mana letak filenya**, **apa yang ditunjukin**, dan **cara ngomongnya**.

---

## 1. Validasi Bentrok Jadwal (Mencegah Booking Double)
*Fitur paling penting: Gimana caranya kalau ada 2 orang mau pinjam ruang & jam yang sama, sistem bisa nolak otomatis?*

- **Buka File:** `app/booking/actions.ts`
- **Scroll ke Baris:** Sekitar baris `114` (Cari tulisan `CEK BENTROK JADWAL`)
- **Cara Ngomongnya:**
  > "Oke, bagian pertama yang mau saya tunjukin adalah inti dari aplikasi ini, yaitu validasi biar jadwal nggak bentrok. Kodenya ada di `app/booking/actions.ts`. 
  > 
  > Di sini sistem kita bakal nanya ke database (Supabase): *'Eh, ada nggak reservasi di ruangan ini, di tanggal ini, yang statusnya belum dibatalkan/ditolak?'* 
  > Nah, logika irisannya sederhana: Kalau **jam mulai acara lama** ternyata kurang dari **jam selesai acara baru**, DAN **jam selesainya** lebih dari **jam mulai acara baru**, berarti waktunya nabrak. Kalau ketemu ada data yang nabrak, sistem langsung nolak dan keluarin pesan error."

---

## 2. Login & Proteksi Route Per Role (Admin vs Mahasiswa)
*Gimana caranya admin bisa masuk ke dashboard admin, tapi mahasiswa biasa nggak bisa?*

- **Buka File:** `middleware.ts` (di folder paling luar)
- **Scroll ke Baris:** Sekitar baris `18` (Cari tulisan `Fungsi utama middleware`)
- **Cara Ngomongnya:**
  > "Selanjutnya soal keamanan dan hak akses. Kami pakai file `middleware.ts`. Middleware ini ibarat satpam di pintu depan website kita.
  > 
  > Setiap kali ada orang yang mau buka URL `/admin`, satpam ini bakal ngecek: *'Kamu punya token login (cookie) nggak?'* Kalau punya, dia bakal ngecek lagi ke dalam tokennya, *'Role kamu ini beneran Administrator bukan?'* 
  > Kalau ternyata yang mau masuk cuma mahasiswa biasa, sistem bakal langsung melempar (redirect) dia kembali ke halaman utama. Jadi data admin dijamin aman dari akses sembarangan."

---

## 3. Proses Approve oleh Admin (Salah satu CRUD)
*Gimana sih sistemnya pas Admin nge-klik tombol 'Setujui' atau 'Tolak'?*

- **Buka File:** `app/admin/actions.ts`
- **Scroll ke Baris:** Sekitar baris `91` (Cari fungsi `updateBookingStatus`)
- **Cara Ngomongnya:**
  > "Untuk contoh proses CRUD (Create, Read, Update, Delete), saya mau tunjukin pas admin nge-approve atau nolak reservasi. Kodenya ada di fungsi `updateBookingStatus`.
  > 
  > Pertama, sistem pastiin dulu nih kalau yang ngeklik beneran admin. Terus, sistem jalanin perintah `update` ke tabel `reservasi` di database buat ngubah statusnya jadi 'Disetujui' atau 'Ditolak'. 
  > Yang menarik di sini, selain ngubah status, sistem kita juga otomatis nyatet ke tabel `approval` sebagai *history* (riwayat). Jadi ketahuan siapa admin yang memprosesnya."

---

## 4. Generate PDF Laporan
*Gimana caranya data di web bisa di-download jadi file PDF rapi?*

- **Buka File:** `app/admin/reports/ExportPDFButton.tsx`
- **Scroll ke Baris:** Sekitar baris `20` (Cari fungsi `exportToPDF`)
- **Cara Ngomongnya:**
  > "Yang terakhir, saya mau tunjukin fitur andalan admin, yaitu cetak laporan ke PDF.
  > 
  > Di sini kami menggunakan *library* tambahan bernama `jspdf` dan `jspdf-autotable`. Logikanya gampang: pas admin klik tombol 'Export PDF', kodenya bakal bikin dokumen kosong dulu. Lalu, kita tambahin kop surat seperti judul dan tanggal laporannya. 
  > Setelah itu, data tabel yang ada di layar (HTML) bakal 'ditangkap' dan diubah menjadi bentuk tabel PDF menggunakan fungsi `autoTable()`. Habis itu, langsung di-save ke komputer admin."

---

### 💡 Tips Tambahan Buat Gani:
1. Pas kamu ngomong, **jangan cuma diam di satu layar**. Sambil ngomong, blok kodenya pelan-pelan pakai mouse biar dosen tahu mana yang lagi kamu bahas.
2. Kalau dosen tanya: *"Kenapa logicnya ditaruh di actions.ts bukan langsung di halamannya?"*
   **Jawab aja:** *"Karena kita pakai Next.js App Router (Server Actions) Pak/Bu, jadi logikanya ditaruh di backend (server) biar lebih aman dan database kita nggak bisa di-hack/dilihat dari browser (Client)."*
3. Baca naskah ini 2-3 kali sebelum tampil biar luwes dan kelihatan jago! Semangat! 🔥
