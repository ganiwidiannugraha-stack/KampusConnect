'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserModal } from './UserModal';
import { deleteUser } from './actions';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ConfirmModal';

type UsersClientProps = {
  users: any[];
  roles: any[];
  organizations: any[];
};

export function UsersClient({ users, roles, organizations }: UsersClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsConfirmOpen(false);
    
    const res = await deleteUser(userToDelete.id);
    if (res.success) {
      toast.success(`Pengguna "${userToDelete.name}" berhasil dihapus.`);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    
    setUserToDelete(null);
  };

  const [activeTab, setActiveTab] = useState<'SEMUA' | 'ADMIN' | 'USER'>('SEMUA');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const filteredUsers = users.filter(u => {
    // 1. Tab Filter
    if (activeTab !== 'SEMUA') {
      const roleName = u.role?.name?.toLowerCase() || '';
      if (activeTab === 'ADMIN' && !roleName.includes('admin')) return false;
      if (activeTab === 'USER' && roleName.includes('admin')) return false;
    }
    
    // 2. Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) && 
        !u.email.toLowerCase().includes(q) &&
        !(u.role?.name || '').toLowerCase().includes(q) &&
        !(u.organization?.name || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-4">
        
        {/* TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Tabs */}
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <button 
              onClick={() => { setActiveTab('SEMUA'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'SEMUA' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => { setActiveTab('ADMIN'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'ADMIN' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Admin
            </button>
            <button 
              onClick={() => { setActiveTab('USER'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'USER' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pengguna
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari pengguna..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
            onClick={handleAddNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold shadow hover:-translate-y-0.5 transition-all flex items-center gap-2 min-h-[32px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                <th className="px-6 py-4 font-bold">Kontak Email</th>
                <th className="px-6 py-4 font-bold">Peran (Role)</th>
                <th className="px-6 py-4 font-bold">Organisasi</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada data pengguna yang cocok.
                  </td>
                </tr>
              ) : paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-primary/20">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="font-bold text-sm text-foreground">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge roleName={user.role?.name || 'Tidak ada'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {user.organization ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-xs text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 4-4-4H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1"/></svg>
                        {user.organization.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg hover:border-primary transition-colors"
                        title="Edit Pengguna"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-2 text-muted-foreground hover:text-red-500 bg-background border border-border rounded-lg hover:border-red-500 transition-colors"
                        title="Hapus Pengguna"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{paginatedUsers.length > 0 ? (safePage - 1) * pageSize + 1 : 0}</span> - <span className="font-bold text-foreground">{Math.min(safePage * pageSize, filteredUsers.length)}</span> dari <span className="font-bold text-foreground">{filteredUsers.length}</span> pengguna
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

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        roles={roles}
        organizations={organizations}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}

function RoleBadge({ roleName }: { roleName: string }) {
  const isAdmin = roleName.toLowerCase().includes('admin');
  
  if (isAdmin) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded border border-purple-500/20 bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-wide uppercase">
        {roleName}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
      {roleName}
    </span>
  );
}
