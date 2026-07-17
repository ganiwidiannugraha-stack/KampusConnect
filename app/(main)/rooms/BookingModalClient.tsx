'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createBooking } from '@/app/booking/actions';
import { toast } from 'sonner';

const ROOM_GALLERIES: Record<string, string[]> = {
  'room-1': [
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=800'
  ],
  'room-2': [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
  ],
  'room-3': [
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  ],
  'room-4': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1582653291997-079a1c04e5d1?auto=format&fit=crop&q=80&w=800',
  ],
  'default': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800'
  ]
};

export default function BookingModalClient({
  room,
  triggerClassName,
  initialDate,
  triggerText,
  onOpen,
  defaultOpen = false,
  onClose
}: {
  room: { id: string; name: string; capacity: number; images?: string[] },
  triggerClassName?: string,
  initialDate?: string,
  triggerText?: string,
  onOpen?: () => void,
  defaultOpen?: boolean,
  onClose?: () => void
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen]);
  const [state, formAction, pending] = useActionState(createBooking, null);
  const [mounted, setMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
    if (isRightSwipe) {
      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when booking is successful, and show toast
  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message);
        const timer = setTimeout(() => {
          setIsOpen(false);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const images = (room.images && room.images.length > 0)
    ? room.images
    : (ROOM_GALLERIES[room.id] || ROOM_GALLERIES['default']);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-6 md:p-12">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Container utama: Bottom sheet di HP, Modal di layar besar */}
      <div className="relative flex flex-col md:flex-row bg-card w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden border border-border animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">


        {/* Kolom Kiri: Galeri Foto */}
        <div
          className="w-full md:w-1/2 min-h-[200px] sm:min-h-[250px] md:min-h-0 relative bg-black flex flex-col group shrink-0 cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-1 relative overflow-hidden">
            <div
              className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center relative">
                  <img src={img} alt={`Kondisi ${room.name} - ${idx + 1}`} className="w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
                </div>
              ))}
            </div>

            {/* Header / Info Ruangan di Atas Foto */}
            <div className="absolute top-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-black text-white drop-shadow-lg leading-tight mb-2">{room.name}</h3>
              <span className="inline-flex items-center justify-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-sm">
                Kapasitas: {room.capacity} Orang
              </span>
            </div>

            {/* Icon Expand */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>

            {/* Navigasi Kiri Kanan (Muncul saat hover) */}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              &#10094;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              &#10095;
            </button>

            {/* Indikator Dot di Bawah Foto */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all ${activeImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Pemesanan */}
        <div className="w-full md:w-1/2 flex flex-col max-h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Formulir Reservasi</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground bg-background rounded-full p-2 hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <form 
              action={formAction} 
              className="space-y-5"
              noValidate
              onSubmit={(e) => {
                if (!e.currentTarget.checkValidity()) {
                  e.preventDefault();
                  toast.error("Harap isi semua detail reservasi yang wajib diisi.");
                }
              }}
            >
              <input type="hidden" name="roomId" value={room.id} />

              {state && (
                <div className={`p-3 rounded-lg font-medium text-sm border ${state.success ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-red-500/10 text-red-700 border-red-500/20'}`}>
                  {state.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Tanggal Kegiatan</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={initialDate}
                  min={new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0]}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Waktu (Mulai - Selesai)</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 w-full relative">
                    <input
                      type="time"
                      name="startTime"
                      required
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all dark:[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <span className="hidden sm:inline text-muted-foreground font-bold">-</span>
                  <div className="flex-1 w-full relative">
                    <input
                      type="time"
                      name="endTime"
                      required
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all dark:[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Jumlah Peserta</label>
                <input
                  type="number"
                  name="jumlahPeserta"
                  required
                  min="1"
                  max={room.capacity}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  placeholder={`Maksimal ${room.capacity} orang`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Nama / Tujuan Kegiatan</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all resize-none"
                  placeholder="Misal: Rapat Koordinasi Tahunan..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80 flex items-center justify-between">
                  <span>Lampiran Proposal / Surat Izin (Wajib)</span>
                  <span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">Format: PDF/JPG/PNG (Maks 2MB)</span>
                </label>
                <div className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                  <input
                    type="file"
                    name="lampiran"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-muted-foreground file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pending || state?.success}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {pending ? 'Memproses...' : state?.success ? 'Berhasil Dipesan!' : 'Ajukan Reservasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const lightboxContent = isLightboxOpen ? (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-[210]">
        <button
          onClick={() => setIsLightboxOpen(false)}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out items-center"
          style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center relative p-0 sm:p-4">
              <img src={img} alt={`Fullscreen ${room.name} - ${idx + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows for Lightbox */}
        <button
          onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all"
        >
          &#10094;
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all"
        >
          &#10095;
        </button>

        {/* Indikator Dot di Bawah Foto Lightbox */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
              className={`h-2 rounded-full transition-all shadow-sm ${activeImageIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          if (onOpen) onOpen();
        }}
        className={triggerClassName || "flex h-11 w-full items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"}
      >
        {triggerText || "Reservasi"}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
      {mounted && isLightboxOpen && createPortal(lightboxContent, document.body)}
    </>
  );
}
