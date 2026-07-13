'use client';

import { useState } from 'react';

export default function UsageStats({ bookings }: { bookings: any[] }) {
  const [filter, setFilter] = useState<'1 Hari' | '1 Minggu' | '1 Bulan' | '2 Bulan' | '1 Tahun'>('1 Minggu');
  const [isOpen, setIsOpen] = useState(false);

  // 1. Hitung total berdasarkan filter terpilih
  const now = new Date();
  let labels: string[] = [];
  let rawData: { label: string; disetujui: number; lainnya: number }[] = [];
  let filteredBookings = bookings;

  if (filter === '1 Hari') {
    labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    filteredBookings = bookings.filter(b => new Date(b.created_at || b.date).toDateString() === now.toDateString());
    rawData = labels.map((label, idx) => {
      const startHr = idx * 4;
      const matched = filteredBookings.filter((b) => {
        const hr = new Date(b.created_at || b.date).getHours();
        return hr >= startHr && hr < startHr + 4;
      });
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  } else if (filter === '1 Minggu') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0,0,0,0);
    filteredBookings = bookings.filter(b => new Date(b.created_at || b.date) >= start);
    
    labels = Array.from({length: 7}).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString('id-ID', { weekday: 'short' });
    });
    rawData = labels.map((label, idx) => {
      const targetDate = new Date(start);
      targetDate.setDate(targetDate.getDate() + idx);
      const targetStr = targetDate.toDateString();
      const matched = filteredBookings.filter((b) => new Date(b.created_at || b.date).toDateString() === targetStr);
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  } else if (filter === '1 Bulan' || filter === '2 Bulan') {
    const numWeeks = filter === '1 Bulan' ? 4 : 8;
    const start = new Date(now);
    start.setDate(start.getDate() - (numWeeks * 7));
    start.setHours(0,0,0,0);
    filteredBookings = bookings.filter(b => new Date(b.created_at || b.date) >= start);

    labels = Array.from({length: numWeeks}).map((_, i) => `Mg ${i + 1}`);
    rawData = labels.map((label, idx) => {
      const weeksAgo = (numWeeks - 1) - idx;
      const endWeek = new Date(now);
      endWeek.setDate(endWeek.getDate() - weeksAgo * 7);
      const startWeek = new Date(endWeek);
      startWeek.setDate(startWeek.getDate() - 7);
      
      const matched = filteredBookings.filter((b) => {
        const d = new Date(b.created_at || b.date);
        return d > startWeek && d <= endWeek;
      });
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  } else if (filter === '1 Tahun') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0,0,0,0);
    filteredBookings = bookings.filter(b => new Date(b.created_at || b.date) >= start);

    labels = Array.from({length: 12}).map((_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleDateString('id-ID', { month: 'short' });
    });
    rawData = labels.map((label, idx) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - idx));
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      
      const matched = filteredBookings.filter((b) => {
        const bd = new Date(b.created_at || b.date);
        return bd.getMonth() === targetMonth && bd.getFullYear() === targetYear;
      });
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  }

  const total = filteredBookings.length;

  const maxColumnTotal = Math.max(1, ...rawData.map(d => d.disetujui + d.lainnya));
  const statsData = rawData.map(d => ({
    label: d.label,
    val1: (d.disetujui / maxColumnTotal) * 100,
    val2: (d.lainnya / maxColumnTotal) * 100,
    raw1: d.disetujui,
    raw2: d.lainnya,
    total: d.disetujui + d.lainnya
  }));

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-foreground">Statistik Penggunaan</h3>
        
        {/* Dropdown Filter */}
        <div className="relative">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 py-1 bg-muted rounded text-[10px] font-semibold border border-border flex items-center gap-1 cursor-pointer hover:bg-muted/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            {filter}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
              {['1 Hari', '1 Minggu', '1 Bulan', '2 Bulan', '1 Tahun'].map((opt) => (
                <div 
                  key={opt}
                  onClick={() => {
                    setFilter(opt as any);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 ${filter === opt ? 'font-bold text-primary' : 'text-foreground'}`}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <div className="text-3xl font-black text-foreground">{total}</div>
        <div className="text-xs text-green-500 font-bold mb-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 17 9-11 9 11" />
          </svg>
          Periode ini
        </div>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-1 mt-auto">
        {statsData.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer" title={`${s.label}: ${s.total} Reservasi (${s.raw1} Disetujui, ${s.raw2} Lainnya)`}>
            <div className="w-full flex flex-col justify-end h-[100px] relative">
              <span className="absolute bottom-full mb-1 w-full text-center text-xs font-black text-foreground transition-all duration-300 group-hover:-translate-y-1">
                {s.total > 0 ? s.total : ''}
              </span>
              <div className="w-full bg-primary/20 rounded-t-sm transition-all duration-300 group-hover:bg-primary/30 flex items-center justify-center overflow-hidden" style={{ height: `${s.val2}%` }}>
                {s.raw2 > 0 && <span className="text-[10px] font-bold text-foreground/70">{s.raw2}</span>}
              </div>
              <div className="w-full bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary/90 flex items-center justify-center overflow-hidden" style={{ height: `${s.val1}%` }}>
                {s.raw1 > 0 && <span className="text-[10px] font-bold text-primary-foreground">{s.raw1}</span>}
              </div>
            </div>
            <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
