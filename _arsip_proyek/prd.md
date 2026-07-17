# PRD — KampusConnect (Versi Sidang/Defense)
## Sistem Informasi Reservasi Ruang Organisasi Kampus
**Versi:** 2.0 — diperkuat untuk antisipasi pertanyaan penguji  
**Disusun oleh:** Kelompok 6 — Analisis & Desain Sistem Informasi

> Dokumen ini melanjutkan PRD versi 1.0 dengan fokus tambahan: penjelasan **kenapa**, bukan
> cuma **apa**. Penguji yang web developer aktif biasanya menggali logika sistem, bukan
> tampilan. Bagian 13 di bawah berisi simulasi pertanyaan + jawaban yang disiapkan.

---

## 1. RINGKASAN (tetap dari versi 1.0)

KampusConnect mengganti proses booking ruang UKM/Himpunan yang sebelumnya manual (WhatsApp +
kertas) dengan sistem terpusat berbasis web, dirancang lewat sesi JAD bersama 5 perwakilan
UKM, 2 staf Kemahasiswaan, dan tim IT.

Lihat `PRD_KampusConnect.md` (versi 1.0) untuk detail lengkap stakeholder, scope, functional
requirements, dan timeline. Dokumen ini fokus pada penguatan logika sistem.

---

## 2. CORE BUSINESS LOGIC — Detail untuk Dipertanggungjawabkan

### 2.1 Algoritma Deteksi Bentrok Jadwal

Ini bagian paling krusial sistem dan paling sering ditanya. Logikanya:

```
Dua slot waktu (A dan B) dianggap BENTROK jika:
   A.start_time < B.end_time  DAN  A.end_time > B.start_time

Dengan kondisi tambahan:
   - Hanya dibandingkan dengan booking yang statusnya DISETUJUI atau MENUNGGU
     (booking DITOLAK/DIBATALKAN tidak dihitung sebagai penghalang)
   - Hanya dibandingkan pada room_id dan date yang sama
```

**Kenapa booking berstatus MENUNGGU juga dihitung sebagai penghalang?**
Supaya tidak terjadi situasi 2 UKM sama-sama menunggu approval untuk slot yang sama, lalu
admin bingung approve yang mana. Begitu satu booking masuk status MENUNGGU, slot itu
"di-soft-lock" — booking lain di slot sama otomatis ditolak sistem sebelum sampai ke admin.

**Race condition — dua user submit di detik yang sama:**
Ditangani dengan database transaction (`Prisma $transaction`) + unique constraint composite
di level database pada kombinasi `(room_id, date, time_range)` menggunakan PostgreSQL
exclusion constraint (`EXCLUDE USING gist`). Ini bukan cuma `UNIQUE` biasa karena yang perlu
dicegah adalah *overlap rentang waktu*, bukan kesamaan nilai persis.

```sql
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
  room_id WITH =,
  daterange(date, date, '[]') WITH &&,
  tsrange(start_time, end_time) WITH &&
) WHERE (status IN ('MENUNGGU', 'DISETUJUI'));
```

Jadi jawaban untuk "apa yang terjadi kalau dua mahasiswa klik submit bersamaan": database
sendiri yang menolak salah satunya, bahkan kalau validasi di level aplikasi entah bagaimana
ke-bypass. Ini disebut **defense in depth** — validasi berlapis, bukan mengandalkan satu titik.

### 2.2 State Machine Status Booking

```
        ┌──────────┐
        │ MENUNGGU │ ← state awal saat booking dibuat
        └────┬─────┘
       approve│  │reject
             ▼  ▼
    ┌──────────┐  ┌──────────┐
    │ DISETUJUI│  │ DITOLAK  │ ← state akhir, tidak bisa berubah lagi
    └────┬─────┘  └──────────┘
         │ user batalkan (maks H-1)
         ▼
    ┌──────────┐
    │DIBATALKAN│ ← state akhir
    └──────────┘
```

