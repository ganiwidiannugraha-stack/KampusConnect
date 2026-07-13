import Link from 'next/link';
import { cookies } from 'next/headers';
import FallingRain from '@/components/FallingRain';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('supabase-session')?.value;
  const isLoggedIn = !!sessionToken;

  return (
    <div className="relative overflow-hidden font-sans flex flex-col">
      {/* Background Rain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <FallingRain count={2} />
      </div>

      {/* === SECTION 1: HERO === */}
      <section className="relative z-10 h-[calc(100dvh-4rem)] flex flex-col justify-between pt-8 pb-4">
        
        {/* Hero Text */}
        <div className="relative z-10 w-full pt-4 md:pt-8 lg:pt-12 text-center flex flex-col items-center justify-center px-4 shrink-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-sans), serif' }}>
            KampusConnect
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/90 max-w-2xl font-medium drop-shadow-md">
            Temukan pengalaman reservasi ruang kampus terbaik. Bebas bentrok, dan terintegrasi penuh dalam satu genggaman.
          </p>
        </div>

        {/* Floating Booking Bar */}
        <div className="relative w-[90%] max-w-4xl mx-auto my-auto z-20 shrink-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] h-[150px] md:h-[250px] bg-primary/40 dark:bg-primary/20 rounded-[100%] blur-[80px] pointer-events-none -z-10 -translate-y-1/2" />

          <div className="absolute bottom-full left-0 right-0 h-[100vh] pointer-events-none z-0">
            <FallingRain count={4} />
          </div>

          <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden z-10">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-24 bg-primary/5 blur-3xl pointer-events-none"></div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full text-foreground text-center md:text-left">
              <div className="flex flex-col md:border-r border-border/30 pr-0 md:pr-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1">Katalog Fasilitas</span>
                <span className="text-base md:text-lg font-bold">20+ Ruangan Aktif</span>
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

        {/* Bottom Stats */}
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
      </section>

      {/* === SECTION 2: CARA RESERVASI === */}
      <section className="relative z-10 py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Cara Reservasi</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">Tiga langkah mudah untuk memesan ruangan kampus favorit Anda.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-black">1</div>
            <h3 className="font-bold text-lg text-foreground mb-2">Login Akun</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Masuk menggunakan akun UKM atau Himpunan yang terdaftar di sistem kampus.</p>
          </div>
          {/* Step 2 */}
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-black">2</div>
            <h3 className="font-bold text-lg text-foreground mb-2">Pilih Ruangan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Jelajahi katalog ruangan, cek jadwal ketersediaan, lalu ajukan reservasi dengan mudah.</p>
          </div>
          {/* Step 3 */}
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-black">3</div>
            <h3 className="font-bold text-lg text-foreground mb-2">Tunggu Persetujuan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Admin kampus akan memproses pengajuan Anda. Pantau status melalui halaman riwayat.</p>
          </div>
        </div>
      </section>

      {/* === SECTION 3: KEUNGGULAN SISTEM === */}
      <section className="relative z-10 py-20 px-6 lg:px-12 border-t border-border/30">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Mengapa KampusConnect?</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">Dirancang khusus untuk kebutuhan organisasi kampus modern.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Anti-Bentrok</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Sistem otomatis mendeteksi konflik jadwal sehingga tidak ada dua kegiatan di waktu yang sama.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Transparan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Semua status reservasi bisa dipantau secara real-time oleh pemohon dan administrator.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Real-time</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Data jadwal dan ketersediaan selalu sinkron. Tidak ada delay informasi antar pengguna.</p>
          </div>
          {/* Feature 4 */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Aman & Mudah</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Autentikasi ketat dengan role-based access. Antarmuka sederhana untuk semua kalangan.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
