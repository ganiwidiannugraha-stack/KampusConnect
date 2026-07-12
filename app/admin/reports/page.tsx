import { getRoomsForSelect } from '@/app/booking/actions';
import ReportsClient from './ReportsClient';

export const metadata = {
  title: 'Laporan Penggunaan - Admin KampusConnect',
};

export default async function ReportsPage() {
  const rooms = await getRoomsForSelect();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 min-h-[calc(100vh-theme(spacing.8)-theme(spacing.8))] p-6 lg:p-8 bg-background">
      <div className="flex flex-col gap-2 print:hidden">
        <h1 className="text-3xl font-black tracking-tight lg:text-4xl">Laporan Penggunaan</h1>
        <p className="text-muted-foreground">Tinjau dan cetak data historis peminjaman ruangan yang telah disetujui.</p>
      </div>

      <div className="flex-1 min-h-0">
        <ReportsClient rooms={rooms} />
      </div>
    </div>
  );
}
