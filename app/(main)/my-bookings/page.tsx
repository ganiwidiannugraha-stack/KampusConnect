import Link from 'next/link';
import { getMyBookings } from './actions';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { CancelBookingButton } from './CancelBookingButton';
import { DownloadPdfButton } from './DownloadPdfButton';
import { MyBookingsClient } from './MyBookingsClient';

export default async function MyBookingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const bookings = await getMyBookings();

  return (
    <div className="flex-1 bg-background text-foreground font-sans">
      <main className="container mx-auto px-4 py-12 relative">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] pointer-events-none" />

        <div className="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">Reservasi Saya</h1>
            <p className="text-muted-foreground text-lg">Pantau status persetujuan ruangan yang Anda ajukan.</p>
          </div>
          <Link
            href="/rooms"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            + Buat Reservasi Baru
          </Link>
        </div>

        <MyBookingsClient bookings={bookings} user={user} />
      </main>
    </div>
  );
}
