import { LoginForm } from './LoginForm';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role?.canAccessDashboard) {
      redirect('/admin');
    } else {
      redirect('/my-bookings');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-2 text-foreground">KampusConnect</h1>
          <p className="text-muted-foreground text-sm">Masuk untuk mengelola reservasi ruangan</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
