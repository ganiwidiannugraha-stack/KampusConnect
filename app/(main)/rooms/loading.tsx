import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <div className="flex flex-col flex-1">
      {/* HERO SECTION SKELETON */}
      <div className="relative h-[380px] md:h-[430px] lg:h-[450px] w-full bg-slate-900/40 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* FILTER SECTION SKELETON */}
      <div className="sticky top-0 z-40 w-full -mt-16 flex justify-center">
        <div className="w-[calc(100%-3rem)] lg:w-[calc(100%-6rem)] max-w-[1184px] rounded-2xl bg-card shadow-xl border border-border">
           <div className="w-full max-w-7xl px-4 md:px-5 py-4 md:py-5 flex flex-col md:flex-row gap-4">
             <div className="w-full md:flex-1 space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-12 w-full rounded-xl" />
             </div>
             <div className="w-full md:w-48 space-y-2">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-12 w-full rounded-xl" />
             </div>
             <div className="w-full md:w-48 space-y-2">
               <Skeleton className="h-4 w-16" />
               <Skeleton className="h-12 w-full rounded-xl" />
             </div>
           </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 pt-10 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR SKELETON */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
        </div>

        {/* KONTEN UTAMA SKELETON */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="space-y-3">
               <Skeleton className="h-4 w-48" />
               <Skeleton className="h-8 w-72" />
               <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-4">
               <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm h-full">
                <Skeleton className="w-full sm:w-[280px] md:w-[320px] aspect-[4/3] sm:h-auto shrink-0 rounded-none" />
                <div className="p-4 md:p-6 flex flex-col justify-between flex-1 w-full min-w-0 gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Skeleton className="h-8 w-16 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
