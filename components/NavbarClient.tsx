'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import GooeyNav from './ui/GooeyNav';
import { MobileNavClient } from './MobileNavClient';

type NavbarClientProps = {
  user: any;
  isAdmin: boolean;
  navItems: { label: string; href: string; }[];
};

export function NavbarClient({ user, isAdmin, navItems }: NavbarClientProps) {
  const pathname = usePathname();
  const isRoomsPage = pathname === '/rooms';
  const isTransparent = isRoomsPage; // Selalu transparan di halaman rooms karena sekarang menempel di atas hero (absolute)

  return (
    <div 
      className={`${isRoomsPage ? 'absolute' : 'relative'} top-0 left-0 right-0 z-50 w-full ${
        isTransparent 
          ? 'bg-transparent border-transparent' 
          : 'bg-background border-b border-border shadow-sm'
      }`}
    >
      <header className="w-full max-w-7xl mx-auto h-20 flex items-center justify-between px-6 lg:px-12">
        {/* Left: Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/logo.png" 
              alt="Logo SI" 
              className={`h-7 sm:h-8 md:h-9 w-auto object-contain transition-all drop-shadow-md`} 
            />
            <span className={`text-base sm:text-lg md:text-xl font-black tracking-tighter inline-block transition-colors ${
              isTransparent 
                ? 'text-white' 
                : 'bg-clip-text text-transparent bg-gradient-to-r from-[#5C634A] to-[#3A3F2F]'
            }`}>
              KampusConnect {isAdmin && <span className={`text-[10px] font-normal ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ${isTransparent ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>Admin</span>}
            </span>
          </Link>
        </div>

        {/* Right: Menus & Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {/* Menus */}
          <div className={`flex items-center ${isTransparent ? 'text-white' : 'text-foreground/80'}`}>
            <GooeyNav items={navItems} />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            {!user && (
              <Link 
                href="/login" 
                className={`inline-flex h-10 items-center justify-center rounded-full px-8 text-sm font-bold shadow-sm transition-colors ${
                  isTransparent 
                    ? 'bg-white text-primary hover:bg-white/90' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                Masuk
              </Link>
            )}

            {user && (
              <div className={`flex items-center gap-4 ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                <span className="text-sm font-semibold tracking-wide">Halo, {user.name}</span>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden flex items-center gap-2 ${isTransparent ? 'text-white' : ''}`}>
          <MobileNavClient navItems={navItems} isLoggedIn={!!user} user={user} />
        </div>
      </header>
    </div>
  );
}
