const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Memulai proses seeding database bersih...');

  // 1. Bersihkan Data Lama
  console.log('Menghapus data lama...');
  await supabase.from('approvals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('roles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Hapus semua user di auth.users (akan gagal jika tidak ada izin, tapi karena pakai service_role harusnya bisa lewat auth.admin)
  const { data: usersData, error: listUsersError } = await supabase.auth.admin.listUsers();
  if (!listUsersError && usersData?.users) {
    for (const u of usersData.users) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }

  // 2. Buat Roles
  console.log('Membuat role...');
  const { data: adminRole } = await supabase.from('roles').insert({
    name: 'Administrator', can_manage_users: true, can_manage_rooms: true, can_approve_bookings: true, can_book_rooms: false, can_manage_roles: true, can_access_dashboard: true
  }).select().single();

  const { data: mahasiswaRole } = await supabase.from('roles').insert({
    name: 'Mahasiswa', can_manage_users: false, can_manage_rooms: false, can_approve_bookings: false, can_book_rooms: true, can_manage_roles: false, can_access_dashboard: false
  }).select().single();

  // 3. Buat Organisasi
  console.log('Membuat 7 organisasi...');
  const orgNames = ['BEM Universitas', 'HIMA Informatika', 'HIMA Manajemen', 'UKM Olahraga', 'UKM Seni & Budaya', 'UKM Robotika', 'UKM Jurnalistik'];
  const orgs = [];
  for (const name of orgNames) {
    const { data: org } = await supabase.from('organizations').insert({ name }).select().single();
    orgs.push(org);
  }

  // 4. Buat 20 Ruangan
  console.log('Membuat 20 ruangan...');
  const roomsData = [
    { name: 'Aula Utama', capacity: 500, facilities: 'AC, Proyektor, Sound System, Panggung' },
    { name: 'Auditorium Gd. A', capacity: 300, facilities: 'AC, Proyektor 4K, Kursi Teater' },
    { name: 'Ruang Seminar 1', capacity: 100, facilities: 'AC, Proyektor, Kursi Lipat' },
    { name: 'Ruang Seminar 2', capacity: 100, facilities: 'AC, Proyektor, Kursi Lipat' },
    { name: 'Ruang Rapat 1', capacity: 20, facilities: 'AC, Papan Tulis, Smart TV, Meja Oval' },
    { name: 'Ruang Rapat 2', capacity: 20, facilities: 'AC, Papan Tulis, Smart TV, Meja Bundar' },
    { name: 'Studio Musik', capacity: 15, facilities: 'AC, Alat Musik Lengkap, Peredam Suara' },
    { name: 'Studio Tari', capacity: 30, facilities: 'AC, Kaca Dinding Penuh, Sound System' },
    { name: 'Lab Komputer A', capacity: 40, facilities: 'AC, 40 PC, Proyektor' },
    { name: 'Lab Komputer B', capacity: 40, facilities: 'AC, 40 iMac, Proyektor' },
    { name: 'Ruang Kelas 101', capacity: 50, facilities: 'AC, Proyektor, Papan Tulis' },
    { name: 'Ruang Kelas 102', capacity: 50, facilities: 'AC, Proyektor, Papan Tulis' },
    { name: 'Ruang Kelas 201', capacity: 50, facilities: 'AC, Proyektor, Papan Tulis' },
    { name: 'Ruang BEM', capacity: 25, facilities: 'AC, Meja Rapat, Loker' },
    { name: 'Ruang UKM Olahraga', capacity: 20, facilities: 'AC, Lemari Trofi, Meja Pingpong' },
    { name: 'Ruang Jurnalistik', capacity: 15, facilities: 'AC, 3 PC Editing, Papan Tulis' },
    { name: 'Lapangan Basket (Indoor)', capacity: 200, facilities: 'Tribun, Papan Skor Digital' },
    { name: 'Lapangan Futsal', capacity: 150, facilities: 'Tribun, Jaring, Lampu Sorot' },
    { name: 'Lapangan Tenis', capacity: 50, facilities: 'Jaring, Lampu Penerangan' },
    { name: 'Amphitheater Terbuka', capacity: 300, facilities: 'Panggung Batu, Listrik Outdoor' }
  ];
  
  const insertedRooms = [];
  for (const r of roomsData) {
    const { data: rm } = await supabase.from('rooms').insert(r).select().single();
    insertedRooms.push(rm);
  }

  // 5. Buat 7 Users
  console.log('Membuat 7 users (2 admin, 5 mahasiswa)...');
  const password = 'KampusConnect2026!';
  const usersToCreate = [
    { email: 'admin.utama@kampus.ac.id', name: 'Admin Utama', role_id: adminRole.id, org_id: null },
    { email: 'admin.fasilitas@kampus.ac.id', name: 'Admin Fasilitas', role_id: adminRole.id, org_id: null },
    { email: 'rina.permata@kampus.ac.id', name: 'Rina Permata', role_id: mahasiswaRole.id, org_id: orgs[0].id },
    { email: 'budi.santoso@kampus.ac.id', name: 'Budi Santoso', role_id: mahasiswaRole.id, org_id: orgs[1].id },
    { email: 'dewi.lestari@kampus.ac.id', name: 'Dewi Lestari', role_id: mahasiswaRole.id, org_id: orgs[4].id },
    { email: 'arif.rahman@kampus.ac.id', name: 'Arif Rahman', role_id: mahasiswaRole.id, org_id: orgs[5].id },
    { email: 'siti.nurhaliza@kampus.ac.id', name: 'Siti Nurhaliza', role_id: mahasiswaRole.id, org_id: orgs[2].id }
  ];

  const dbUsers = [];
  for (const u of usersToCreate) {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: password,
      email_confirm: true,
      user_metadata: { name: u.name }
    });

    if (authData?.user) {
      const { data: profile } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: u.name,
        email: u.email,
        role_id: u.role_id,
        organization_id: u.org_id
      }).select().single();
      dbUsers.push(profile);
    } else {
      console.error(`Gagal membuat user ${u.email}:`, authErr);
    }
  }

  // 6. Buat 20 Reservasi
  console.log('Membuat 20 reservasi...');
  const mahasiswaUsers = dbUsers.filter(u => u.role_id === mahasiswaRole.id);
  const adminUsers = dbUsers.filter(u => u.role_id === adminRole.id);
  const statuses = ['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'DIBATALKAN'];
  
  // Buat tanggal dari besok hingga 14 hari ke depan
  for (let i = 0; i < 20; i++) {
    const user = mahasiswaUsers[i % mahasiswaUsers.length];
    const room = insertedRooms[i % insertedRooms.length];
    const status = statuses[i % statuses.length];
    
    const d = new Date();
    d.setDate(d.getDate() + (i % 14) + 1); // 1-14 hari dari sekarang
    const dateStr = d.toISOString().split('T')[0];
    
    // Jam mulai bervariasi: 08:00 sampai 15:00
    const startHour = 8 + (i % 8);
    const startStr = `${startHour.toString().padStart(2, '0')}:00`;
    const endStr = `${(startHour + 2).toString().padStart(2, '0')}:00`;
    
    const { data: booking, error: bkErr } = await supabase.from('bookings').insert({
      user_id: user.id,
      organization_id: user.organization_id,
      room_id: room.id,
      date: dateStr,
      start_time: startStr,
      end_time: endStr,
      reason: `Kegiatan Organisasi Rutin Batch ${i+1}`,
      status: status
    }).select().single();

    if (status === 'DISETUJUI' || status === 'DITOLAK') {
      if (booking) {
        await supabase.from('approvals').insert({
          booking_id: booking.id,
          admin_id: adminUsers[i % adminUsers.length].id,
          status: status,
          notes: status === 'DISETUJUI' ? 'Ruangan tersedia, silakan digunakan sesuai SOP.' : 'Jadwal bentrok dengan kegiatan universitas.'
        });
      }
    }
  }

  console.log('Seeding selesai! Anda bisa login menggunakan akun mahasiswa/admin dengan password: ' + password);
}

main().catch(console.error);