Transisi yang **tidak diizinkan** secara sengaja:
- DITOLAK → DISETUJUI (kalau admin salah klik, solusinya user booking ulang, bukan ubah
  status booking lama — supaya histori approval tetap akurat untuk audit)
- DISETUJUI → MENUNGGU (tidak ada "undo approval", harus eksplisit dibatalkan)

Implementasi: guard logic di service layer (`booking.service.ts`), bukan validasi di
controller atau—lebih buruk—cuma di frontend.

### 2.3 Kenapa Soft Delete, Bukan Hard Delete

Tabel `rooms` dan `users` tidak pernah benar-benar dihapus dari database. Field `is_active`
dipakai untuk menandai nonaktif. Alasannya konkret: tabel `bookings` punya foreign key ke
keduanya untuk keperluan riwayat dan laporan. Kalau ruang dihapus permanen padahal ada 50
histori booking yang merujuk ke ruang itu, laporan bulanan akan rusak (data orphan) atau,
kalau pakai `ON DELETE CASCADE`, histori booking ikut terhapus — yang justru menghilangkan
data yang seharusnya dipertahankan untuk akuntabilitas.

### 2.4 Kenapa Booking Hanya Bisa Dibatalkan Maksimal H-1

Aturan ini lahir langsung dari sesi JAD — staf Kemahasiswaan menyatakan kebutuhan waktu
minimal untuk realokasi ruang ke UKM lain yang mungkin butuh slot tersebut. Ini contoh konkret
requirement yang didapat dari workshop JAD, bukan asumsi tim IT — bagus untuk ditunjukkan ke
penguji sebagai bukti penerapan metodologi JAD yang nyata, bukan cuma teori di slide.

---

## 3. KEAMANAN (detail teknis)

| Aspek | Implementasi | Alasan |
|-------|---------------|--------|
| Password storage | bcrypt, salt rounds 10-12 | Tidak reversible, tahan brute-force dengan cost factor |
| Autentikasi | JWT, expired 8 jam, refresh token terpisah | Stateless — cocok untuk arsitektur API terpisah dari frontend |
| Otorisasi | Role-based middleware di setiap route backend | Frontend hanya sembunyikan UI, backend yang benar-benar menolak akses |
| Input validation | Zod schema di frontend DAN backend (shared shape) | Frontend untuk UX, backend untuk keamanan—tidak saling menggantikan |
| SQL Injection | Prisma ORM parameterized query otomatis | Tidak ada raw query string concatenation |
| Rate limiting | express-rate-limit pada endpoint login & booking | Cegah brute-force login dan spam booking |

**Pertanyaan jebakan klasik:** "Kalau saya hapus tombol Approve dari frontend pakai DevTools,
apa admin lain bisa tetap approve lewat API langsung?" Jawaban: tidak, karena role check ada
di middleware backend (`authorize(['admin', 'superadmin'])`), bukan cuma kontrol visibility di
frontend.

---

## 4. SKALABILITAS — Antisipasi Pertanyaan "Bagaimana Kalau Skalanya Besar?"

| Skenario | Penanganan |
|----------|-----------|
| UKM bertambah jadi 100+ | Tidak ada perubahan arsitektur — `organization_id` sudah dirancang sebagai FK terpisah dari user, jadi penambahan UKM baru hanya insert row |
| Ruang bertambah jadi 50+ | Index pada `(room_id, date)` di tabel bookings untuk query cepat saat cek ketersediaan |
| Concurrent user tinggi saat jam sibuk pendaftaran | Connection pooling Prisma + PostgreSQL; constraint exclusion di DB tetap jadi safety net terakhir |
| Data historis menumpuk (>5 tahun) | Strategi arsip: booking lebih dari 2 tahun bisa dipindah ke tabel `bookings_archive` (belum diimplementasi di prototype, tapi disebutkan sebagai pertimbangan desain) |

---

## 5. PENGUJIAN (Testing Strategy)

