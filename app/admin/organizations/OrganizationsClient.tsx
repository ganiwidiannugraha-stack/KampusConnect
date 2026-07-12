'use client';

import { useState } from 'react';
import { deleteOrganization } from './actions';
import { toast } from 'sonner';
import { OrganizationModal } from './OrganizationModal';

export function OrganizationsClient({ organizations }: { organizations: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const filteredOrgs = organizations.filter(org => {
    if (searchQuery.trim() !== '') {
      if (!org.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrgs = filteredOrgs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleAdd = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (org: any) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus organisasi ini? Semua pengguna yang terkait mungkin akan kehilangan data organisasi mereka.')) return;
    
    setIsDeleting(id);
    const result = await deleteOrganization(id);
    if (result.success) {
      toast.success('Organisasi berhasil dihapus');
    } else {
      toast.error(result.message);
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Cari organisasi..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <button 
              onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              className="px-3 py-2.5 border border-border bg-card rounded-xl text-xs font-semibold hover:bg-muted flex items-center gap-2 whitespace-nowrap text-foreground min-h-[42px]"
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
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 shrink-0 min-h-[42px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Tambah Organisasi
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Nama Organisasi</th>
                <th className="px-6 py-4">Dibuat Pada</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedOrgs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Belum ada data organisasi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{org.name}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {new Date(org.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(org)}
                          className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg hover:border-primary transition-colors"
                          title="Edit Organisasi"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(org.id)}
                          disabled={isDeleting === org.id}
                          className="p-2 text-muted-foreground hover:text-red-500 bg-background border border-border rounded-lg hover:border-red-500 transition-colors disabled:opacity-50"
                          title="Hapus Organisasi"
                        >
                          {isDeleting === org.id ? (
                            <svg className="animate-spin h-[18px] w-[18px] text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{paginatedOrgs.length > 0 ? (safePage - 1) * pageSize + 1 : 0}</span> - <span className="font-bold text-foreground">{Math.min(safePage * pageSize, filteredOrgs.length)}</span> dari <span className="font-bold text-foreground">{filteredOrgs.length}</span> organisasi
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 border border-border rounded bg-background hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="text-xs font-bold text-foreground px-2">
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

      <OrganizationModal 
        org={editingOrg} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
