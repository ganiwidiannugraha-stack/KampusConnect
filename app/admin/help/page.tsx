import React from 'react';

export const metadata = {
  title: 'Bantuan & Petunjuk - Admin KampusConnect',
};

export default function AdminHelpPage() {
  return (
    <div className="p-6 lg:p-8 bg-background min-h-full animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Bantuan & Petunjuk</h1>
          <p className="text-muted-foreground">Panduan penggunaan dashboard administrator KampusConnect.</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Cara Memverifikasi Reservasi</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Buka menu <strong className="text-foreground">Jadwal & Reservasi</strong>.</li>
              <li>Cari daftar reservasi yang berstatus <span className="text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold">MENUNGGU</span>.</li>
              <li>Klik pada baris reservasi atau tombol aksi untuk melihat detailnya.</li>
              <li>Anda dapat menyetujui atau menolak reservasi tersebut. Jika menolak, disarankan untuk memberikan alasan.</li>
            </ol>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Mengelola Ruangan</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Buka menu <strong className="text-foreground">Kelola Ruang</strong>.</li>
              <li>Untuk menambah ruang baru, klik tombol <strong className="text-foreground">+ Tambah Ruang</strong> di pojok kanan atas.</li>
              <li>Isi formulir dengan nama ruang, kapasitas, fasilitas (gunakan koma), dan upload foto ruangan.</li>
              <li>Ruangan yang tidak digunakan lagi dapat dihapus melalui ikon tong sampah pada tabel daftar ruang.</li>
            </ol>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Manajemen Pengguna</h2>
            <p className="text-muted-foreground mb-3">
              Anda dapat melihat daftar seluruh pengguna yang terdaftar di sistem.
              Pastikan setiap pengguna memiliki role yang sesuai (Mahasiswa, Dosen, atau Staf).
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Klik <strong className="text-foreground">Kelola Pengguna</strong> pada sidebar.</li>
              <li>Gunakan kolom pencarian untuk menemukan pengguna spesifik.</li>
              <li>Ubah role atau hapus akses pengguna jika diperlukan.</li>
            </ul>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-2">Butuh Bantuan Lebih Lanjut?</h2>
            <p className="text-muted-foreground">
              Jika Anda mengalami masalah teknis atau menemukan *bug* pada sistem, silakan hubungi tim IT/Developer di: <strong className="text-foreground">support@kampus.ac.id</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
