import { getFacilities } from './actions';
import { FacilitiesClient } from './FacilitiesClient';

export const dynamic = 'force-dynamic';

export default async function AdminFacilitiesPage() {
  const facilities = await getFacilities();
  
  return (
    <div className="p-6 lg:p-8 min-h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">
            Kelola Fasilitas
          </h1>
          <p className="text-muted-foreground font-medium">
            Atur dan kelola daftar fasilitas (inventaris) yang bisa ditambahkan ke ruangan.
          </p>
        </div>
      </div>
      
      <FacilitiesClient initialFacilities={facilities} />
    </div>
  );
}
