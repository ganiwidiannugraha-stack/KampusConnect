/**
 * @file page.tsx
 * @description Komponen Server (Server Component) utama untuk halaman Dashboard Administrator.
 * Halaman ini merender metrik analitik dan panel manajemen pemesanan.
 * Menggunakan arsitektur pemuatan asinkron (Promise.all) untuk mengambil data secara paralel,
 * mengurangi waktu Time To First Byte (TTFB).
 */
import { getBookings, getDashboardStats } from './actions';
import UsageStats from './UsageStats';
import Link from 'next/link';
import { BookingActions } from './BookingActions';
import { StatusBadge } from './BookingList';

/**
 * Merender layout dan agregasi data untuk Dashboard Admin.
 * 
 * @component
 * @returns {Promise<JSX.Element>} Halaman Dashboard Server Component.
 */
export default async function AdminDashboardPage() {
  // Eksekusi pemanggilan database secara paralel untuk optimasi performa rendering
  const [bookings, { totalRooms, activeRooms, inactiveRooms, totalUsers }] = await Promise.all([
    getBookings(),
    getDashboardStats()
  ]);
  
  // 1. Agregasi Metrik Status Reservasi
  const total = bookings.length;
  const countDisetujui = bookings.filter((b: any) => b.status === 'DISETUJUI').length;
  const countMenunggu = bookings.filter((b: any) => b.status === 'MENUNGGU').length;
  const countDitolak = bookings.filter((b: any) => b.status === 'DITOLAK' || b.status === 'DIBATALKAN').length;

  // 2. Pemotongan Data (Data Slicing) untuk Riwayat Terbaru
  const recentBookings = [...bookings].slice(0, 5);

  // 3. Filter Memori Cepat untuk Antrean Persetujuan (Approval Queue)
  const pendingBookings = bookings.filter((b: any) => b.status === 'MENUNGGU');

  return (
    <main className="p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background min-h-full">
      
      {/* TOP SECTION: 4 PREMIUM STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Total Reservasi */}
        <div className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Reservasi</div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-foreground tracking-tight">{total}</div>
              <div className="text-xs font-semibold text-muted-foreground">pengajuan</div>
            </div>
            
            {/* Progress Bar of Approval */}
            {total > 0 && (
              <div className="mt-4 space-y-1.5">
                <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${(countDisetujui / total) * 100}%` }}></div>
                  <div className="bg-red-500 h-full" style={{ width: `${(countDitolak / total) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-green-600">{countDisetujui} Disetujui</span>
                  <span className="text-red-600">{countDitolak} Ditolak/Batal</span>
                </div>
              </div>
            )}
            {total === 0 && (
              <div className="mt-3 text-[11px] font-bold text-muted-foreground">Belum ada pengajuan.</div>
            )}
          </div>
        </div>

        {/* Card 2: Menunggu Persetujuan */}
        <div className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aksi Tertunda</div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-inner relative">
              {countMenunggu > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
              {countMenunggu > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-foreground tracking-tight">{countMenunggu}</div>
              <div className="text-xs font-semibold text-muted-foreground">menunggu</div>
            </div>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${countMenunggu > 0 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-muted text-muted-foreground'}`}>
              {countMenunggu > 0 ? 'Butuh Verifikasi Segera' : 'Semua telah diverifikasi'}
            </div>
          </div>
        </div>

        {/* Card 3: Total Ruangan */}
        <div className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kapasitas Fasilitas</div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-foreground tracking-tight">{totalRooms}</div>
              <div className="text-xs font-semibold text-muted-foreground">ruangan total</div>
            </div>
            
            {/* Progress Bar of Room Status */}
            {totalRooms > 0 && (
              <div className="mt-4 space-y-1.5">
                <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${(activeRooms / totalRooms) * 100}%` }}></div>
                  <div className="bg-gray-400 h-full" style={{ width: `${(inactiveRooms / totalRooms) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-blue-600">{activeRooms} Aktif</span>
                  <span className="text-gray-500">{inactiveRooms} Nonaktif</span>
                </div>
              </div>
            )}
            {totalRooms === 0 && (
              <div className="mt-3 text-[11px] font-bold text-muted-foreground">Belum ada ruangan.</div>
            )}
          </div>
        </div>

        {/* Card 4: Total Pengguna */}
        <div className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Jaringan Pengguna</div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-foreground tracking-tight">{totalUsers}</div>
              <div className="text-xs font-semibold text-muted-foreground">akun terdaftar</div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Akses Sistem & Dosen/Staf
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: ANALYTICS & RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Stats - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UsageStats bookings={bookings} />
        </div>
        
        {/* 5 Pemohon Terbaru - Takes 1 column */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col lg:col-span-1 h-[350px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-bold text-sm text-foreground">5 Pemohon Terbaru</h3>
            <Link href="/admin/schedule?tab=table" className="text-xs font-bold text-foreground hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {recentBookings.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">Belum ada aktivitas.</div>
            ) : recentBookings.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  {b.user?.name ? b.user.name.substring(0,2).toUpperCase() : 'AN'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground leading-tight truncate">{b.user?.name || 'Anonim'}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {b.room?.name} &bull; {b.date}
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.status === 'DISETUJUI' ? 'bg-green-500/10 text-green-600' :
                  b.status === 'DITOLAK' ? 'bg-red-500/10 text-red-600' :
                  b.status === 'DIBATALKAN' ? 'bg-gray-500/10 text-gray-500' :
                  'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {b.status === 'DISETUJUI' ? 'Setuju' : b.status === 'DITOLAK' ? 'Tolak' : b.status === 'DIBATALKAN' ? 'Batal' : 'Tunggu'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: PENDING QUICK ACTIONS */}
      {pendingBookings.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Aksi Cepat — Menunggu Persetujuan</h3>
                <p className="text-[11px] text-muted-foreground">{pendingBookings.length} dari {countMenunggu} pemohon menunggu verifikasi</p>
              </div>
            </div>
            <Link href="/admin/schedule?tab=table" className="text-xs font-bold text-foreground hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {/* DESKTOP TABLE */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-muted/20 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2.5 font-bold">Pemohon</th>
                  <th className="px-5 py-2.5 font-bold">Ruangan</th>
                  <th className="px-5 py-2.5 font-bold">Jadwal Pakai</th>
                  <th className="px-5 py-2.5 font-bold text-center">Status</th>
                  <th className="px-5 py-2.5 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-yellow-500/20">
                          {b.user?.name ? b.user.name.substring(0,2).toUpperCase() : 'AN'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{b.user?.name || 'Anonim'}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[180px]">{b.reason}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {b.room?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {b.date} &bull; {b.startTime || b.start_time}-{b.endTime || b.end_time}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center scale-90 origin-right">
                        <BookingActions bookingId={b.id} currentStatus={b.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MOBILE CARDS */}
            <div className="md:hidden flex flex-col divide-y divide-border">
              {pendingBookings.map((b: any) => (
                <div key={b.id} className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-yellow-500/20">
                        {b.user?.name ? b.user.name.substring(0,2).toUpperCase() : 'AN'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{b.user?.name || 'Anonim'}</div>
                        <div className="text-[11px] text-muted-foreground">#{String(b.id).toUpperCase().substring(0, 8)}</div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-xs mt-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {b.room?.name || 'Unknown'}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {b.date} &bull; {b.startTime || b.start_time}-{b.endTime || b.end_time}
                    </div>
                    <div className="text-muted-foreground mt-0.5 border-l-2 border-primary/20 pl-2 line-clamp-2">"{b.reason}"</div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-border border-dashed flex justify-end">
                    <div className="scale-95 origin-right">
                      <BookingActions bookingId={b.id} currentStatus={b.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
