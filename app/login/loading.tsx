import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="text-center mb-8 flex flex-col items-center">
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl mt-6" />
        </div>
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
