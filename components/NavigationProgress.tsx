'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NProgress-style top loading bar yang muncul saat navigasi antar halaman.
 * Menggunakan usePathname() dari Next.js untuk mendeteksi perubahan route.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(20);
    
    // Simulasi progress naik bertahap
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  }, []);

  const finishLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  // Intercept clicks pada <a> tags untuk mendeteksi navigasi dimulai
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href) return;
      
      // Hanya proses internal links
      if (href.startsWith('/') && href !== pathname) {
        startLoading();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, startLoading]);

  // Ketika pathname berubah = navigasi selesai
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      finishLoading();
      prevPathname.current = pathname;
    }
  }, [pathname, finishLoading]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-primary shadow-[0_0_10px_var(--primary)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
