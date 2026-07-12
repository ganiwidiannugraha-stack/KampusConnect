import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './AdminLayoutClient';
import { getCurrentUser } from '@/app/actions/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || !user.role?.canAccessDashboard) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
