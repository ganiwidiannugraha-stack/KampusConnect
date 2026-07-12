'use client';

import { useState, useEffect, useRef } from 'react';
import BookingModalClient from './BookingModalClient';
import RoomCalendarModal from './RoomCalendarModal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Users, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800", // Auditorium
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", // Seminar room
  "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800", // Lab
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800", // Meeting room
];

type RoomsClientProps = {
  rooms: any[];
};

export default function RoomsClient({ rooms }: { rooms: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('Kapasitas Terbesar');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);


  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // set initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const actualViewMode = (mounted && isMobile) ? 'grid' : viewMode;
  const itemsPerPage = actualViewMode === 'grid' ? ((mounted && isMobile) ? 10 : 9) : 10;

  // reset page ketika ada perubahan filter atau tampilan
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, capacityFilter, dateFilter, sortBy, actualViewMode, selectedLocations, selectedFacilities, selectedTypes]);

  const toggleSelection = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter(i => i !== value));
    else setList([...list, value]);
  };

  // Menghitung jumlah riil untuk setiap filter lokasi dan tipe
  const counts = {
    location: {
      "Gedung Pusat Kegiatan Kampus": 0,
      "Gedung Kuliah Umum": 0,
      "Gedung Olahraga (GOR)": 0,
    },
    type: {
      "Sekretariat / Rapat": 0,
      "Ruang Kelas": 0,
      "Aula / Auditorium": 0,
    }
  };

  rooms.forEach(room => {
    // Hitung Lokasi
    const loc = room.location || "Gedung Pusat Kegiatan Kampus";
    if (loc in counts.location) {
      counts.location[loc as keyof typeof counts.location]++;
    } else {
      counts.location["Gedung Pusat Kegiatan Kampus"]++;
    }

    // Hitung Tipe
    const roomName = (room.name || "").toLowerCase();
    const isRapat = roomName.includes("rapat") || roomName.includes("sekretariat") || roomName.includes("meeting");
    const isKelas = roomName.includes("kelas") || roomName.includes("ruang");
    const isAula = roomName.includes("aula") || roomName.includes("auditorium") || roomName.includes("balai");
    
    if (isRapat) counts.type["Sekretariat / Rapat"]++;
    if (isKelas) counts.type["Ruang Kelas"]++;
    if (isAula) counts.type["Aula / Auditorium"]++;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        // Toleransi <= 1 untuk mengantisipasi nilai desimal pada scroll
        const { top } = filterRef.current.getBoundingClientRect();
        setIsSticky(top <= 1);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logika Filter
  const filteredRooms = rooms.filter(room => {
    // 1. Pencarian Teks
    const query = searchQuery.toLowerCase();
    const matchName = room.name.toLowerCase().includes(query);
    const matchFacilities = room.facilities?.toLowerCase().includes(query) || false;
    if (searchQuery && !matchName && !matchFacilities) return false;

    // 2. Filter Kapasitas
    if (capacityFilter !== 'ALL') {
      const cap = room.capacity || 0;
      if (capacityFilter === '<100' && cap >= 100) return false;
      if (capacityFilter === '100-500' && (cap < 100 || cap > 500)) return false;
      if (capacityFilter === '500-1000' && (cap < 500 || cap > 1000)) return false;
      if (capacityFilter === '>1000' && cap <= 1000) return false;
    }

    // 3. Filter Lokasi
    const roomLoc = room.location || "Gedung Pusat Kegiatan Kampus";
    if (selectedLocations.length > 0 && !selectedLocations.includes(roomLoc)) {
      return false;
    }

    // 4. Filter Fasilitas (Semua yang dipilih harus ada)
    if (selectedFacilities.length > 0) {
      const roomFacs = (room.facilities || "").toLowerCase();
      const hasAll = selectedFacilities.every(f => {
         if (f === "AC / Pendingin Ruangan") return roomFacs.includes("ac");
         if (f === "Proyektor & Layar") return roomFacs.includes("proyektor") || roomFacs.includes("layar");
         if (f === "Sound System / Mic") return roomFacs.includes("sound") || roomFacs.includes("audio") || roomFacs.includes("mic");
         if (f === "Panggung Kecil") return roomFacs.includes("panggung") || roomFacs.includes("podium");
         return roomFacs.includes(f.toLowerCase());
      });
      if (!hasAll) return false;
    }

    // 5. Filter Tipe Ruangan (Cocokkan dengan nama)
    if (selectedTypes.length > 0) {
      const roomName = (room.name || "").toLowerCase();
      const matchType = selectedTypes.some(t => {
         if (t === "Sekretariat / Rapat") return roomName.includes("rapat") || roomName.includes("sekretariat") || roomName.includes("meeting");
         if (t === "Ruang Kelas") return roomName.includes("kelas") || roomName.includes("ruang");
         if (t === "Aula / Auditorium") return roomName.includes("aula") || roomName.includes("auditorium") || roomName.includes("balai");
         return false;
      });
      if (!matchType) return false;
    }

    return true;
  });

  // Logika Sorting
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'Kapasitas Terbesar') {
      return (b.capacity || 0) - (a.capacity || 0);
    } else if (sortBy === 'Kapasitas Terkecil') {
      return (a.capacity || 0) - (b.capacity || 0);
    } else if (sortBy === 'Nama (A-Z)') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedRooms.length / itemsPerPage);
  const paginatedRooms = sortedRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <div className="relative h-[380px] md:h-[430px] lg:h-[450px] w-full bg-slate-900 overflow-hidden">
        {/* Placeholder Hero Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-10 md:pt-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 drop-shadow-lg tracking-tight">
            Katalog Ruangan Kampus
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md font-medium">
            Temukan dan pesan fasilitas terbaik untuk setiap kegiatan akademik maupun organisasi Anda.
          </p>
        </div>
      </div>

      {/* ANCHOR UNTUK SCROLL */}
      <div id="filter-anchor" className="w-full h-0 invisible" />

      {/* FILTER SECTION (OVERLAPPING HERO & STICKY) */}
      <div 
        ref={filterRef}
        className="sticky top-0 z-40 w-full -mt-16 flex justify-center"
      >
        {/* THE ANIMATING BACKGROUND BOX */}
        <div 
          className={`transition-all duration-300 ease-out flex justify-center ${
            isSticky 
              ? 'w-[100vw] max-w-[100vw] rounded-none border-b border-border bg-background/95 backdrop-blur-md shadow-sm' 
              : 'w-[calc(100%-3rem)] lg:w-[calc(100%-6rem)] max-w-[1184px] rounded-2xl border border-border bg-card shadow-xl'
          }`}
        >
          {/* THE CONTENT WRAPPER */}
          <div 
            className={`w-full max-w-7xl transition-all duration-300 ease-out flex flex-col md:flex-row items-end ${
              isSticky 
                ? 'px-6 lg:px-12 py-3 md:py-4 gap-3' 
                : 'px-4 md:px-5 py-4 md:py-5 gap-4'
            }`}
          >
            {/* Search */}
            <div className="w-full md:flex-1 space-y-1.5">
              <label 
                className={`text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 block transition-all duration-300 ease-in-out overflow-hidden ${
                  isSticky ? 'max-h-0 opacity-0 m-0' : 'max-h-10 opacity-100'
                }`}
              >
                Cari Ruangan
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  placeholder="Ketik nama atau fasilitas..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ease-in-out text-sm font-medium ${isSticky ? 'py-2.5' : 'py-3'}`}
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="hidden md:block w-full md:w-48 space-y-1.5">
              <label 
                className={`text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 block transition-all duration-300 ease-in-out overflow-hidden ${
                  isSticky ? 'max-h-0 opacity-0 m-0' : 'max-h-10 opacity-100'
                }`}
              >
                Kapasitas
              </label>
              <select 
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className={`w-full px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ease-in-out text-sm font-medium appearance-none cursor-pointer ${isSticky ? 'py-2.5' : 'py-3'}`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="ALL">Semua Kapasitas</option>
                <option value="<100">Kecil (&lt; 100)</option>
                <option value="100-500">Menengah (100 - 500)</option>
                <option value="500-1000">Besar (500 - 1000)</option>
                <option value=">1000">Aula/Gedung (&gt; 1000)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-56 space-y-1.5">
              <label 
                className={`text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 block transition-all duration-300 ease-in-out overflow-hidden ${
                  isSticky ? 'max-h-0 opacity-0 m-0' : 'max-h-10 opacity-100'
                }`}
              >
                Cek Jadwal Tanggal
              </label>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`w-full px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ease-in-out text-sm font-medium ${isSticky ? 'py-2.5' : 'py-3'}`}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              {/* Search Button (Styling) */}
              <button 
                className={`flex-1 md:flex-none px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${isSticky ? 'py-2.5' : 'py-3'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Cari
              </button>

              {/* Reset Button (only show if any filter is active) */}
              {(searchQuery || capacityFilter !== 'ALL' || dateFilter) && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCapacityFilter('ALL');
                    setDateFilter('');
                  }}
                  className={`px-4 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out text-sm font-bold flex items-center justify-center ${isSticky ? 'py-2.5' : 'py-3'}`}
                  title="Reset Filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 pt-8 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR (Kiri) */}
        <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-5">
           {/* Banner SOP */}
           <div className="bg-primary text-white rounded-xl p-5 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg mb-1">Panduan Reservasi</h3>
               <p className="text-sm text-primary-foreground/80 mb-3 leading-relaxed">Baca SOP Peminjaman Fasilitas Kampus untuk UKM/Himpunan.</p>
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="text-xs font-bold bg-primary-foreground text-primary px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity">
                     Baca Aturan
                   </button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-md">
                   <div className="p-4">
                     <h3 className="font-bold text-lg mb-3">SOP Peminjaman Ruangan</h3>
                     <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                       <li>Peminjam harus merupakan anggota UKM/Himpunan resmi.</li>
                       <li>Reservasi dilakukan maksimal H-3 sebelum pelaksanaan kegiatan.</li>
                       <li>Ruangan wajib dikembalikan dalam keadaan bersih dan rapi.</li>
                       <li>Kerusakan fasilitas menjadi tanggung jawab organisasi peminjam.</li>
                       <li>Pihak kampus berhak membatalkan sepihak jika ada acara darurat universitas.</li>
                     </ul>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
             {/* Icon Hiasan */}
             <svg className="absolute -bottom-4 -right-4 w-24 h-24 text-black opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.83l6.58 13.17H5.42L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
           </div>
           
           {/* Peta Kampus */}
           <a 
             href="https://maps.google.com/?q=J6XC+7Q8,+Jl.+Peta+No.177,+Kahuripan,+Kec.+Tawang,+Kab.+Tasikmalaya,+Jawa+Barat+46115"
             target="_blank"
             rel="noopener noreferrer"
             className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
           >
              <svg className="w-6 h-6 text-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="text-sm font-bold text-primary-foreground">Lihat Peta Kampus</span>
           </a>

           {/* Filter Lokasi Gedung (Dummy) */}
           <div className="border border-border rounded-xl bg-card overflow-hidden mt-2">
              <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
                 <h4 className="font-bold text-sm">Lokasi Gedung</h4>
              </div>
              <div className="p-4 space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedLocations.includes("Gedung Pusat Kegiatan Kampus")} onChange={() => toggleSelection(selectedLocations, setSelectedLocations, "Gedung Pusat Kegiatan Kampus")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium flex-1">Gedung Pusat Kegiatan Kampus</span>
                   <span className="text-xs text-muted-foreground">{counts.location["Gedung Pusat Kegiatan Kampus"]}</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedLocations.includes("Gedung Kuliah Umum")} onChange={() => toggleSelection(selectedLocations, setSelectedLocations, "Gedung Kuliah Umum")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium flex-1">Gedung Kuliah Umum</span>
                   <span className="text-xs text-muted-foreground">{counts.location["Gedung Kuliah Umum"]}</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedLocations.includes("Gedung Olahraga (GOR)")} onChange={() => toggleSelection(selectedLocations, setSelectedLocations, "Gedung Olahraga (GOR)")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium flex-1">Gedung Olahraga (GOR)</span>
                   <span className="text-xs text-muted-foreground">{counts.location["Gedung Olahraga (GOR)"]}</span>
                 </label>
              </div>
           </div>

           {/* Filter Fasilitas (Dummy) */}
           <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
                 <h4 className="font-bold text-sm">Fasilitas Ruangan</h4>
              </div>
              <div className="p-4 space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedFacilities.includes("AC / Pendingin Ruangan")} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, "AC / Pendingin Ruangan")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium">AC / Pendingin Ruangan</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedFacilities.includes("Proyektor & Layar")} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, "Proyektor & Layar")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium">Proyektor & Layar</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedFacilities.includes("Sound System / Mic")} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, "Sound System / Mic")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium">Sound System / Mic</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedFacilities.includes("Panggung Kecil")} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, "Panggung Kecil")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium">Panggung Kecil</span>
                 </label>
              </div>
           </div>

           {/* Filter Tipe Ruang (Dummy) */}
           <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
                 <h4 className="font-bold text-sm">Tipe Ruangan</h4>
              </div>
              <div className="p-4 space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedTypes.includes("Sekretariat / Rapat")} onChange={() => toggleSelection(selectedTypes, setSelectedTypes, "Sekretariat / Rapat")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground flex-1 font-medium">Sekretariat / Rapat</span>
                   <span className="text-xs text-muted-foreground">{counts.type["Sekretariat / Rapat"]}</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedTypes.includes("Ruang Kelas")} onChange={() => toggleSelection(selectedTypes, setSelectedTypes, "Ruang Kelas")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground flex-1 font-medium">Ruang Kelas</span>
                   <span className="text-xs text-muted-foreground">{counts.type["Ruang Kelas"]}</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={selectedTypes.includes("Aula / Auditorium")} onChange={() => toggleSelection(selectedTypes, setSelectedTypes, "Aula / Auditorium")} className="w-4 h-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/50" />
                   <span className="text-sm text-foreground/80 group-hover:text-foreground flex-1 font-medium">Aula / Auditorium</span>
                   <span className="text-xs text-muted-foreground">{counts.type["Aula / Auditorium"]}</span>
                 </label>
              </div>
           </div>
        </div>

        {/* KONTEN UTAMA (Kanan) */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Header Daftar */}
          <div className="hidden sm:flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
              <div className="text-sm text-primary-foreground font-semibold mb-1 hover:underline cursor-pointer">
                Beranda / <b>Katalog Ruang Organisasi</b>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Katalog Ruangan Kampus</h2>
              <p className="text-sm text-muted-foreground mt-1">Cek fasilitas dan jadwal untuk kegiatan UKM/Himpunan Anda.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                 <span className="text-sm text-muted-foreground font-medium hidden sm:inline">Urutkan:</span>
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="text-sm font-semibold border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary/50">
                   <option value="Kapasitas Terbesar">Kapasitas Terbesar</option>
                   <option value="Kapasitas Terkecil">Kapasitas Terkecil</option>
                   <option value="Nama (A-Z)">Nama (A-Z)</option>
                 </select>
              </div>

              {/* View Mode Toggle (Hidden on Mobile) */}
              <div className="hidden md:flex bg-muted/30 border border-border rounded-xl p-1 shrink-0 h-[42px] items-center">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                  title="Grid View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                  title="List View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* BANNER PANDUAN RESERVASI - MOBILE ONLY */}
          <div className="lg:hidden mb-5">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4 hover:bg-primary/20 transition-colors text-left">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground">Panduan Reservasi</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">Baca SOP Peminjaman Fasilitas Kampus</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3">SOP Peminjaman Ruangan</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>Peminjam harus merupakan anggota UKM/Himpunan resmi.</li>
                    <li>Reservasi dilakukan maksimal H-3 sebelum pelaksanaan kegiatan.</li>
                    <li>Ruangan wajib dikembalikan dalam keadaan bersih dan rapi.</li>
                    <li>Kerusakan fasilitas menjadi tanggung jawab organisasi peminjam.</li>
                    <li>Pihak kampus berhak membatalkan sepihak jika ada acara darurat universitas.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sortedRooms.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold mb-2">Tidak ada data ruangan</h3>
              <p className="text-muted-foreground">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
            </div>
          ) : (
            <>
              <div 
                key={`${actualViewMode}-${currentPage}-${sortBy}-${searchQuery}-${capacityFilter}-${dateFilter}-${selectedFacilities.join()}-${selectedTypes.join()}`}
                className={`animate-fade-in-up ${actualViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-5"}`}
              >
                {paginatedRooms.map((room: any, index: number) => {
                  const bgImg = (room.images && room.images.length > 0) 
                    ? room.images[0] 
                    : ROOM_IMAGES[index % ROOM_IMAGES.length];
                  
                  const today = new Date().toISOString().split('T')[0];
                  let displayBookings = (room.bookings || [])
                    .filter((b: any) => b.date >= today)
                    .sort((a: any, b: any) => {
                      if (a.date !== b.date) return a.date.localeCompare(b.date);
                      return (a.startTime || '').localeCompare(b.startTime || '');
                    });

                  if (dateFilter) {
                    displayBookings = displayBookings.filter((b: any) => b.date === dateFilter);
                  }

                  const galleryImages = (room.images && room.images.length > 1) 
                    ? room.images 
                    : [bgImg, ROOM_IMAGES[(index+1)%4], ROOM_IMAGES[(index+2)%4]];
                  
                  if (actualViewMode === 'grid') {
                    return (
                      <div key={room.id} className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                        
                        {/* Gambar (Atas) */}
                        <div className="relative w-full bg-muted flex-shrink-0 group/image">
                          <Carousel className="w-full group/carousel" opts={{ loop: true }}>
                            <CarouselContent className="ml-0 touch-pan-y">
                              {galleryImages.map((img: string, i: number) => (
                                <CarouselItem key={i} className="pl-0">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="w-full aspect-[4/3] relative cursor-pointer group/hover">
                                        <div 
                                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/hover:scale-105"
                                          style={{ backgroundImage: `url('${img}')` }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover/hover:opacity-100 bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-opacity">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                            </span>
                                        </div>
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none [&>button]:fixed [&>button]:top-4 [&>button]:right-4 [&>button]:!bg-black/50 md:[&>button]:!bg-white/20 [&>button]:hover:!bg-white/40 [&>button]:!text-white [&>button]:!rounded-full [&>button]:!w-10 [&>button]:!h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:z-50" aria-describedby={undefined}>
                                      <Carousel className="w-full" opts={{ loop: true, startIndex: i }}>
                                        <CarouselContent>
                                          {galleryImages.map((gImg: string, j: number) => (
                                            <CarouselItem key={j} className="flex justify-center items-center">
                                              <img src={gImg} alt={`${room.name} ${j+1}`} className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                                            </CarouselItem>
                                          ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 text-white border-none w-10 h-10" />
                                        <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 text-white border-none w-10 h-10" />
                                      </Carousel>
                                    </DialogContent>
                                  </Dialog>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-20">
                               {galleryImages.map((_: string, i: number) => (
                                   <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm"></div>
                               ))}
                            </div>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity w-8 h-8 bg-white/70 text-black border-none z-20" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity w-8 h-8 bg-white/70 text-black border-none z-20" />
                          </Carousel>

                          {/* Gradient Overlay for Title & Tags */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col justify-end pt-12 pointer-events-none">
                            <h2 className="text-lg md:text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-md mb-2">{room.name}</h2>
                            <div className="flex flex-wrap gap-1.5">
                               <span className="bg-white/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1 border border-white/50 shadow-sm"><Users className="w-3.5 h-3.5" /> {room.capacity}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Konten (Bawah) Traveloka Style */}
                        <div className="p-4 flex flex-col flex-1 bg-card">
                          
                          {/* Lokasi */}
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                             <MapPin className="w-4 h-4 shrink-0" />
                             <span className="text-[13px] truncate font-medium">{room.location || "Gedung Pusat Kegiatan Kampus"}</span>
                          </div>

                          {/* Fasilitas Chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                             {(room.facilities || '').split(',').slice(0,3).map((fac: string, idx: number) => {
                                 const f = fac.trim();
                                 if (!f) return null;
                                 return <span key={idx} className="bg-muted border border-border px-2 py-0.5 rounded-full text-[11px] font-semibold text-foreground/80">{f}</span>
                             })}
                          </div>
                          
                          {/* Info Ketersediaan & Tombol */}
                          <div className="mt-auto border-t border-dashed border-border/60 pt-3 flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0 pr-2 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {displayBookings.length === 0 ? (
                                     <span className="text-green-600 font-bold text-[13px] flex items-center gap-1">
                                       <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Tersedia Hari Ini</span>
                                     </span>
                                  ) : (
                                     <div className="text-[12px] text-muted-foreground italic line-clamp-1">
                                       "{displayBookings.length} antrean di jadwal mendatang..."
                                     </div>
                                  )}
                                </div>
                                <RoomCalendarModal 
                                  room={room} 
                                  iconOnly={true}
                                  triggerClassName="flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground p-2 rounded-xl border border-border/80 shadow-sm shrink-0 transition-colors" 
                                />
                              </div>
                              <div className="shrink-0 flex flex-col items-end">
                                 <BookingModalClient room={{ id: room.id, name: room.name, capacity: room.capacity, images: room.images }} />
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
  
                  // LIST VIEW
                  return (
                    <div key={room.id} className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row group h-full">
                      
                      {/* Gambar (Kiri) */}
                      <div className="md:w-[280px] relative w-full p-3 flex-shrink-0 group/image">
                        <div className="w-full h-56 md:h-full relative overflow-hidden rounded-xl bg-muted">
                          <Carousel className="w-full group/carousel" opts={{ loop: true }}>
                            <CarouselContent className="ml-0 touch-pan-y h-full">
                            {galleryImages.map((img: string, i: number) => (
                              <CarouselItem key={i} className="pl-0">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="w-full h-56 md:h-[224px] relative cursor-pointer group/hover">
                                      <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/hover:scale-105"
                                        style={{ backgroundImage: `url('${img}')` }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover/hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <span className="opacity-0 group-hover/hover:opacity-100 bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-opacity">
                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                          </span>
                                      </div>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none [&>button]:fixed [&>button]:top-4 [&>button]:right-4 [&>button]:!bg-black/50 md:[&>button]:!bg-white/20 [&>button]:hover:!bg-white/40 [&>button]:!text-white [&>button]:!rounded-full [&>button]:!w-10 [&>button]:!h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:z-50" aria-describedby={undefined}>
                                    <Carousel className="w-full" opts={{ loop: true, startIndex: i }}>
                                      <CarouselContent>
                                        {galleryImages.map((gImg: string, j: number) => (
                                          <CarouselItem key={j} className="flex justify-center items-center">
                                            <img src={gImg} alt={`${room.name} ${j+1}`} className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                                          </CarouselItem>
                                        ))}
                                      </CarouselContent>
                                      <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 text-white border-none w-10 h-10" />
                                      <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 text-white border-none w-10 h-10" />
                                    </Carousel>
                                  </DialogContent>
                                </Dialog>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-20">
                            {galleryImages.map((_: string, i: number) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm"></div>
                            ))}
                          </div>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity w-8 h-8 bg-white/70 text-black border-none" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity w-8 h-8 bg-white/70 text-black border-none" />
                        </Carousel>
                        </div>
                      </div>
  
                      {/* Informasi (Tengah) */}
                    <div className="py-4 md:py-5 pr-4 md:pr-5 pl-2 flex-1 flex flex-col justify-start min-w-0">
                          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">{room.name}</h2>
                          
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-3">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{room.location || "Gedung Pusat Kegiatan Kampus"}</span>
                          </div>
  
                          <div className="mb-4">
                             <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                                 <Users className="w-3.5 h-3.5 shrink-0" />
                                 {room.capacity}
                             </span>
                          </div>
  
                          <hr className="border-t border-dashed border-border my-4" />
                          
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-[13px] text-slate-900 italic font-medium leading-relaxed flex-1">
                              {room.facilities}
                            </p>
                          </div>
                      </div>
                      
                      {/* Jadwal & Tombol (Kanan) */}
                      <div className="md:w-[230px] p-4 md:p-5 flex flex-col justify-between md:border-l border-t md:border-t-0 border-border">
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-[13px] font-medium text-slate-700">Jadwal Mendatang</h4>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${
                                  displayBookings.length === 0 
                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                                    : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                                }`}></span>
                            </div>
                            
                            <div className="mb-3">
                               <RoomCalendarModal room={room} triggerClassName="flex w-full justify-center items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-foreground rounded-md text-xs font-bold transition-colors border border-primary/20 shadow-sm" />
                            </div>
                            
                            <div className="space-y-2 mb-5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                {displayBookings.length > 0 ? (
                                  displayBookings.map((booking: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center bg-muted/50 border border-border/50 rounded-md px-2 py-1.5 text-[11px] font-mono shadow-sm">
                                        <span className="text-foreground font-bold">{booking.date}</span>
                                        <span className="text-foreground font-bold">{booking.startTime} - {booking.endTime || 'Selesai'}</span>
                                      </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between items-center bg-green-50/50 border border-green-200/50 rounded-lg px-3 py-2 text-xs font-mono">
                                      <span className="text-green-700 font-medium">Kosong & Tersedia</span>
                                  </div>
                                )}
                            </div>
                          </div>
                          
                          <div className="w-full mt-auto">
                            <BookingModalClient room={{ id: room.id, name: room.name, capacity: room.capacity, images: room.images }} />
                          </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-3 items-center">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    document.getElementById('filter-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-xl bg-card hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1 items-center px-2">
                  <span className="text-base font-bold text-foreground">
                    {currentPage} <span className="text-muted-foreground font-medium mx-1">/</span> {totalPages}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    document.getElementById('filter-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-xl bg-card hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
                  aria-label="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            </>
          )}
        </div>

    </div>
    
      {/* BOTTOM ACTION BAR (MOBILE ONLY) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[60] flex items-stretch h-16 pb-safe">
        <button onClick={() => setFilterSheetOpen(true)} className="flex-1 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span className="text-[11px] font-bold">Filter</span>
        </button>
        <div className="w-[1px] my-3 bg-border"></div>
        <button onClick={() => setSortSheetOpen(true)} className="flex-1 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/></svg>
          <span className="text-[11px] font-bold">Urutkan</span>
        </button>
        <div className="w-[1px] my-3 bg-border"></div>
        <button onClick={() => {
            const locSection = document.getElementById('map-location');
            if (locSection) locSection.scrollIntoView({behavior: 'smooth'});
        }} className="flex-1 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="text-[11px] font-bold">Area</span>
        </button>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      {filterSheetOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={() => setFilterSheetOpen(false)}></div>
          <div className="relative bg-background w-full rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-full flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-background z-10 rounded-t-2xl">
              <h3 className="font-bold text-lg">Filter Ruangan</h3>
              <button onClick={() => setFilterSheetOpen(false)} className="p-2 bg-muted rounded-full text-foreground hover:bg-muted/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex flex-col gap-6">
               {/* Capacity Mobile Filter */}
               <div>
                  <h4 className="font-bold text-sm mb-3">Kapasitas Ruangan</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['ALL', '<100', '100-500', '500-1000', '>1000'].map(val => {
                        const labels: Record<string, string> = {
                            'ALL': 'Semua', '<100': '< 100 org', '100-500': '100 - 500 org', '500-1000': '500 - 1000 org', '>1000': '> 1000 org'
                        };
                        return (
                            <button 
                                key={val}
                                onClick={() => setCapacityFilter(val)}
                                className={`py-2 px-3 rounded-lg text-sm font-semibold border ${capacityFilter === val ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-foreground hover:border-primary/50'}`}
                            >
                                {labels[val]}
                            </button>
                        )
                    })}
                  </div>
               </div>
               
               {/* Tipe Mobile Filter */}
               <div>
                  <h4 className="font-bold text-sm mb-3">Tipe Ruangan</h4>
                  <div className="flex flex-col gap-3">
                     {["Sekretariat / Rapat", "Ruang Kelas", "Aula / Auditorium"].map(t => (
                        <label key={t} className="flex items-center gap-3 p-1">
                           <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleSelection(selectedTypes, setSelectedTypes, t)} className="w-5 h-5 rounded border-border accent-primary" />
                           <span className="font-medium flex-1">{t}</span>
                        </label>
                     ))}
                  </div>
               </div>

               {/* Fasilitas Mobile Filter */}
               <div>
                  <h4 className="font-bold text-sm mb-3">Fasilitas Dasar</h4>
                  <div className="flex flex-col gap-3">
                     {["AC / Pendingin Ruangan", "Proyektor & Layar", "Sound System / Mic", "Panggung Kecil"].map(f => (
                        <label key={f} className="flex items-center gap-3 p-1">
                           <input type="checkbox" checked={selectedFacilities.includes(f)} onChange={() => toggleSelection(selectedFacilities, setSelectedFacilities, f)} className="w-5 h-5 rounded border-border accent-primary" />
                           <span className="font-medium flex-1">{f}</span>
                        </label>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-border bg-background flex gap-3">
              <button onClick={() => { setCapacityFilter('ALL'); setSelectedTypes([]); setSelectedFacilities([]); setSelectedLocations([]); }} className="px-4 py-3 rounded-xl font-bold border border-border flex-1 bg-card hover:bg-muted text-foreground">Reset</button>
              <button onClick={() => setFilterSheetOpen(false)} className="px-4 py-3 rounded-xl font-bold bg-primary text-primary-foreground flex-[2] hover:opacity-90 shadow-md">Terapkan</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SORT BOTTOM SHEET */}
      {sortSheetOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={() => setSortSheetOpen(false)}></div>
          <div className="relative bg-background w-full rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Urutkan Berdasarkan</h3>
              <button onClick={() => setSortSheetOpen(false)} className="p-2 bg-muted rounded-full text-foreground hover:bg-muted/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-2 flex flex-col">
              {['Kapasitas Terbesar', 'Kapasitas Terkecil', 'Nama (A-Z)'].map(val => (
                 <button 
                    key={val}
                    onClick={() => { setSortBy(val); setSortSheetOpen(false); }}
                    className={`w-full text-left p-4 font-bold text-base flex justify-between items-center ${sortBy === val ? 'text-primary' : 'text-foreground hover:bg-muted/50'} rounded-lg`}
                 >
                    {val}
                    {sortBy === val && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>}
                 </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
