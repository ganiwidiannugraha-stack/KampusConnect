'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, LayoutGrid, CalendarRange, User, ChevronRight, LogOut, LogIn } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

interface NavItem {
  label: string;
  href: string;
}

export function MobileNavClient({ 
  navItems, 
  isLoggedIn,
  user
}: { 
  navItems: NavItem[],
  isLoggedIn: boolean,
  user?: any
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Kunci scroll body saat menu terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getIcon = (href: string) => {
    if (href === '/') return <Home size={20} />;
    if (href.startsWith('/rooms')) return <LayoutGrid size={20} />;
    if (href.startsWith('/my-bookings')) return <CalendarRange size={20} />;
    return <ChevronRight size={20} />;
  };

  return (
    <div className="md:hidden flex items-center gap-2">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md"
        aria-label="Open Menu"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-[320px] bg-background z-[101] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } rounded-l-2xl overflow-hidden`}
      >
        {/* Header Drawer */}
        <div className="relative pt-12 pb-6 px-6 bg-gradient-to-br from-primary/10 to-transparent border-b border-border">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background text-foreground transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shrink-0">
                <span className="text-xl font-bold uppercase">{user.name?.charAt(0) || <User size={24} />}</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-foreground text-lg truncate leading-tight">{user.name}</span>
                <span className="text-sm font-bold text-foreground/70 mt-0.5 truncate">{user.role?.name || 'Mahasiswa'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-inner shrink-0">
                <User size={24} className="text-muted-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-foreground text-lg leading-tight">Tamu</span>
                <span className="text-sm font-medium text-muted-foreground mt-0.5">Silakan masuk</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-1.5 custom-scrollbar">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-3">Menu Utama</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && (pathname || '').startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-black shadow-md' 
                    : 'text-foreground/80 hover:bg-muted font-semibold hover:text-foreground'
                }`}
              >
                <div className={`${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {getIcon(item.href)}
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/10">
          {!isLoggedIn ? (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-base font-bold text-primary-foreground bg-primary p-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <LogIn size={20} />
              Masuk / Daftar
            </Link>
          ) : (
            <LogoutButton className="flex items-center justify-center gap-2 w-full text-base font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive p-3.5 rounded-xl transition-all border border-destructive/20 hover:border-transparent active:scale-[0.98]">
              <LogOut size={20} />
              Keluar Akun
            </LogoutButton>
          )}
        </div>
      </div>
    </div>
  );
}
