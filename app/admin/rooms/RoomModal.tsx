'use client';

import { useState, useRef, useEffect } from 'react';
import { saveRoom } from './actions';
import { createPortal } from 'react-dom';

type RoomModalProps = {
  room?: any; // null if creating
  buildings: any[];
  facilities: any[];
  onClose: () => void;
};

export function RoomModal({ room, buildings, facilities, onClose }: RoomModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // File upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(room?.foto || null);

  // Selected facilities
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>(
    room?.ruangan_fasilitas?.map((rf: any) => rf.fasilitas?.id_fasilitas) || []
  );

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setError('Hanya file gambar (JPG, PNG, WebP, GIF) yang diizinkan');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFacility = (id: number) => {
    setSelectedFacilities(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }
    setError('');
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    
    // Add file
    if (selectedFile) {
      formData.append('images', selectedFile);
    }
    
    // Add existing image if no new file is selected and we have an old one
    if (!selectedFile && previewUrl && previewUrl === room?.foto) {
      formData.append('existingImages', JSON.stringify([previewUrl]));
    }
    
    // Add selected facilities
    selectedFacilities.forEach(fid => {
      formData.append('fasilitas', fid.toString());
    });

    const result = await saveRoom(formData, room?.id_ruangan);

    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Terjadi kesalahan');
    }
    
    setIsSaving(false);
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            {room ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted">
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-semibold flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          <form id="room-form" noValidate onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Nama Ruangan <span className="text-red-500">*</span></label>
                  <input 
                    name="name" 
                    defaultValue={room?.nama_ruangan} 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Misal: R. Sidang A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Gedung <span className="text-red-500">*</span></label>
                  <select 
                    name="id_gedung" 
                    defaultValue={room?.id_gedung || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  >
                    <option value="" disabled>-- Pilih Gedung --</option>
                    {buildings.map(b => (
                      <option key={b.id_gedung} value={b.id_gedung}>{b.nama_gedung}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Kapasitas (Orang) <span className="text-red-500">*</span></label>
                    <input 
                      name="capacity" 
                      type="number" 
                      min="1"
                      defaultValue={room?.kapasitas} 
                      required 
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Lantai</label>
                    <input 
                      name="lantai" 
                      type="number" 
                      defaultValue={room?.lantai} 
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Status <span className="text-red-500">*</span></label>
                  <select 
                    name="status" 
                    defaultValue={room?.status || 'Tersedia'}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Deskripsi</label>
                  <textarea 
                    name="deskripsi" 
                    defaultValue={room?.deskripsi} 
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                    placeholder="Deskripsi atau catatan khusus ruangan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Foto Ruangan</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors relative group h-40 flex flex-col items-center justify-center
                      ${previewUrl ? 'border-primary/50' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center font-bold text-sm text-foreground backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          Ganti Foto
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 mb-3 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-foreground">Klik untuk upload foto</span>
                        <span className="text-xs text-muted-foreground mt-1">JPG, PNG atau WebP (Max 5MB)</span>
                      </div>
                    )}
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  {previewUrl && (
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-xs text-red-500 font-semibold hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-bold text-foreground mb-3">Fasilitas Ruangan</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilities.map(f => {
                  const isSelected = selectedFacilities.includes(f.id_fasilitas);
                  return (
                    <div 
                      key={f.id_fasilitas}
                      onClick={() => toggleFacility(f.id_fasilitas)}
                      className={`px-3 py-2 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {f.nama_fasilitas}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-sm transition-colors text-foreground"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="room-form"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Simpan Ruangan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
