import Link from 'next/link';
import { cookies } from 'next/headers';
import FallingRain from '@/components/FallingRain';

export default async function Home() {
  const cookieStore = await cookies();
  const bypassRole = cookieStore.get('app-bypass-role')?.value;
  const sessionToken = cookieStore.get('keystonejs-session')?.value;
  const isLoggedIn = !!bypassRole || !!sessionToken;

  return (
    <div className="relative h-[calc(100dvh-4rem)] overflow-hidden font-sans flex flex-col">
      {/* Background Rain (falls all the way down) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <FallingRain count={2} />
      </div>

      <main className="relative z-10 w-full flex-1 flex flex-col justify-between pt-8 pb-4">

        {/* Top Content: Hero Text */}
        <div className="relative z-10 w-full pt-4 md:pt-8 lg:pt-12 text-center flex flex-col items-center justify-center px-4 shrink-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-sans), serif' }}>
            KampusConnect Luxury
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/90 max-w-2xl font-medium drop-shadow-md">
            Temukan pengalaman reservasi ruang kampus terbaik. bebas bentrok, dan terintegrasi penuh dalam satu genggaman.
          </p>
        </div>

        {/* Middle Content: Floating Booking Bar */}
        <div className="relative w-[90%] max-w-4xl mx-auto my-auto z-20 shrink-0">

          {/* Giant Cosmic Glow behind the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] h-[150px] md:h-[250px] bg-primary/40 dark:bg-primary/20 rounded-[100%] blur-[80px] pointer-events-none -z-10 -translate-y-1/2" />

          {/* Rain Area (Card only - splashes exactly on top of the card) */}
          <div className="absolute bottom-full left-0 right-0 h-[100vh] pointer-events-none z-0">
            <FallingRain count={4} />
          </div>

          <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden z-10">
            {/* Top Edge Glow (Efek Cahaya/Kaca) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent"></div>
            {/* Inner ambient glow */}
            <div className="absolute inset-x-0 top-0 h-24 bg-primary/5 blur-3xl pointer-events-none"></div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full text-foreground text-center md:text-left">
              <div className="flex flex-col md:border-r border-border/30 pr-0 md:pr-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1">Katalog Fasilitas</span>
                <span className="text-base md:text-lg font-bold">15+ Ruangan Aktif</span>
              </div>
              <div className="flex flex-col md:border-r border-border/30 px-0 md:px-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1">Status Sistem</span>
                <span className="text-base md:text-lg font-bold">Beroperasi 24/7</span>
              </div>
              <div className="hidden md:flex flex-col pl-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1">Jaminan</span>
                <span className="text-base md:text-lg font-bold">100% Anti-Bentrok</span>
              </div>
            </div>

            <div className="w-full md:w-auto mt-4 md:mt-0 flex-shrink-0 md:pl-6">
              {isLoggedIn ? (
                <Link
                  href="/rooms"
                  className="flex h-12 md:h-14 w-full items-center justify-center rounded-xl bg-foreground text-background px-8 text-sm font-bold shadow-lg hover:bg-foreground/90 transition-all hover:scale-105"
                >
                  Lihat Katalog
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex h-12 md:h-14 w-full items-center justify-center rounded-xl bg-foreground text-background px-8 text-sm font-bold shadow-lg hover:bg-foreground/90 transition-all hover:scale-105"
                >
                  Mulai Reservasi
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Content: Floating Stats */}
        <div className="relative z-10 w-full pt-6 px-8 lg:px-16 flex flex-col sm:flex-row justify-between items-end gap-4 text-foreground shrink-0">
          <div className="max-w-md hidden md:block">
            <p className="text-xs lg:text-sm text-foreground/80 font-medium leading-relaxed">
              Kami merangkul antusiasme setiap civitas akademika, memastikan semua orang memiliki kesempatan mengeksekusi acaranya dengan sempurna di kampus kita tercinta.
            </p>
          </div>

          <div className="flex gap-8 lg:gap-16 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col">
              <span className="text-2xl lg:text-4xl font-black">90+</span>
              <span className="text-[10px] lg:text-sm text-foreground/80 font-medium">Mahasiswa Aktif</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-4xl font-black">500+</span>
              <span className="text-[10px] lg:text-sm text-foreground/80 font-medium">Jam Reservasi</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-4xl font-black">15</span>
              <span className="text-[10px] lg:text-sm text-foreground/80 font-medium">Mitra Fakultas</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
