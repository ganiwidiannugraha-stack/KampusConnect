'use client';

import { useState, useEffect } from 'react';
import { getReportBookings } from './actions';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

type Booking = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string;
  room: { id: string; name: string; capacity: number };
  user: { id: string; name: string };
};

type Room = {
  id: string;
  name: string;
  capacity: number;
};

export default function ReportsClient({ rooms }: { rooms: Room[] }) {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [roomId, setRoomId] = useState<string>('');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    getReportBookings(year, month, roomId || null).then((data) => {
      if (isMounted) {
        setBookings(data as any);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [year, month, roomId]);

  const handlePrint = () => {
    window.print();
  };

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate totals
  const totalKegiatan = bookings.length;
  // Calculate total duration in hours
  let totalDurasi = 0;
  bookings.forEach(b => {
    const [startH, startM] = b.start_time.split(':').map(Number);
    const [endH, endM] = b.end_time.split(':').map(Number);
    const diffHours = (endH + endM / 60) - (startH + startM / 60);
    if (diffHours > 0) totalDurasi += diffHours;
  });

  const selectedMonthName = months[month - 1];

  return (
    <div className="flex flex-col gap-6 bg-card sm:border sm:border-border sm:shadow-sm rounded-2xl p-0 sm:p-6 print:border-none print:shadow-none print:p-0">
      
      {/* Filter Section (Hidden in Print) */}
      <div className="print:hidden flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-sm font-bold text-foreground/80">Tahun</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-sm font-bold text-foreground/80">Bulan</label>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {months.map((m, idx) => <option key={idx+1} value={idx+1}>{m}</option>)}
          </select>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <label className="text-sm font-bold text-foreground/80">Ruangan (Opsional)</label>
          <select 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Semua Ruangan</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full md:w-auto h-[42px] px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          Cetak PDF
        </button>
      </div>

      {/* --- PRINT HEADER (Hanya muncul saat dicetak) --- */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-[3px] border-black pb-4 mb-6">
        {/* Bisa ditambahkan tag <img> logo instansi di sini */}
        <h1 className="text-2xl font-black uppercase tracking-wider text-black">KampusConnect</h1>
        <h2 className="text-xl font-bold text-black mt-1">Laporan Rekapitulasi Penggunaan Ruangan</h2>
        <p className="text-black/80 mt-1">
          Periode: {selectedMonthName} {year} {roomId ? `| Ruangan: ${rooms.find(r => r.id === roomId)?.name}` : ''}
        </p>
      </div>
      {/* ------------------------------------------------ */}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-background border border-border p-4 rounded-xl flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted-foreground">Total Kegiatan</span>
          <span className="text-3xl font-black">{totalKegiatan}</span>
        </div>
        <div className="bg-background border border-border p-4 rounded-xl flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted-foreground">Total Durasi</span>
          <span className="text-3xl font-black">{totalDurasi.toFixed(1).replace('.0', '')} <span className="text-base font-semibold text-muted-foreground">Jam</span></span>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left print:text-black">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border print:bg-gray-100 print:text-black print:border-black">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold print:border-b print:border-black">Tanggal</th>
                <th scope="col" className="px-6 py-4 font-bold print:border-b print:border-black">Waktu</th>
                <th scope="col" className="px-6 py-4 font-bold print:border-b print:border-black">Ruangan</th>
                <th scope="col" className="px-6 py-4 font-bold print:border-b print:border-black">Peminjam</th>
                <th scope="col" className="px-6 py-4 font-bold print:border-b print:border-black">Kegiatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-black/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Tidak ada penggunaan ruangan pada periode ini.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors print:hover:bg-transparent">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground print:text-black">
                      {format(parseISO(b.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs print:text-black">
                      {b.start_time.substring(0,5)} - {b.end_time.substring(0,5)}
                    </td>
                    <td className="px-6 py-4 font-medium print:text-black">
                      {b.room?.name || '-'}
                    </td>
                    <td className="px-6 py-4 print:text-black">
                      {b.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate print:whitespace-normal print:text-black" title={b.reason}>
                      {b.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PRINT FOOTER (Tanda Tangan) --- */}
      <div className="hidden print:flex justify-end mt-16 pt-8">
        <div className="flex flex-col items-center">
          <p className="text-black mb-16">Jakarta, {format(new Date(), 'dd MMMM yyyy', { locale: id })}</p>
          <p className="text-black font-bold uppercase underline">Administrator</p>
          <p className="text-black text-sm mt-1">NIP. 19850212 201012 1 003</p>
        </div>
      </div>
      {/* ----------------------------------- */}
      
    </div>
  );
}
