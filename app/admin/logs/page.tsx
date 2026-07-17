import { getActivityLogs } from './actions';
import { LogsClient } from './LogsClient';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const logs = await getActivityLogs();
  
  return (
    <div className="p-6 lg:p-8 min-h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground mb-2">
            Log Aktivitas
          </h1>
          <p className="text-muted-foreground font-medium">
            Pantau seluruh rekam jejak aktivitas pengguna dan administrator di dalam sistem.
          </p>
        </div>
      </div>
      
      <LogsClient initialLogs={logs} />
    </div>
  );
}
