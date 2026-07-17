'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPendingBookingsCount } from './actions';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | null;
  disabled?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function SidebarNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch pending count on mount
    getPendingBookingsCount().then(count => setPendingCount(count));
  }, [pathname]); // Refetch when navigation changes (could be after approval)

  const navGroups: NavGroup[] = [
    {
      title: 'Dashboards',
      items: [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
          ),
          badge: pendingCount > 0 ? pendingCount : null,
        },
        {
          name: 'Jadwal & Reservasi',
          href: '/admin/schedule',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
          ),
          badge: pendingCount > 0 ? pendingCount : null,
        }
      ]
    },
    {
      title: 'Master Data',
      items: [
        {
          name: 'Kelola Ruangan',
          href: '/admin/rooms',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" /><path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" /><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /></svg>
          ),
        },
        {
          name: 'Kelola Gedung',
          href: '/admin/buildings',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
          ),
        },
        {
          name: 'Kelola Fasilitas',
          href: '/admin/facilities',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ),
        },
        {
          name: 'Kelola Pengguna',
          href: '/admin/users',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          ),
        },
        {
          name: 'Log Aktivitas',
          href: '/admin/logs',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          ),
        },
        {
          name: 'Kelola Organisasi',
          href: '/admin/organizations',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M17 2v20" /><path d="M7 22V12" /><path d="M12 22V7" /><path d="M12 17h5" /><path d="M17 12h5" /><path d="M7 17h5" /><path d="M2 17h5" /><path d="M12 7h5" /></svg>
          ),
        },
        {
          name: 'Laporan Penggunaan',
          href: '/admin/reports',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
          ),
        }
      ]
    },
    {
      title: 'Akses Publik',
      items: [
        {
          name: 'Katalog Ruangan',
          href: '/rooms',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M9 22a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4z" /><path d="M19 10a2 2 0 0 0 2-2V2" /><path d="M13 22a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h4a2 2 0 0 0 2 2v7a2 2 0 0 0-2 2h-4z" /></svg>
          ),
        },
        {
          name: 'Reservasi Saya',
          href: '/my-bookings',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
          ),
        },
        {
          name: 'Bantuan / Petunjuk',
          href: '/admin/help',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          ),
        }
      ]
    }
  ];

  return (
    <nav className="space-y-6">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-2 overflow-hidden">
          <h3 className={`px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/70 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-[20px] opacity-100 mb-2'}`}>
            {group.title}
          </h3>
          <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {group.items.map((item, idx) => {
              const isActive = pathname === item.href;
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={idx}
                    className={`flex items-center py-2.5 text-muted-foreground font-semibold rounded-lg opacity-50 cursor-not-allowed transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    title="Fitur dalam tahap pengembangan"
                  >
                    <div className="flex items-center">
                      <div className={`transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</div>
                      <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>{item.name}</span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`relative flex items-center py-2.5 rounded-lg font-semibold transition-all duration-200 group ${isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    } ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}
                >
                  <div className="flex items-center overflow-hidden">
                    <div className={`shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'} ${isCollapsed ? '' : 'mr-3'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>{item.name}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`flex items-center justify-center rounded-full font-black ${isCollapsed
                        ? 'absolute top-1 right-1 h-4 w-4 p-0 text-[10px]'
                        : 'relative px-2 py-0.5 text-[10px]'
                      } ${isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary text-primary-foreground'
                      }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
