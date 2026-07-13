"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col w-full h-full animate-in fade-in duration-300">
      {children}
    </div>
  );
}
