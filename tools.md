# tools.md — KampusConnect

Panduan tools dan kapan dipakai selama development project ini dengan Claude Code.

## Tools Bawaan Claude Code

| Tool | Kapan Dipakai |
|------|---------------|
| `Read` / `Edit` / `Write` | Baca dan ubah file project secara langsung |
| `Bash` | Jalankan command dari `commands.md` — migrasi, test, build |
| `Glob` / `Grep` | Cari file atau pattern kode sebelum refactor besar |
| `WebSearch` | Cek dokumentasi terbaru Prisma/React/library kalau ada error tidak familiar |

## MCP Servers yang Direkomendasikan untuk Project Ini

Belum ada yang terpasang secara default — ini saran kalau mau ditambahkan, sesuai kebutuhan
project reservasi ruang berbasis web:

| MCP | Kegunaan | Prioritas |
|-----|----------|-----------|
| **GitHub MCP** | Kelola issue/PR langsung dari Claude Code, terutama kalau kerja kelompok dan tiap fitur dipecah jadi issue | Tinggi (kerja kelompok 6 orang) |
| **PostgreSQL MCP** | Query database langsung untuk debug data booking tanpa buka Prisma Studio manual | Sedang |
| **Filesystem MCP** | Biasanya sudah built-in, dipakai untuk operasi file besar/batch | Default |
| **Figma MCP** (kalau ada desain Figma) | Sinkronisasi token desain dari Figma ke Tailwind config | Rendah, opsional |

Untuk menambahkan MCP, jalankan setup sesuai dokumentasi resmi di docs.claude.com — jangan
tambah MCP yang tidak benar-benar dipakai, supaya context window tidak penuh dengan tool yang
tidak relevan.

## Kapan TIDAK Pakai Tools Otomatis

- Saat mengerjakan logic validasi bentrok jadwal (`checkRoomConflict`), tulis manual dan
  review baris per baris — ini bagian yang paling mungkin ditanya detail saat sidang, jadi
  user harus benar-benar paham logikanya, bukan cuma "generate lalu jalan".
- Saat membuat seed data demo untuk presentasi, sesuaikan manual dengan skenario yang mau
  ditunjukkan (misal: sengaja buat 1 ruang dengan 2 booking bentrok untuk demo validasi).

## Workflow yang Disarankan per Sesi

1. Baca `memory.md` dulu untuk lihat progres terakhir
2. Cek `prd.md` untuk requirement modul yang sedang dikerjakan
3. Kerjakan dengan tools di atas
4. Jalankan test terkait (`commands.md` bagian Testing)
5. Update `memory.md` di akhir sesi: apa yang selesai, keputusan baru apa yang diambil
