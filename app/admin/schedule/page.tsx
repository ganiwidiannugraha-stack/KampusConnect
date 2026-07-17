import { getScheduleBookings } from './actions';
import { getBookings } from '@/app/admin/actions';
import ScheduleClient from './ScheduleClient';
import { getRooms } from '@/app/(main)/rooms/actions';

export const metadata = {
  title: 'Jadwal & Reservasi - Admin KampusConnect',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SchedulePage() {
  const [scheduleBookings, allBookings, roomsData] = await Promise.all([
    getScheduleBookings(),
    getBookings(),
    getRooms(),
  ]);
  const rooms = roomsData || [];

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.8))] md:h-[calc(100vh-theme(spacing.8)-theme(spacing.8))] gap-6 animate-in fade-in zoom-in-95 duration-300 p-6 lg:p-8 bg-background">
      <ScheduleClient initialBookings={scheduleBookings as any} allBookings={allBookings as any} rooms={rooms} />
    </div>
  );
}
