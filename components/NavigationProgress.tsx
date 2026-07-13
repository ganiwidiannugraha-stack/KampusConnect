'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NProgress-style top loading bar yang muncul saat navigasi antar halaman.
 * Menggunakan usePathname() dari Next.js untuk mendeteksi perubahan route.
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const currentUrl = `${pathname}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`;
  const prevUrl = useRef(currentUrl);
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
      
      // Deteksi path + query params dari href
      let targetUrl = href;
      if (href.startsWith('/')) {
        try {
          const urlObj = new URL(href, window.location.origin);
          targetUrl = `${urlObj.pathname}${urlObj.search}`;
        } catch(e) {}
      }
      
      // Hanya proses internal links yang beda dengan URL saat ini
      if (href.startsWith('/') && targetUrl !== currentUrl) {
        startLoading();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [currentUrl, startLoading]);

  // Ketika currentUrl berubah = navigasi selesai
  useEffect(() => {
    if (prevUrl.current !== currentUrl) {
      finishLoading();
      prevUrl.current = currentUrl;
    }
  }, [currentUrl, finishLoading]);

  // Tambahan pengaman: jika pathname berubah (atau komponen unmount), pastikan timeout dihapus
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
