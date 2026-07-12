'use client';

import { useState } from 'react';
import { BookingActions } from './BookingActions';

export default function BookingList({ initialBookings }: { initialBookings: any[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter bookings based on search and status
  const filteredBookings = initialBookings.filter((booking) => {
    // 1. Status Filter
    if (statusFilter !== 'Semua Status' && booking.status !== statusFilter.toUpperCase()) {
      return false;
    }

    // 2. Search Filter (match name, reason, room, status, or id)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const userName = Array.isArray(booking.user) ? (booking.user[0]?.name || '') : (booking.user?.name || '');
      const roomName = Array.isArray(booking.room) ? (booking.room[0]?.name || '') : (booking.room?.name || '');
      const reason = booking.reason || '';
      const statusStr = booking.status || '';
      const idStr = booking.id || '';
      
      const combinedString = `${userName} ${roomName} ${reason} ${statusStr} ${idStr}`.toLowerCase();
      
      if (!combinedString.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const statuses = ['Semua Status', 'Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan'];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="font-bold text-foreground">Daftar Reservasi</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari pemohon, alasan, ruangan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:border-primary text-foreground" 
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 border border-border bg-muted rounded-lg text-xs font-semibold hover:bg-muted/80 flex items-center gap-2 whitespace-nowrap text-foreground"
            >
              {statusFilter}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                {statuses.map((s) => (
                  <div 
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 ${statusFilter === s ? 'font-bold text-primary' : 'text-foreground'}`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/20 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-bold">Booking ID</th>
              <th className="px-5 py-3 font-bold">Diajukan Pada</th>
              <th className="px-5 py-3 font-bold">Pemohon</th>
              <th className="px-5 py-3 font-bold">Ruangan</th>
              <th className="px-5 py-3 font-bold">Jadwal Pakai</th>
              <th className="px-5 py-3 font-bold text-center">Status</th>
              <th className="px-5 py-3 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada data yang cocok dengan pencarian/filter.
                </td>
              </tr>
            ) : filteredBookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 text-xs font-semibold whitespace-nowrap text-muted-foreground">
                  #{booking.id.toUpperCase().substring(0, 8)}
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                  {booking.created_at ? (
                    <>
                      <div className="font-semibold text-foreground">
                        {new Date(booking.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {new Date(booking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </>
                  ) : '-'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-bold text-sm text-foreground">{booking.user?.name || 'Anonim'}</div>
                  <div className="text-muted-foreground text-[11px] line-clamp-1 max-w-[200px]" title={booking.reason}>{booking.reason}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {booking.room?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {booking.date} &bull; {booking.startTime}-{booking.endTime}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-center scale-90 origin-right">
                    <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'DISETUJUI') {
    return <span className="inline-flex justify-center w-[90px] items-center px-2 py-1 rounded border border-green-500/20 bg-green-500/10 text-[10px] font-bold text-green-600 dark:text-green-400">Diizinkan</span>;
  }
  if (status === 'DITOLAK') {
    return <span className="inline-flex justify-center w-[90px] items-center px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-[10px] font-bold text-red-600 dark:text-red-400">Ditolak</span>;
  }
  if (status === 'DIBATALKAN') {
    return <span className="inline-flex justify-center w-[90px] items-center px-2 py-1 rounded border border-gray-500/20 bg-gray-500/10 text-[10px] font-bold text-gray-500 dark:text-gray-400">Batal</span>;
  }
  return <span className="inline-flex justify-center w-[90px] items-center px-2 py-1 rounded border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-bold text-yellow-600 dark:text-yellow-500">Menunggu</span>;
}
