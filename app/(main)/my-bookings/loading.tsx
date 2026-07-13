import { Skeleton } from "@/components/ui/skeleton";

export default function MyBookingsLoading() {
  return (
    <div className="flex-1 bg-background text-foreground font-sans">
      <main className="container mx-auto px-4 py-12 relative">
        <div className="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
        
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative z-10">
          {/* Desktop Table View Skeleton */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4 flex justify-center"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-8 w-24 rounded-lg" /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View Skeleton */}
          <div className="md:hidden divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
