import { getRooms } from './actions';
import RoomsClient from './RoomsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Katalog Ruangan | KampusConnect',
  description: 'Daftar fasilitas ruangan yang tersedia untuk dipesan',
};

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="flex-1 bg-background text-foreground font-sans">
      <main className="animate-in fade-in duration-1000">
        <RoomsClient rooms={rooms} />
      </main>
    </div>
  );
}
