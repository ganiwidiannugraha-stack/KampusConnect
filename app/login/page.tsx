import { LoginForm } from './LoginForm';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

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
    <main className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Side: Hero Image */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden group">
        <Image 
          alt="Campus Resources" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
          fill
          priority
        />
        {/* Semi-transparent dark sage green overlay */}
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 h-full text-white max-w-2xl">
          <h1 className="font-extrabold text-5xl leading-tight mb-6 tracking-tight">
            Connect to Your <br/><span className="text-accent">Campus Resources.</span>
          </h1>
          <p className="text-lg text-white/90 leading-relaxed mb-10 max-w-lg">
             Seamlessly access facilities, book study spaces, and manage your campus life with KampusConnect. Experience a smarter, more connected university ecosystem tailored just for you.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-8 sm:p-12 h-full relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center lg:text-left mb-10">
            <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>
          <LoginForm />
        </div>
        
        {/* Footer info in login */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} KampusConnect University Facilities
            </p>
        </div>
      </section>
    </main>
  );
}
