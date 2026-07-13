'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CancelBookingButton } from './CancelBookingButton';
import { DownloadPdfButton } from './DownloadPdfButton';

type MyBookingsClientProps = {
  bookings: any[];
  user: any;
};

export function MyBookingsClient({ bookings, user }: MyBookingsClientProps) {
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat'>('aktif');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'aktif') {
      return b.status === 'MENUNGGU' || b.status === 'DISETUJUI';
    } else {
      return b.status === 'DITOLAK' || b.status === 'DIBATALKAN';
    }
  });

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleTabChange = (tab: 'aktif' | 'riwayat') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative z-10">
      
      {/* TOOLBAR */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="font-bold text-foreground">Daftar Reservasi</h2>
          <div className="flex bg-background border border-border rounded-lg overflow-hidden">
            <button 
              onClick={() => handleTabChange('aktif')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${activeTab === 'aktif' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              Aktif
            </button>
            <button 
              onClick={() => handleTabChange('riwayat')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${activeTab === 'riwayat' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              Riwayat
            </button>
          </div>
        </div>
        <div className="relative w-full sm:w-auto flex justify-end">
          <button 
            onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
            className="px-3 py-2 border border-border bg-background rounded-lg text-xs font-semibold hover:bg-muted flex items-center gap-2 whitespace-nowrap text-foreground min-h-[32px]"
          >
            {pageSize} / Halaman
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isPageSizeOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {isPageSizeOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-20">
              {[5, 10, 15, 20].map((size) => (
                <div 
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                    setIsPageSizeOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 ${pageSize === size ? 'font-bold text-primary' : 'text-foreground'}`}
                >
                  Tampilkan {size}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-sm">
              <th className="px-6 py-4 font-bold">Tanggal Pengajuan</th>
              <th className="px-6 py-4 font-bold">Ruangan</th>
              <th className="px-6 py-4 font-bold">Waktu Penggunaan</th>
              <th className="px-6 py-4 font-bold">Tujuan</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  {activeTab === 'aktif' ? (
                    <>
                      Anda belum pernah mengajukan reservasi ruangan.<br />
                      <Link href="/rooms" className="text-primary hover:underline mt-2 inline-block">Mulai pesan ruangan sekarang!</Link>
                    </>
                  ) : (
                    "Belum ada riwayat reservasi yang ditolak atau dibatalkan."
                  )}
                </td>
              </tr>
            ) : paginatedBookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-foreground">
                  {booking.room?.name || 'Ruang Dihapus'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold">{booking.date}</div>
                  <div className="text-muted-foreground text-xs">{booking.startTime} - {booking.endTime}</div>
                </td>
                <td className="px-6 py-4 text-sm max-w-xs truncate" title={booking.reason}>
                  {booking.reason}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'DISETUJUI' ? 'bg-green-500/20 text-green-700' :
                      booking.status === 'DITOLAK' ? 'bg-red-500/20 text-red-700' :
                        booking.status === 'DIBATALKAN' ? 'bg-muted text-muted-foreground' :
                          'bg-yellow-500/20 text-yellow-700'
                    }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <DownloadPdfButton booking={booking} userName={user!.name} />
                    <CancelBookingButton
                      bookingId={booking.id}
                      bookingDate={booking.date}
                      status={booking.status}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-border">
        {paginatedBookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {activeTab === 'aktif' ? (
              <>
                Anda belum pernah mengajukan reservasi ruangan.<br />
                <Link href="/rooms" className="text-primary font-bold hover:underline mt-3 inline-block bg-primary/10 px-4 py-2 rounded-lg">Pesan Ruangan Sekarang</Link>
              </>
            ) : (
              "Belum ada riwayat reservasi yang ditolak atau dibatalkan."
            )}
          </div>
        ) : paginatedBookings.map((booking: any) => (
          <div key={booking.id} className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg text-foreground mb-1">{booking.room?.name || 'Ruang Dihapus'}</h3>
                <div className="text-xs text-muted-foreground font-medium">
                  Diajukan: {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-black ${booking.status === 'DISETUJUI' ? 'bg-green-500/10 border border-green-500/20 text-green-700' :
                  booking.status === 'DITOLAK' ? 'bg-red-500/10 border border-red-500/20 text-red-700' :
                    booking.status === 'DIBATALKAN' ? 'bg-muted border border-border text-muted-foreground' :
                      'bg-yellow-500/10 border border-yellow-500/20 text-yellow-700'
                }`}>
                {booking.status}
              </span>
            </div>

            <div className="bg-muted/40 rounded-lg p-3 grid grid-cols-2 gap-3 border border-border/50">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tanggal</span>
                <span className="text-sm font-semibold text-foreground">{booking.date}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Waktu</span>
                <span className="text-sm font-semibold text-foreground">{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="col-span-2 mt-1">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tujuan Kegiatan</span>
                <p className="text-sm text-foreground/80 leading-relaxed">{booking.reason}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <DownloadPdfButton booking={booking} userName={user!.name} />
              <CancelBookingButton
                bookingId={booking.id}
                bookingDate={booking.date}
                status={booking.status}
              />
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Menampilkan <span className="font-bold text-foreground">{paginatedBookings.length > 0 ? (safePage - 1) * pageSize + 1 : 0}</span> - <span className="font-bold text-foreground">{Math.min(safePage * pageSize, filteredBookings.length)}</span> dari <span className="font-bold text-foreground">{filteredBookings.length}</span> reservasi
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 border border-border rounded bg-background hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="px-3 text-xs font-bold text-foreground flex items-center">
              Halaman {safePage} dari {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 border border-border rounded bg-background hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
