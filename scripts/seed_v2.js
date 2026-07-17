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

const ARTIST_NAMES = [
  "Reza Rahadian", "Dian Sastrowardoyo", "Nicholas Saputra", "Chelsea Islan", 
  "Iqbaal Ramadhan", "Tara Basro", "Vino G. Bastian", "Adinia Wirasti", 
  "Lukman Sardi", "Putri Marino", "Jefri Nichol", "Maudy Ayunda", 
  "Angga Yunanda", "Prilly Latuconsina", "Chicco Jerikho"
];

const BUILDINGS = [
  { nama_gedung: "Gedung Rektorat", lokasi: "Kampus Pusat" },
  { nama_gedung: "Gedung Fakultas Teknik", lokasi: "Sayap Timur Kampus" },
  { nama_gedung: "Gedung Fakultas Ekonomi", lokasi: "Sayap Barat Kampus" },
  { nama_gedung: "Gedung Pusat Kegiatan Mahasiswa (PKM)", lokasi: "Area Belakang Kampus" }
];

const FACILITIES = [
  { nama_fasilitas: "Proyektor LCD", icon: "Projector" },
  { nama_fasilitas: "AC Central", icon: "Wind" },
  { nama_fasilitas: "Sound System", icon: "Speaker" },
  { nama_fasilitas: "Papan Tulis (Whiteboard)", icon: "Presentation" },
  { nama_fasilitas: "Kursi Kuliah", icon: "Armchair" },
  { nama_fasilitas: "Smart TV", icon: "Tv" },
  { nama_fasilitas: "Podium", icon: "Mic" },
  { nama_fasilitas: "Akses Kursi Roda", icon: "Accessibility" }
];

