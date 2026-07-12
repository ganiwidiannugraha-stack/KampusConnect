'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import BookingModalClient from "./BookingModalClient";

type Booking = {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
};

export default function RoomCalendarModal({ room, triggerClassName, iconOnly = false }: { room: any, triggerClassName?: string, iconOnly?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [transitionToBooking, setTransitionToBooking] = useState<string | null>(null);

  const bookings: Booking[] = room.bookings || [];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Helper untuk format YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getDayBookings = (dateStr: string) => {
    return bookings
      .filter(b => b.date === dateStr && b.status !== 'DITOLAK' && b.status !== 'DIBATALKAN')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button onClick={() => setIsOpen(true)} className={triggerClassName || "flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-foreground rounded-md text-[10px] font-bold transition-colors"}>
          <CalendarIcon className={iconOnly ? "w-5 h-5" : "w-3.5 h-3.5"} />
          {!iconOnly && "Lihat Kalender"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-card border-border p-0 overflow-hidden w-full max-w-full !bottom-0 sm:!bottom-auto !top-auto sm:!top-[50%] !translate-y-0 sm:!-translate-y-1/2 !rounded-t-2xl sm:!rounded-2xl !rounded-b-none sm:!rounded-b-2xl mt-auto sm:mt-0 transition-transform">
        <div className="flex flex-col md:flex-row w-full max-h-[85vh] md:max-h-[600px]">
          {/* KIRI: Kalender */}
          <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-xl mb-6 text-center text-foreground flex items-center justify-center gap-2">
              <CalendarIcon className="w-5 h-5 text-foreground" />
              Jadwal {room.name}
            </h3>
            
            <div className="flex justify-between items-center mb-6 bg-muted/50 rounded-xl p-1.5 border border-border/50">
              <button onClick={prevMonth} className="p-2 hover:bg-background rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="font-bold text-sm text-foreground">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-background rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
              <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-9"></div>;
                
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayBookings = getDayBookings(dateStr);
                const isSelected = selectedDate === dateStr;
                
                const todayStr = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                const isToday = dateStr === todayStr;
                
                let bgClass = "bg-muted/20 hover:bg-muted/50 text-foreground";
                if (dayBookings.length > 0) {
                  if (dayBookings.length >= 3) {
                     bgClass = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-bold";
                  } else {
                     bgClass = "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 font-bold";
                  }
                }
                if (isSelected) {
                  bgClass = "bg-primary text-primary-foreground font-bold shadow-md transform scale-105";
                }

                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative h-9 rounded-lg flex items-center justify-center text-sm transition-all border ${bgClass} ${isToday && !isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-transparent'}`}
                  >
                    {day}
                    {dayBookings.length > 0 && !isSelected && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${dayBookings.length >= 3 ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground border-t border-border pt-4">
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-muted/50 border border-border"></span> Kosong
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Sebagian
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-red-500"></span> Penuh
               </div>
            </div>
          </div>

          {/* KANAN: Detail & Reservasi */}
          <div className="md:w-[340px] bg-muted/20 flex flex-col border-t md:border-t-0 md:border-l border-border">
            {selectedDate ? (
              <div className="p-5 md:p-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="font-bold text-sm mb-4 text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-foreground" />
                  Jadwal Tgl: <span className="text-foreground">{selectedDate}</span>
                </h4>
                
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 min-h-[200px]">
                  {getDayBookings(selectedDate).length > 0 ? (
                    getDayBookings(selectedDate).map((b: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-background border border-border/60 rounded-lg px-3 py-2.5 text-xs shadow-sm">
                        <span className="font-bold text-foreground bg-muted/50 px-2 py-1 rounded-md">{b.startTime} - {b.endTime || 'Selesai'}</span>
                        <span className="text-muted-foreground font-medium text-right max-w-[140px] truncate" title={b.reason}>{b.reason || 'Kegiatan Organisasi'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center text-xs text-green-700 bg-green-50/50 rounded-lg border border-green-200 border-dashed">
                      <svg className="w-8 h-8 mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-bold text-sm mb-1">Ruangan Kosong!</span>
                      <span className="text-green-600/80">Siap digunakan seharian penuh.</span>
                    </div>
                  )}
                </div>
                
                {/* Tombol Buat Reservasi memicu transisi state */}
                {selectedDate >= new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] ? (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button 
                      onClick={() => {
                        setTransitionToBooking(selectedDate);
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      ➕ Buat Reservasi Tgl {selectedDate}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <span className="block text-xs font-bold text-red-600 mb-1">Batas Waktu Terlewat</span>
                      <span className="text-[10px] text-red-500/80 font-medium">
                        Reservasi harus dilakukan maksimal H-3.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                 <CalendarIcon className="w-16 h-16 mb-4 text-border" />
                 <p className="text-sm font-medium text-slate-500">Pilih salah satu tanggal di kalender untuk melihat detail jadwal atau membuat reservasi baru.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {transitionToBooking && (
      <BookingModalClient 
        room={room} 
        initialDate={transitionToBooking}
        defaultOpen={true}
        onClose={() => setTransitionToBooking(null)}
        triggerClassName="hidden"
      />
    )}
  </>
  );
}
