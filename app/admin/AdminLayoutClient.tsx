'use client';

import { useState, useEffect } from 'react';
import { SidebarNav } from './SidebarNav';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

import { getPendingBookingsCount } from './actions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';

export function AdminLayoutClient({ children, user }: { children: React.ReactNode, user?: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Tutup menu mobile setiap kali rute berubah (saat link diklik)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    getPendingBookingsCount().then(count => setPendingCount(count));
  }, []);

  // Extract initials
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AK';

  // Ekstrak isi sidebar agar bisa dipakai ulang di Desktop dan Mobile
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const collapsedState = !isMobile && isCollapsed;
    return (
      <div className="flex flex-col h-full py-6">
        {/* Logo / Header */}
        <div className={`px-6 mb-8 flex flex-col ${collapsedState ? 'items-center' : 'items-start'} transition-all duration-300`}>
          <Link href="/admin" className="flex items-center">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-sm" />
            </div>
            <span className={`text-xl font-black tracking-tighter text-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsedState ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>KampusConnect</span>
          </Link>
          
          <Link 
            href="/" 
            className={`mt-2 ml-[52px] w-fit p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm ${collapsedState ? 'hidden' : 'flex'}`}
            title="Ke Beranda Utama"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
        </div>

        <div className="mt-4 flex-1 overflow-hidden">
          <SidebarNav isCollapsed={collapsedState} />
        </div>

        {/* Bottom Area (Logout) */}
        <div className="mt-auto pt-6 px-4 pb-4 overflow-hidden">
          <LogoutButton className={`flex w-full items-center p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors ${collapsedState ? 'justify-center' : 'gap-3'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${collapsedState ? 'max-w-0 opacity-0 overflow-hidden' : 'max-w-[150px] opacity-100'}`}>
              Keluar
            </span>
          </LogoutButton>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      
      {/* Sidebar Desktop */}
      <aside 
        className={`${isCollapsed ? 'w-[80px]' : 'w-[280px]'} shrink-0 hidden md:flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out sticky top-0 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar print:hidden`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            {/* Hamburger Desktop */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <line x1="9" x2="9" y1="3" y2="21"/>
              </svg>
            </button>
            
            {/* Hamburger Mobile + Sheet */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileOpen(true)}
                className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              </button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="p-0 w-[280px] bg-card border-r border-border">
                  <SidebarContent isMobile={true} />
                </SheetContent>
              </Sheet>
            </div>
            {/* Search removed - kept minimal */}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-muted-foreground mr-2">
              
              {/* Notification Dropdown */}
              <div className="relative group">
                <button className="relative p-1.5 hover:bg-muted rounded-md hover:text-foreground transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  {pendingCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full border border-background">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>
                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-card border border-border shadow-xl rounded-xl p-3 text-center">
                    <div className="text-sm font-semibold text-foreground mb-1">Notifikasi</div>
                    <div className="text-xs text-muted-foreground">
                      {pendingCount > 0 
                        ? `Ada ${pendingCount} permohonan reservasi yang menunggu persetujuan Anda.` 
                        : 'Tidak ada notifikasi baru.'}
                    </div>
                    {pendingCount > 0 && (
                      <Link href="/admin" className="mt-3 inline-block w-full py-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors relative z-10">
                        Lihat Permohonan
                      </Link>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
            {/* Top Profile Dropdown */}
            <div className="relative group">
              <div className="h-8 w-8 rounded-full bg-emerald-800 text-white border border-emerald-900 flex items-center justify-center font-bold text-xs cursor-pointer uppercase shadow-sm">
                {initials}
              </div>
              <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-card border border-border shadow-xl rounded-xl">
                  <div className="p-4 border-b border-border/50">
                    <div className="text-sm font-bold text-foreground">{user?.name || 'Admin Kampus'}</div>
                    <div className="text-xs text-muted-foreground">{user?.role?.name || 'Administrator'}</div>
                  </div>
                  <div className="p-2 flex flex-col gap-1 relative z-10">
                    <Link href="/" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Beranda Utama
                    </Link>
                    <div className="w-full mt-1 pt-1 border-t border-border/50">
                      <LogoutButton className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                         Keluar
                      </LogoutButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>

      </div>
    </div>
  );
}
