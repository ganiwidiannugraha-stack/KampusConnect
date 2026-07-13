import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="p-6 lg:p-8 bg-background min-h-full">
      
      {/* TOP SECTION: 4 STAT CARDS — matches actual dashboard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-14 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION: Chart (2 col) + Recent List (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Stats Chart Area */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
        
        {/* 5 Recent Requests */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col lg:col-span-1 h-[350px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-5 w-12 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Pending Quick Actions Table */}
      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="px-5 py-2.5"><Skeleton className="h-3 w-16" /></th>
                <th className="px-5 py-2.5"><Skeleton className="h-3 w-16" /></th>
                <th className="px-5 py-2.5"><Skeleton className="h-3 w-20" /></th>
                <th className="px-5 py-2.5 text-center"><Skeleton className="h-3 w-12 mx-auto" /></th>
                <th className="px-5 py-2.5 text-center"><Skeleton className="h-3 w-10 mx-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Skeleton className="h-3.5 w-28" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-3.5 w-36" /></td>
                  <td className="px-5 py-3 text-center"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></td>
                  <td className="px-5 py-3 text-center"><Skeleton className="h-8 w-20 rounded-lg mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
