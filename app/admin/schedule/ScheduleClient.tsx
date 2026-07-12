'use client';

import { useState, useMemo, useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO
} from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { createBooking } from '@/app/booking/actions';
import { updateBookingStatus } from '@/app/admin/actions';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { BookingActions } from '@/app/admin/BookingActions';
import { StatusBadge } from '@/app/admin/BookingList';

type Booking = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string;
  room: { id: string; name: string };
  user: { id: string; name: string };
};

type AllBooking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string;
  created_at: string;
  room: { name: string };
  user: { name: string; email?: string };
};

type Room = {
  id: string;
  name: string;
};

export default function ScheduleClient({ initialBookings, allBookings, rooms }: { initialBookings: Booking[], allBookings: AllBooking[], rooms: Room[] }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'calendar' | 'table'>(
    searchParams?.get('tab') === 'table' ? 'table' : 'calendar'
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ bookingId: string; status: 'DISETUJUI' | 'DITOLAK' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Table states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [addState, formAction, isPending] = useActionState(createBooking, null);

  useEffect(() => {
    if (addState) {
      if (addState.success) {
        toast.success(addState.message);
        setIsAddModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(addState.message);
      }
    }
  }, [addState]);

  const handleApproval = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    const res = await updateBookingStatus(confirmAction.bookingId, confirmAction.status);
    if (res.success) {
      toast.success(confirmAction.status === 'DISETUJUI' ? 'Reservasi berhasil disetujui!' : 'Reservasi berhasil ditolak.');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(res.message || 'Gagal memproses reservasi.');
    }
    setIsProcessing(false);
    setConfirmAction(null);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar math
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = startDate;
  let formattedDate = "";

  const getEventsForDay = (day: Date) => {
    return initialBookings.filter(booking => isSameDay(parseISO(booking.date), day));
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dayEvents = getEventsForDay(day);

      days.push(
        <div
          key={day.toString()}
          onClick={() => setSelectedDate(cloneDay)}
          className={`relative flex flex-col p-2 h-24 md:h-32 border-b border-r border-border transition-colors cursor-pointer hover:bg-muted/50 ${
            !isSameMonth(day, monthStart) ? "bg-muted/20 text-muted-foreground" : "bg-card"
          } ${isSameDay(day, selectedDate) ? "ring-2 ring-inset ring-primary z-10" : ""}`}
        >
          <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
            {formattedDate}
          </span>
          
          <div className="mt-1 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-[10px] md:text-xs truncate px-1.5 py-0.5 rounded-sm font-medium ${
                  event.status === 'DISETUJUI' 
                    ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' 
                    : event.status === 'MENUNGGU'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-500 border border-red-500/30'
                }`}
                title={`${event.room?.name || 'Unknown'} - ${event.reason}`}
              >
                {event.start_time.substring(0,5)} {event.room?.name || 'Unknown'}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const selectedDayEvents = getEventsForDay(selectedDate);

  // === TABLE LOGIC ===
  const statuses = ['Semua Status', 'Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan'];

  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking: any) => {
      if (statusFilter !== 'Semua Status' && booking.status !== statusFilter.toUpperCase()) return false;
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const userName = booking.user?.name || '';
        const roomName = booking.room?.name || '';
        const reason = booking.reason || '';
        const statusStr = booking.status || '';
        const idStr = booking.id || '';
        const combined = `${userName} ${roomName} ${reason} ${statusStr} ${idStr}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    });
  }, [allBookings, statusFilter, search]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <>
      {/* PAGE HEADER + TABS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight lg:text-4xl">Jadwal & Reservasi</h1>
            <p className="text-muted-foreground">Lihat dan kelola seluruh jadwal penggunaan ruangan KampusConnect.</p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Kalender
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
            Daftar Reservasi
            {allBookings.filter(b => b.status === 'MENUNGGU').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-yellow-500/20 text-yellow-700 rounded-full">
                {allBookings.filter(b => b.status === 'MENUNGGU').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 min-h-0 bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
        
        {/* ===== CALENDAR TAB ===== */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Calendar View (Left) */}
            <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy", { locale: id })}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {initialBookings.filter(b => isSameMonth(parseISO(b.date), currentDate)).length} kegiatan bulan ini
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                    <button onClick={prevMonth} className="p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium hover:bg-background rounded-md transition-colors">
                      Hari ini
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex flex-col bg-muted/10">
                <div className="grid grid-cols-7 bg-muted/30 border-b border-border sticky top-0 z-20">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                    <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{d}</div>
                  ))}
                </div>
                <div className="flex flex-col flex-1">{rows}</div>
              </div>
            </div>

            {/* Agenda Sidebar (Right) */}
            <div className="w-full lg:w-96 flex flex-col bg-muted/5 overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{format(selectedDate, "eeee, d MMMM", { locale: id })}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDayEvents.length} kegiatan</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-colors shadow-sm"
                  title="Tambah Kegiatan"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                    <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <p>Tidak ada kegiatan di hari ini.</p>
                  </div>
                ) : (
                  selectedDayEvents.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-4 rounded-xl border ${
                        event.status === 'DISETUJUI' 
                          ? 'bg-blue-500/10 border-blue-500/20' 
                          : event.status === 'MENUNGGU'
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${
                          event.status === 'DISETUJUI' ? 'bg-blue-500' : event.status === 'MENUNGGU' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          event.status === 'DISETUJUI' ? 'text-blue-500' : event.status === 'MENUNGGU' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{event.reason}</h4>
                      <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {event.start_time.substring(0,5)} - {event.end_time.substring(0,5)}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          {event.room?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {event.user?.name || 'Anonim'}
                        </div>
                      </div>

                      {event.status === 'MENUNGGU' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-500/20">
                          <button
                            onClick={() => setConfirmAction({ bookingId: event.id, status: 'DISETUJUI' })}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-green-500/15 text-green-700 border border-green-500/25 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Setujui
                          </button>
                          <button
                            onClick={() => setConfirmAction({ bookingId: event.id, status: 'DITOLAK' })}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/15 text-red-700 border border-red-500/25 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TABLE TAB ===== */}
        {activeTab === 'table' && (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-foreground">Daftar Reservasi</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">{filteredBookings.length} data</span>
              </div>
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

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">
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
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                        Tidak ada data yang cocok dengan pencarian/filter.
                      </td>
                    </tr>
                  ) : paginatedBookings.map((booking: any) => (
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
                        {booking.date} &bull; {booking.startTime || booking.start_time}-{booking.endTime || booking.end_time}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between shrink-0">
                <div className="text-xs text-muted-foreground font-medium">
                  Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} dari {filteredBookings.length}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'border border-border bg-card hover:bg-muted text-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-card hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">Tambah Reservasi (Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form 
              action={formAction} 
              className="p-6 space-y-4"
              noValidate
              onSubmit={(e) => {
                if (!e.currentTarget.checkValidity()) {
                  e.preventDefault();
                  toast.error("Harap lengkapi semua data reservasi terlebih dahulu.");
                }
              }}
            >
              {addState && (
                <div className={`p-3 rounded-lg font-medium text-sm border ${addState.success ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-red-500/10 text-red-700 border-red-500/20'}`}>
                  {addState.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1.5">Ruangan</label>
                <select name="roomId" required className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">-- Pilih Ruangan --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Tanggal</label>
                <input type="date" name="date" defaultValue={format(selectedDate, "yyyy-MM-dd")} required className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Mulai</label>
                  <input type="time" name="startTime" required className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Selesai</label>
                  <input type="time" name="endTime" required className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Tujuan / Nama Kegiatan</label>
                <textarea name="reason" required rows={3} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Masukkan tujuan..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 font-bold text-muted-foreground hover:text-foreground">Batal</button>
                <button type="submit" disabled={isPending} className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {isPending && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  Simpan Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal for Approve/Reject */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.status === 'DISETUJUI' ? 'Setujui Reservasi' : 'Tolak Reservasi'}
        message={confirmAction?.status === 'DISETUJUI'
          ? 'Apakah Anda yakin ingin menyetujui reservasi ini?'
          : 'Apakah Anda yakin ingin menolak reservasi ini? Tindakan ini tidak dapat diurungkan.'}
        confirmText={confirmAction?.status === 'DISETUJUI' ? 'Ya, Setujui' : 'Ya, Tolak'}
        onConfirm={handleApproval}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
