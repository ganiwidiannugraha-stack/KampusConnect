import { getCurrentUser } from '@/app/actions/auth';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const user = await getCurrentUser();
  const isAdmin = user?.role?.canAccessDashboard ?? false;

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Katalog Ruang", href: "/rooms" },
  ];

  if (user) {
    navItems.push({ label: "Reservasi Saya", href: "/my-bookings" });
  }

  if (user && isAdmin) {
    navItems.push({ label: "Dashboard", href: "/admin" });
  }

  return <NavbarClient user={user} isAdmin={isAdmin} navItems={navItems} />;
}