| Level | Fokus | Tools |
|-------|-------|-------|
| Unit test | Logic `checkRoomConflict()`, state machine transisi status | Vitest |
| Integration test | Endpoint `/bookings` POST dengan skenario bentrok | Supertest |
| Manual/UAT | Skenario nyata bersama 5 perwakilan UKM (sesuai sesi JAD) | Checklist manual |

Skenario test prioritas untuk `checkRoomConflict()`:
1. Booking baru di slot kosong → harus diterima
2. Booking baru tepat menimpa booking DISETUJUI yang ada → harus ditolak
3. Booking baru bersinggungan sebagian (overlap parsial) → harus ditolak
4. Booking baru di slot yang sebelumnya DITOLAK/DIBATALKAN → harus diterima
5. Dua submit bersamaan (simulasi race condition) → hanya satu yang berhasil

---

## 6. ALASAN ARSITEKTUR (Trade-off yang Harus Bisa Dijelaskan)

### Kenapa REST API terpisah, bukan Next.js full-stack (server actions)?
Dipilih pemisahan jelas frontend/backend supaya lebih mudah dijelaskan secara arsitektural
saat presentasi — "ini lapisan presentasi, ini lapisan API/business logic". Trade-off: sedikit
lebih banyak setup (CORS, dua deployment terpisah), tapi lebih mudah di-maintain kalau nanti
ada kebutuhan klien lain (misal mobile app) yang konsumsi API yang sama.

### Kenapa tidak pakai microservices?
Skala project ini (prototipe akademik, single institution) tidak butuh microservices.
Monolith terstruktur dengan pemisahan layer yang jelas (controller-service-repository via
Prisma) sudah cukup dan jauh lebih mudah di-maintain oleh tim kecil tanpa overhead deployment
yang kompleks.

### Kenapa PostgreSQL, bukan MongoDB?
Data reservasi pada dasarnya sangat relasional — User-Organization-Booking-Room-Approval saling
terhubung dengan integritas referensial yang penting (tidak boleh ada booking tanpa room/user
valid). PostgreSQL juga menyediakan exclusion constraint yang krusial untuk mencegah bentrok di
level database, sesuatu yang jauh lebih rumit diimplementasikan secara setara di MongoDB.

---

## 7. KETERBATASAN YANG DISADARI (Honesty Section)

Bagian ini penting untuk ditunjukkan ke penguji — menunjukkan kesadaran akan batasan sistem
biasanya dinilai lebih baik daripada berpura-pura sistem sempurna.

- Sistem belum menangani pembayaran/biaya sewa (memang di luar scope — UKM tidak bayar)
- Belum ada fitur booking berulang (recurring booking) untuk kegiatan rutin mingguan — saat ini
  tiap sesi harus dibooking manual satu per satu
- Notifikasi email bergantung pada SMTP eksternal — kalau SMTP down, notifikasi in-app tetap
  jalan tapi email tertunda (tidak ada queue/retry mechanism di versi prototipe)
- Tidak ada audit log granular untuk setiap perubahan data (hanya approval action yang dicatat)

---

## 8. SIMULASI PERTANYAAN PENGUJI + JAWABAN SIAP

**Q: "Apa yang terjadi kalau dua UKM submit booking untuk slot yang sama persis, bersamaan?"**
A: Jelaskan defense in depth — frontend cek dulu (UX), backend service re-check sebelum insert
(transaction), dan database punya exclusion constraint sebagai garis pertahanan terakhir yang
tidak bisa di-bypass meski ada bug di level aplikasi.

**Q: "Kenapa pakai JWT, bukan session di server?"**
A: Karena arsitektur API dan frontend terpisah (stateless), JWT lebih natural — server tidak
perlu simpan session state, cocok juga kalau nanti perlu scale horizontal (banyak instance
server) tanpa shared session store.

