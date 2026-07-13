import { Skeleton } from "@/components/ui/skeleton";

export default function GenericTableLoading() {
  return (
    <main className="p-6 lg:p-8 bg-background min-h-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Toolbar / Filters Area */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-32" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-28" /></th>
                <th className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                <th className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Area */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}
