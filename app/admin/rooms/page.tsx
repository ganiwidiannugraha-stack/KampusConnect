import { getRooms } from './actions';
import { RoomsClient } from './RoomsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRoomsPage() {
  const rooms = await getRooms();
  
  return (
    <div className="p-6 lg:p-8 min-h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">
            Kelola Ruangan
          </h1>
          <p className="text-muted-foreground font-medium">
            Atur dan tambahkan katalog ruang yang tersedia untuk dipesan.
          </p>
        </div>
      </div>
      
      <RoomsClient initialRooms={rooms} />
    </div>
  );
}