**Q: "Bagaimana kalau admin menolak booking karena salah klik?"**
A: Status DITOLAK adalah final state — tidak ada undo. User harus mengajukan booking baru.
Ini sengaja supaya histori approval (siapa, kapan, kenapa) tetap akurat untuk audit, bukan
ditimpa.

**Q: "Kalau saya hapus ruang yang masih ada booking aktifnya, apa yang terjadi?"**
A: Sistem tidak benar-benar hapus row ruang (soft delete via `is_active = false`). Ruang hilang
dari katalog untuk booking baru, tapi histori booking yang merujuk ke ruang itu tetap utuh.

**Q: "Apa bedanya validasi di frontend dan backend di sini? Bukannya redundant?"**
A: Tidak redundant — frontend untuk UX cepat (kasih tahu user secepatnya tanpa round-trip
server), backend untuk keamanan yang sesungguhnya (karena frontend bisa di-bypass lewat
DevTools/Postman). Backend adalah source of truth, frontend cuma optimisasi pengalaman.

**Q: "Kenapa tidak pakai framework PHP seperti yang biasa diajarkan?"**
A: Bisa dijawab jujur — tim memilih Node.js/React karena ekosistem JavaScript memungkinkan
satu bahasa untuk frontend dan backend (mengurangi context-switching untuk tim kecil), dan
relevan dengan kebutuhan industri saat ini. Tapi konsep MVC/business-logic-layer yang
diterapkan sama saja prinsipnya dengan Laravel atau framework PHP modern lainnya.

**Q: "Bagaimana sistem menjamin satu UKM tidak spam booking untuk mengunci semua slot?"**
A: Requirement BOOK-07 di PRD versi 1.0 — maksimal 3 booking aktif (status MENUNGGU atau
DISETUJUI) bersamaan per UKM. Dicek di service layer sebelum insert booking baru.

**Q: "Jelaskan ERD secara singkat tanpa lihat slide."**
A: (latihan jawab lisan) "Ada 6 entitas utama. User terhubung many-to-one ke Organization
(satu UKM punya banyak pengurus). Booking adalah entitas pusat — terhubung ke User (siapa
yang booking), Room (ruang mana), dan Organization (atas nama UKM mana). Approval adalah
entitas terpisah yang mencatat histori keputusan admin terhadap satu booking — one-to-one
tapi dipisah dari tabel booking supaya histori siapa-approve-kapan tidak campur dengan data
booking itu sendiri. Notification terhubung ke User dan opsional ke Booking, untuk pesan yang
dikirim ke siapa terkait booking mana."

---

## 9. METODOLOGI JAD → IMPLEMENTASI (Bukti Penerapan Nyata)

Tabel ini menunjukkan requirement yang lahir LANGSUNG dari sesi JAD, bukan asumsi sepihak —
penting untuk membuktikan ke penguji bahwa metodologi yang dipelajari benar-benar diterapkan:

| Requirement | Asal dari Sesi JAD | Pihak yang Mengusulkan |
|-------------|---------------------|--------------------------|
| Fitur Approval Admin | Muncul saat staf Kemahasiswaan menyatakan kebutuhan kontrol terpusat | Staf Kemahasiswaan |
| Batas pembatalan H-1 | Kebutuhan waktu realokasi ruang | Staf Kemahasiswaan |
| Maks 3 booking aktif per UKM | Cegah monopoli slot oleh UKM besar | Perwakilan UKM kecil |
| Notifikasi otomatis | Gantikan kebiasaan cek manual di grup WhatsApp | Perwakilan UKM |
| Riwayat pemakaian per UKM | Kebutuhan laporan internal UKM ke pembina | Perwakilan UKM |

---

## 10. REFERENSI SILANG

- PRD detail (versi 1.0): `PRD_KampusConnect.md`
- UML interaktif: `UML_KampusConnect.html`
- UI/UX Framework: `UIUX_Framework_KampusConnect.html`
- Diagram UML khusus sidang (Activity bentrok + State Machine): `uml.md` di folder ini
