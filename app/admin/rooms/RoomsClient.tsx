'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoomModal } from './RoomModal';
import { deleteRoom } from './actions';
import { ConfirmModal } from '@/components/ConfirmModal';

export function RoomsClient({ initialRooms, buildings, facilities }: { initialRooms: any[], buildings: any[], facilities: any[] }) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination & Filter States
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'TERSEDIA' | 'MAINTENANCE' | 'TIDAK AKTIF'>('SEMUA');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Deriving filtered & paginated data
  const filteredRooms = rooms.filter(r => {
    if (activeTab === 'TERSEDIA' && r.status !== 'Tersedia') return false;
    if (activeTab === 'MAINTENANCE' && r.status !== 'Maintenance') return false;
    if (activeTab === 'TIDAK AKTIF' && r.status !== 'Tidak Aktif') return false;
    
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!r.nama_ruangan?.toLowerCase().includes(q) && !r.gedung?.nama_gedung?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRooms = filteredRooms.slice((safePage - 1) * pageSize, safePage * pageSize);
  
  const handleAdd = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{id: string, name: string} | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = (id: string, name: string) => {
    setRoomToDelete({id, name});
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    setDeletingId(roomToDelete.id);
    setDeleteError('');
    setIsConfirmOpen(false);
    
    const res = await deleteRoom(roomToDelete.id, roomToDelete.name);
    if (res.success) {
      window.location.reload();
    } else {
      setDeleteError(res.message || 'Gagal menghapus ruangan');
    }
    setDeletingId(null);
    setRoomToDelete(null);
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        
        {/* TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Tabs */}
          <div className="bg-muted p-1 rounded-lg flex items-center overflow-x-auto whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => { setActiveTab('SEMUA'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'SEMUA' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => { setActiveTab('TERSEDIA'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'TERSEDIA' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Tersedia
            </button>
            <button 
              onClick={() => { setActiveTab('MAINTENANCE'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'MAINTENANCE' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Maintenance
            </button>
            <button 
              onClick={() => { setActiveTab('TIDAK AKTIF'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'TIDAK AKTIF' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Tidak Aktif
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari ruangan atau gedung..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary text-foreground h-full min-h-[32px]" 
            />
          </div>
        </div>

        {/* ADD BUTTON & PAGE SIZE */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="relative">
            <button 
              onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              className="px-3 py-2 border border-border bg-background rounded-lg text-xs font-semibold hover:bg-muted flex items-center gap-2 whitespace-nowrap text-foreground min-h-[32px]"
            >
              {pageSize} / Halaman
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isPageSizeOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {isPageSizeOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                {[5, 10, 15, 20].map((size) => (
                  <div 
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                      setIsPageSizeOpen(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 ${pageSize === size ? 'font-bold text-primary' : 'text-foreground'}`}
                  >
                    Tampilkan {size}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold shadow hover:-translate-y-0.5 transition-all flex items-center gap-2 min-h-[32px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Ruangan
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[13px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-bold">Ruangan</th>
                <th className="px-6 py-4 font-bold">Kapasitas</th>
                <th className="px-6 py-4 font-bold">Gedung & Lantai</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRooms.map((room) => (
                <tr key={room.id_ruangan} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {room.foto ? (
                        <img src={room.foto} alt={room.nama_ruangan} className="w-12 h-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-foreground text-base">{room.nama_ruangan}</span>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {room.ruangan_fasilitas?.map((rf: any) => rf.fasilitas?.nama_fasilitas).join(', ') || 'Belum ada fasilitas'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">
                    {room.kapasitas} Orang
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{room.gedung?.nama_gedung || '-'}</div>
                    <div className="text-xs text-muted-foreground">Lantai {room.lantai || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      room.status === 'Tersedia' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      room.status === 'Maintenance' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(room)}
                        className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg hover:border-primary transition-colors"
                        title="Edit"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id_ruangan, room.nama_ruangan)}
                        disabled={deletingId === room.id_ruangan}
                        className="p-2 text-muted-foreground hover:text-red-500 bg-background border border-border rounded-lg hover:border-red-500 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedRooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Tidak ada data ruangan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{paginatedRooms.length > 0 ? (safePage - 1) * pageSize + 1 : 0}</span> - <span className="font-bold text-foreground">{Math.min(safePage * pageSize, filteredRooms.length)}</span> dari <span className="font-bold text-foreground">{filteredRooms.length}</span> ruangan
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 border border-border rounded bg-background hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              <div className="px-3 py-1 text-xs font-bold text-foreground">
                {safePage} / {totalPages}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 border border-border rounded bg-background hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoomModal 
          room={editingRoom} 
          buildings={buildings}
          facilities={facilities}
          onClose={() => {
            setIsModalOpen(false);
            window.location.reload();
          }} 
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus Ruangan"
        message="Apakah Anda yakin ingin menghapus ruangan ini? Semua reservasi terkait mungkin ikut terpengaruh."
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setRoomToDelete(null);
        }}
      />

      {deleteError && (
        <ConfirmModal
          isOpen={true}
          title="Gagal Menghapus"
          message={deleteError}
          confirmText="Tutup"
          isDestructive={false}
          onConfirm={() => setDeleteError('')}
          onCancel={() => setDeleteError('')}
        />
      )}
    </>
  );
}
