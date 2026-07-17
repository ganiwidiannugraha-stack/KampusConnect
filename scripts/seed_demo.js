const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_ACCOUNTS = [
  { email: 'admin.utama@kampus.ac.id', nama: 'Admin Utama', org: null, role: 1 },
  { email: 'admin.fasilitas@kampus.ac.id', nama: 'Admin Fasilitas', org: null, role: 1 },
  { email: 'rina.permata@kampus.ac.id', nama: 'Rina Permata', org: 'BEM Universitas', role: 2 },
  { email: 'fajar.nugraha@kampus.ac.id', nama: 'Fajar Nugraha', org: 'HIMA Informatika', role: 2 },
  { email: 'siti.nurhaliza@kampus.ac.id', nama: 'Siti Nurhaliza', org: 'HIMA Manajemen', role: 2 },
  { email: 'dewi.lestari@kampus.ac.id', nama: 'Dewi Lestari', org: 'UKM Seni & Budaya', role: 2 },
  { email: 'arif.rahman@kampus.ac.id', nama: 'Arif Rahman', org: 'UKM Robotika', role: 2 }
];

const PASS = 'KampusConnect2026!';

async function runDemoSeed() {
  console.log("=== STARTING DEMO ACCOUNTS & RESERVATIONS SEEDING ===");
  
  // 0. Bersihkan semua user lama (termasuk 15 artis)
  console.log("-> Menghapus semua user lama agar bersih...");
  const { data: usersData } = await supabase.auth.admin.listUsers();
  if (usersData?.users) {
      for (const u of usersData.users) {
          await supabase.auth.admin.deleteUser(u.id);
      }
      console.log(`   Berhasil menghapus ${usersData.users.length} user lama.`);
  }

  // 1. Organisasi
  console.log("-> Menyiapkan Organisasi...");
  const orgMap = {};
  for (const acc of DEMO_ACCOUNTS) {
    if (acc.org && !orgMap[acc.org]) {
      const { data } = await supabase.from('organisasi').upsert({
        nama: acc.org,
        tipe: acc.org.startsWith('HIMA') ? 'HIMA' : acc.org.startsWith('BEM') ? 'BEM' : 'UKM',
      }, { onConflict: 'nama' }).select('id_organisasi').single();
      
      if (!data) {
        // If upsert doesn't return, it means we need to fetch
        const { data: d2 } = await supabase.from('organisasi').select('id_organisasi').eq('nama', acc.org).single();
        if (d2) orgMap[acc.org] = d2.id_organisasi;
      } else {
        orgMap[acc.org] = data.id_organisasi;
      }
    }
  }

  // 2. Users & Profiles
  console.log("-> Membuat Akun Demo...");
  let userProfiles = []; // store { email, id }
  let nimCounter = 200000;
  for (const acc of DEMO_ACCOUNTS) {
    let userId = null;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: PASS,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already been registered')) {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(u => u.email === acc.email);
        if (existingUser) userId = existingUser.id;
      } else {
        console.error(`Gagal membuat user ${acc.nama}:`, authError.message);
      }
    } else if (authData.user) {
      userId = authData.user.id;
    }

    if (userId) {
      userProfiles.push({ email: acc.email, id: userId, role: acc.role });
      nimCounter++;
      await supabase.from('profiles').upsert({
        id: userId,
        role_id: acc.role,
        id_organisasi: acc.org ? orgMap[acc.org] : null,
        nama: acc.nama,
        nim: acc.role === 2 ? `NIM${nimCounter}` : null,
        no_hp: "0812" + Math.floor(10000000 + Math.random() * 90000000),
        status: 'Aktif'
      });
      console.log(`   - Berhasil memproses: ${acc.nama} (${acc.email})`);
    }
  }

  // 3. Ambil data Ruangan untuk dipakai Reservasi
  console.log("-> Menyiapkan data Ruangan...");
  const { data: rooms } = await supabase.from('ruangan').select('id_ruangan, nama_ruangan');
  if (!rooms || rooms.length === 0) {
    console.error("BELUM ADA RUANGAN! Jalankan seed_v2.js dulu.");
    return;
  }

  // 4. Bikin Reservasi Dummy
  console.log("-> Membuat 10+ Reservasi Dummy...");
  
  const mhsUsers = userProfiles.filter(u => u.role === 2);
  const adminUsers = userProfiles.filter(u => u.role === 1);
  
  if (mhsUsers.length === 0) {
      console.error("TIDAK ADA USER MAHASISWA UNTUK BIKIN RESERVASI");
      return;
  }

  // Generator Reservasi
  const reservationsToCreate = [
    { st: 'Menunggu', j: 'Seminar Teknologi Masa Depan', p: 150 },
    { st: 'Disetujui', j: 'Rapat Koordinasi BEM', p: 30 },
    { st: 'Disetujui', j: 'Latihan Teater UKM Seni', p: 20 },
    { st: 'Ditolak', j: 'Acara Konser (Ditolak karena tidak sesuai aturan)', p: 500 },
    { st: 'Dibatalkan', j: 'Workshop Pemrograman (Dibatalkan panitia)', p: 50 },
    { st: 'Selesai', j: 'Ujian Sertifikasi IT', p: 40 },
    { st: 'Selesai', j: 'Rapat HIMA', p: 15 },
    { st: 'Menunggu', j: 'Lomba Robotika Nasional', p: 200 },
    { st: 'Disetujui', j: 'Pelatihan Jurnalistik', p: 60 },
    { st: 'Ditolak', j: 'Pesta Ulang Tahun (Bukan acara kampus)', p: 30 },
    { st: 'Disetujui', j: 'Kuliah Umum Ekonomi Makro', p: 100 },
    { st: 'Menunggu', j: 'Pameran Fotografi', p: 80 }
  ];

  let idCounter = Math.floor(Math.random() * 1000);
  
  for (let i = 0; i < reservationsToCreate.length; i++) {
    const r = reservationsToCreate[i];
    const mhs = mhsUsers[i % mhsUsers.length];
    const room = rooms[i % rooms.length];
    
    // Tentukan tanggal pakai (antara -7 hari sampai +14 hari)
    const offset = Math.floor(Math.random() * 21) - 7; 
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + offset);
    const dateStr = tgl.toISOString().split('T')[0];
    
    // Waktu mulai antara jam 08 sampai 15
    const hourStr = (Math.floor(Math.random() * 7) + 8).toString().padStart(2, '0');
    
    const { data: resData, error: resError } = await supabase.from('reservasi').insert({
        kode_reservasi: `RSV-${Date.now().toString().slice(-4)}-${i+1}`,
        id_user: mhs.id,
        id_ruangan: room.id_ruangan,
        tanggal_pengajuan: new Date().toISOString(),
        tanggal_pakai: dateStr,
        jam_mulai: `${hourStr}:00:00`,
        jam_selesai: `${parseInt(hourStr)+2}:00:00`,
        jumlah_peserta: r.p,
        keperluan: r.j,
        status: r.st
    }).select('id_reservasi').single();

    if (resError) {
        console.error(`Gagal membuat reservasi:`, resError.message);
    } else if (resData) {
        // Buat Lampiran Dummy
        await supabase.from('lampiran').insert([
            { id_reservasi: resData.id_reservasi, nama_file: 'proposal_kegiatan.pdf', file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            { id_reservasi: resData.id_reservasi, nama_file: 'surat_izin.pdf', file_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        ]);

        // Jika disetujui/ditolak, buat approval logs
        if (r.st === 'Disetujui' || r.st === 'Ditolak') {
            await supabase.from('approval').insert({
                id_reservasi: resData.id_reservasi,
                id_admin: adminUsers[0]?.id,
                status: r.st,
                catatan: r.st === 'Disetujui' ? 'Oke, sesuai prosedur.' : 'Maaf, tidak sesuai kebijakan penggunaan ruangan kampus.'
            });
            
            // Generate notifikasi juga
            await supabase.from('notifikasi').insert({
                id_user: mhs.id,
                judul: `Reservasi ${r.st}`,
                pesan: `Reservasi Anda untuk acara ${r.j} telah ${r.st}.`
            });
        }
    }
  }

  console.log("=== SEEDING DEMO SELESAI ===");
  console.log(`Password semua akun: ${PASS}`);
}

runDemoSeed();