async function runSeed() {
  console.log("=== STARTING KAMPUSCONNECT V2 SEEDING ===");
  
  // 1. Create Organization (if not exists)
  console.log("-> Menyiapkan Organisasi...");
  const { data: orgData, error: orgError } = await supabase.from('organisasi').insert({
    nama: "BEM Universitas",
    tipe: "BEM",
    pembina: "Dr. Budi Darmawan"
  }).select('id_organisasi').single();
  
  const id_org = orgData?.id_organisasi || 1;
  
  // 2. Create Roles (if not exists)
  console.log("-> Menyiapkan Roles...");
  await supabase.from('roles').upsert([{ id: 1, name: 'Administrator' }, { id: 2, name: 'Mahasiswa' }]);

  // 3. Create Users
  console.log("-> Membuat 15 User (Artis)...");
  for (let i = 0; i < ARTIST_NAMES.length; i++) {
    const name = ARTIST_NAMES[i];
    const email = name.toLowerCase().replace(/\s+/g, '.') + "@kampusconnect.com";
    const password = "password123";
    const nim = "102030" + (100 + i);
    
    // Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    let userId = null;
    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already been registered')) {
        console.log(`User ${email} sudah ada, mencoba mengambil data user...`);
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        }
      } else {
        console.error(`Gagal membuat user ${name}:`, authError.message);
      }
    } else if (authData.user) {
      userId = authData.user.id;
    }

    if (userId) {
      const role_id = i === 0 ? 1 : 2; 
      
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        role_id: role_id,
        id_organisasi: id_org,
        nama: name,
        nim: nim,
        no_hp: "0812" + Math.floor(10000000 + Math.random() * 90000000),
        status: 'Aktif'
      });
      if (profileError) console.error(`Gagal membuat profil ${name}:`, profileError.message);
      else console.log(`   - Berhasil memproses user: ${name} (${role_id === 1 ? 'Admin' : 'Mahasiswa'})`);
    }
  }

  // 4. Create Buildings
  console.log("-> Menyiapkan Gedung...");
  const { data: buildingsData, error: bError } = await supabase.from('gedung').insert(BUILDINGS).select();
  if (bError) console.error("Gagal insert gedung:", bError.message);

  // 5. Create Facilities
  console.log("-> Menyiapkan Fasilitas...");
  const { data: facData, error: fError } = await supabase.from('fasilitas').insert(FACILITIES).select();
  if (fError) console.error("Gagal insert fasilitas:", fError.message);

  // 6. Create 20 Rooms
  console.log("-> Membuat 20 Ruangan...");
  if (buildingsData && buildingsData.length === 4 && facData) {
    const roomsToInsert = [];
    
    // Gedung 1: Rektorat (Auditorium & VIP Meeting)
    roomsToInsert.push({ id_gedung: buildingsData[0].id_gedung, nama_ruangan: "Auditorium Utama Rektorat", kapasitas: 1000, lantai: 1, deskripsi: "Aula prestisius untuk wisuda dan seminar nasional", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[0].id_gedung, nama_ruangan: "Ruang Sidang Senat", kapasitas: 100, lantai: 2, deskripsi: "Ruangan meeting VIP full AC dan karpet", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[0].id_gedung, nama_ruangan: "Ruang Rapat VIP A", kapasitas: 20, lantai: 3, deskripsi: "Ruangan rapat eksekutif", status: "Tersedia" });
    
    // Gedung 2: Fakultas Teknik (Laboratorium & Kelas Besar)
    for (let i = 1; i <= 6; i++) {
      roomsToInsert.push({ id_gedung: buildingsData[1].id_gedung, nama_ruangan: `Ruang Kelas T.0${i}`, kapasitas: 60, lantai: i <= 3 ? 1 : 2, deskripsi: `Ruang kuliah reguler fakultas teknik lantai ${i <= 3 ? 1 : 2}`, status: "Tersedia" });
    }
    
    // Gedung 3: Fakultas Ekonomi (Kelas Reguler & Seminar)
    for (let i = 1; i <= 6; i++) {
      roomsToInsert.push({ id_gedung: buildingsData[2].id_gedung, nama_ruangan: `Ruang Kelas E.0${i}`, kapasitas: 50, lantai: Math.ceil(i/2), deskripsi: `Ruang kuliah ekonomi lantai ${Math.ceil(i/2)}`, status: i === 6 ? "Maintenance" : "Tersedia" });
    }
    
    // Gedung 4: PKM (Sekretariat & Ruang Latihan)
    roomsToInsert.push({ id_gedung: buildingsData[3].id_gedung, nama_ruangan: "Aula PKM", kapasitas: 200, lantai: 1, deskripsi: "Aula kegiatan dan latihan UKM", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[3].id_gedung, nama_ruangan: "Sekretariat Bersama A", kapasitas: 15, lantai: 2, deskripsi: "Sekre Himpunan", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[3].id_gedung, nama_ruangan: "Sekretariat Bersama B", kapasitas: 15, lantai: 2, deskripsi: "Sekre UKM Olahraga", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[3].id_gedung, nama_ruangan: "Studio Musik", kapasitas: 10, lantai: 3, deskripsi: "Studio kedap suara", status: "Tersedia" });
    roomsToInsert.push({ id_gedung: buildingsData[3].id_gedung, nama_ruangan: "Ruang Rapat PKM", kapasitas: 30, lantai: 3, deskripsi: "Ruang koordinasi BEM", status: "Tersedia" });

    const { data: insertedRooms, error: rError } = await supabase.from('ruangan').insert(roomsToInsert).select();
    if (rError) console.error("Gagal insert ruangan:", rError.message);
    else if (insertedRooms) {
      console.log("-> Mengaitkan Fasilitas ke Ruangan...");
      const rfData = [];
      insertedRooms.forEach(room => {
        // Randomize 3-5 fasilitas per room
        const shuffled = facData.sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const selected = shuffled.slice(0, count);
        
        selected.forEach(fac => {
          rfData.push({
            id_ruangan: room.id_ruangan,
            id_fasilitas: fac.id_fasilitas
          });
        });
      });
      
      const { error: rfError } = await supabase.from('ruangan_fasilitas').insert(rfData);
      if (rfError) console.error("Gagal insert ruangan_fasilitas:", rfError.message);
    }
  }

  console.log("=== SEEDING SELESAI ===");
  console.log("Anda bisa login dengan salah satu akun artis, misal: reza.rahadian@kampusconnect.com (Admin) / password123");
}

runSeed();
