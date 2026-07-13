'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { MobileNavClient } from './MobileNavClient';

type NavbarClientProps = {
  user: any;
  isAdmin: boolean;
  navItems: { label: string; href: string; }[];
};

export function NavbarClient({ user, isAdmin, navItems }: NavbarClientProps) {
  const pathname = usePathname();
  const isRoomsPage = pathname === '/rooms';
  const isTransparent = isRoomsPage;

  return (
    <div 
      className={`${isRoomsPage ? 'absolute' : 'relative'} top-0 left-0 right-0 z-50 w-full ${
        isTransparent 
          ? 'bg-transparent border-transparent' 
          : 'bg-background border-b border-border shadow-sm'
      }`}
    >
      <header className="container mx-auto h-20 flex items-center justify-between px-4">
        {/* Left: Logo & Greeting */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/logo.png" 
              alt="Logo SI" 
              width="40" 
              height="40"
              fetchPriority="high"
              className={`h-7 sm:h-8 md:h-9 w-auto object-contain transition-all drop-shadow-md`} 
            />
            <span className={`text-base sm:text-lg md:text-xl font-black tracking-tighter inline-block transition-colors ${
              isTransparent 
                ? 'text-white' 
                : 'bg-clip-text text-transparent bg-gradient-to-r from-[#536e4b] to-[#3a4d34]'
            }`}>
              KampusConnect {isAdmin && <span className={`text-[10px] font-normal ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ${isTransparent ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>Admin</span>}
            </span>
          </Link>

          {user && (
            <div className={`hidden md:flex items-center ${isTransparent ? 'text-white/80' : 'text-zinc-500'}`}>
              <div className={`h-6 w-px mx-2 ${isTransparent ? 'bg-white/20' : 'bg-border'}`}></div>
              <span className="text-sm font-medium">
                Halo, <span className={`font-bold ${isTransparent ? 'text-white' : 'text-zinc-800'}`}>{user.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Menus & Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {/* Simple Animated Pill Nav */}
          <nav className={`flex items-center gap-1 ${isTransparent ? 'text-white' : 'text-zinc-600'}`}>
            {navItems.map((item, idx) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                    isActive 
                      ? (isTransparent ? 'text-primary bg-white shadow-sm' : 'bg-primary text-white shadow-md hover:-translate-y-0.5')
                      : (isTransparent ? 'hover:bg-white/20' : 'hover:bg-muted')
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center">
            {!user && (
              <Link 
                href="/login" 
                className={`inline-flex h-10 items-center justify-center rounded-full px-8 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${
                  isTransparent 
                    ? 'bg-white text-primary hover:bg-white/90' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                Masuk
              </Link>
            )}

            {user && (
              <LogoutButton />
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
