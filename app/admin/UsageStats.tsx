'use client';

import { useState } from 'react';

export default function UsageStats({ bookings }: { bookings: any[] }) {
  const [filter, setFilter] = useState<'Mingguan' | 'Bulanan' | 'Tahunan'>('Mingguan');
  const [isOpen, setIsOpen] = useState(false);

  // 1. Hitung total
  const total = bookings.length;

  // 2. Logic berdasarkan filter
  let labels: string[] = [];
  let rawData: { label: string; disetujui: number; lainnya: number }[] = [];

  if (filter === 'Mingguan') {
    labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    rawData = labels.map((dayLabel, idx) => {
      const targetDay = idx === 6 ? 0 : idx + 1;
      const matched = bookings.filter((b) => new Date(b.created_at || b.date).getDay() === targetDay);
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label: dayLabel, disetujui, lainnya: matched.length - disetujui };
    });
  } else if (filter === 'Bulanan') {
    labels = ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'];
    rawData = labels.map((label, idx) => {
      const matched = bookings.filter((b) => {
        const date = new Date(b.created_at || b.date).getDate();
        if (idx === 0) return date >= 1 && date <= 7;
        if (idx === 1) return date >= 8 && date <= 14;
        if (idx === 2) return date >= 15 && date <= 21;
        return date >= 22;
      });
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  } else if (filter === 'Tahunan') {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    rawData = labels.map((label, idx) => {
      const matched = bookings.filter((b) => new Date(b.created_at || b.date).getMonth() === idx);
      const disetujui = matched.filter((b) => b.status === 'DISETUJUI').length;
      return { label, disetujui, lainnya: matched.length - disetujui };
    });
  }

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
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
              {['Mingguan', 'Bulanan', 'Tahunan'].map((opt) => (
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
          12% dr bln lalu
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
