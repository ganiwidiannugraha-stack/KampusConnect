import { getBuildings } from './actions';
import { BuildingsClient } from './BuildingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminBuildingsPage() {
  const buildings = await getBuildings();
  
  return (
    <div className="p-6 lg:p-8 min-h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">
            Kelola Gedung
          </h1>
          <p className="text-muted-foreground font-medium">
            Atur dan kelola daftar gedung yang ada di dalam kampus.
          </p>
        </div>
      </div>
      
      <BuildingsClient initialBuildings={buildings} />
    </div>
  );
}
