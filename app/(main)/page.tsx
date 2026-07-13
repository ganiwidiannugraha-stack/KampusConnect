import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { 
  ArrowRight, PlayCircle, CheckCircle2, 
  Search, Eye, RefreshCw, ShieldCheck, 
  Lock, Building, Calendar 
} from 'lucide-react';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('supabase-session')?.value;
  const isLoggedIn = !!sessionToken;

  return (
    <div className="font-sans text-zinc-800 bg-white antialiased overflow-x-hidden">
      
      {/* Hero Section */}
      <header className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden bg-white">
        {/* Abstract Decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 text-primary font-bold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sistem Reservasi Ruangan Modern
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-zinc-900 leading-[1.1] tracking-tight mb-6">
                Sederhanakan Reservasi Kampus. <span className="text-primary">Tingkatkan Produktivitas.</span>
              </h1>
              
              <p className="text-xl text-zinc-600 mb-10 leading-relaxed font-medium">
                Cara cerdas dan mulus bagi mahasiswa dan dosen untuk mereservasi ruang kuliah, ruang belajar, dan lab. Dirancang khusus untuk universitas modern.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isLoggedIn ? (
                  <Link href="/rooms" className="inline-flex justify-center items-center gap-2 bg-primary text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    Mulai Reservasi
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/login" className="inline-flex justify-center items-center gap-2 bg-primary text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                
                <Link href="#how-it-works" className="inline-flex justify-center items-center gap-2 bg-white text-primary border-2 border-primary font-bold text-lg px-8 py-4 rounded-full hover:bg-primary/5 transition-all">
                  Pelajari Lebih Lanjut
                  <PlayCircle className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6 text-sm font-bold text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Integrasi SSO
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Responsif Seluler
                </div>
              </div>
            </div>

            {/* Hero Imagery - Bento Style */}
            <div className="relative h-[600px] w-full hidden lg:block">
              {/* Main Image */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <Image 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Modern university study space"
                  fill
                  priority
                />
              </div>

              {/* Floating UI Card 1 */}
              <div className="absolute top-10 -left-12 bg-white/85 backdrop-blur-md border border-primary/10 p-4 rounded-2xl shadow-xl w-64 animate-[bounce_10s_ease-in-out_infinite]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Design Lab B</h4>
                    <p className="text-xs text-zinc-500 font-medium">Available Now</p>
                  </div>
                </div>
                <button className="w-full bg-accent/50 text-primary font-bold text-xs py-2 rounded-lg">Book Instantly</button>
              </div>

              {/* Floating UI Card 2 */}
              <div className="absolute bottom-20 -right-8 bg-white/85 backdrop-blur-md border border-primary/10 p-4 rounded-2xl shadow-xl w-56 animate-[bounce_12s_ease-in-out_infinite_reverse]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500">Jadwal Hari Ini</span>
                  <Calendar className="text-primary w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-zinc-700 font-bold">10:00 WIB</span>
                    <span className="text-zinc-500 truncate">Ruang Belajar 4</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    <span className="text-zinc-700 font-bold">14:30 WIB</span>
                    <span className="text-zinc-500 truncate">Aula Kuliah A</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section className="py-24 bg-muted/50 relative" id="how-it-works">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(rgba(83, 110, 75, 0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Alur Kerja</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-zinc-900 mb-6">Pesan Ruangan dalam Hitungan Detik</h3>
            <p className="text-lg text-zinc-600 font-medium">Tidak perlu lagi membuang waktu mencari ruang kosong atau berurusan dengan jadwal ganda. Proses efisien kami memastikan Anda mendapatkan ruangan dengan instan.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-zinc-100 group">
              <div className="w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-zinc-900">1. Cari</h4>
              <p className="text-zinc-600 font-medium leading-relaxed">Filter berdasarkan gedung, tipe ruangan, dan fasilitas. Temukan ruangan yang tepat untuk sesi studi atau perkuliahan Anda.</p>
            </div>
            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-zinc-100 group relative md:translate-y-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-zinc-900">2. Cek Jadwal</h4>
              <p className="text-zinc-600 font-medium leading-relaxed">Lihat ketersediaan real-time melalui jadwal visual yang intuitif. Pastikan ruangan sedang kosong tanpa harus menebak.</p>
            </div>
            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-zinc-100 group md:translate-y-16">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-zinc-900">3. Pesan</h4>
              <p className="text-zinc-600 font-medium leading-relaxed">Konfirmasi reservasi Anda secara instan hanya dengan satu klik. Dapatkan persetujuan dan notifikasi langsung.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white overflow-hidden" id="features">
        <div className="container mx-auto px-4">
          <div className="mb-20">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Kemampuan Platform</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-zinc-900 max-w-2xl">Dirancang untuk Skala Kampus</h3>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Large Feature */}
            <div className="lg:col-span-8 bg-muted/50 rounded-[2rem] p-8 md:p-12 border border-zinc-100 relative overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-6">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-zinc-900">Sinkronisasi Real-Time</h4>
                <p className="text-zinc-600 font-medium text-lg">Pembaruan jadwal instan yang terhubung antar perangkat. Tidak perlu khawatir dengan jadwal yang tidak mutakhir.</p>
              </div>
              {/* Decorative Graphic */}
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 translate-x-1/4 translate-y-1/4 bg-gradient-to-tl from-accent/40 to-transparent rounded-tl-[100px] transition-transform duration-700 group-hover:scale-105"></div>
            </div>
            
            {/* Feature Stack */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Feature 1 */}
              <div className="flex-1 bg-primary text-white rounded-[2rem] p-8 relative overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')]"></div>
                <div className="relative z-10">
                  <ShieldCheck className="text-accent w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Bebas Bentrok</h4>
                  <p className="text-white/90 font-medium text-sm">Sistem cerdas kami aktif mencegah bentrokan atau pemesanan ganda.</p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="flex-1 border border-zinc-200 rounded-[2rem] p-8 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-white">
                <Eye className="text-primary w-10 h-10 mb-4" />
                <h4 className="text-xl font-bold mb-2 text-zinc-900">Transparansi Penuh</h4>
                <p className="text-zinc-500 font-medium text-sm">Visibilitas jelas terkait status dan jadwal ruangan bagi seluruh civitas akademika.</p>
              </div>
            </div>
            
            {/* Full Width Feature */}
            <div className="lg:col-span-12 mt-4 bg-zinc-900 text-white rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full"></div>
              
              <div className="flex-1 relative z-10">
                <Lock className="text-accent w-10 h-10 mb-6" />
                <h4 className="text-3xl font-bold mb-4">Keamanan Tingkat Lanjut</h4>
                <p className="text-zinc-400 font-medium text-lg max-w-xl">Integrasi mulus dengan Single Sign-On (SSO) universitas, dilengkapi akses kontrol berlapis untuk dosen, staf, dan mahasiswa.</p>
              </div>
              
              <div className="flex-1 relative z-10 w-full">
                <div className="h-64 w-full bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <Image 
                    className="w-full h-full object-cover opacity-80 mix-blend-luminosity" 
                    src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Enterprise Security"
                    width={500}
                    height={300}
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

    </div>
  );
}
