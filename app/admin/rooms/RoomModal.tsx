'use client';

import { useState, useRef } from 'react';
import { saveRoom } from './actions';
import { toast } from 'sonner';

export function RoomModal({ room, onClose }: { room?: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Track existing images from DB
  const [existingImages, setExistingImages] = useState<string[]>(room?.images || []);
  
  // Track newly added files
  const [newFiles, setNewFiles] = useState<{url: string, file: File}[]>([]);
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFileObjects = filesArray.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setNewFiles(prev => [...prev, ...newFileObjects]);
      
      // Reset input so users can select the same file again or add more
      e.target.value = '';
    }
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };
  
  const removeNewImage = (urlToRemove: string) => {
    setNewFiles(prev => prev.filter(item => item.url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      toast.error("Harap lengkapi semua data ruangan dengan benar.");
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    // Add explicitly kept existing images
    formData.append('existingImages', JSON.stringify(existingImages));
    
    // Append actual file objects for new images
    newFiles.forEach(({file}) => {
      formData.append('newImageFiles', file);
    });

    const res = await saveRoom(formData, room?.id);
    
    if (res && typeof res === 'object') {
      
      if (res.success) {
        toast.success(room ? 'Ruangan berhasil diperbarui' : 'Ruangan berhasil ditambahkan');
        onClose();
      } else {
        toast.error(res.message || 'Gagal menyimpan ruangan');
        setError(res.message || 'Gagal menyimpan ruangan');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">
            {room ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-foreground">Nama Ruangan</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={room?.name}
                  required 
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Contoh: Ruang Sidang Utama"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-foreground">Kapasitas (Orang)</label>
                <input 
                  type="number" 
                  name="capacity" 
                  defaultValue={room?.capacity}
                  required 
                  min="1"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Contoh: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-foreground">Fasilitas Lengkap</label>
                <textarea 
                  name="facilities" 
                  defaultValue={room?.facilities}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Contoh: AC, Proyektor 4K, Whiteboard, Sound System"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-foreground">Foto Ruangan (Berbagai Sudut)</label>
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" 
                />
                
                {(existingImages.length > 0 || newFiles.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Render existing images from DB */}
                    {existingImages.map((src, idx) => (
                      <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden border border-border aspect-video">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeExistingImage(src)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-semibold text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                    
                    {/* Render newly added images */}
                    {newFiles.map((item, idx) => (
                      <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border border-primary/50 aspect-video shadow-[0_0_0_2px_rgba(var(--primary),0.2)]">
                        <img src={item.url} alt="New Preview" className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-sm font-bold">BARU</div>
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(item.url)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-semibold text-sm"
                        >
                          Batal
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  value="true"
                  defaultChecked={room ? room.isActive : true}
                  className="w-5 h-5 rounded border-input text-primary focus:ring-primary/50"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-foreground">
                  Ruangan Aktif (Bisa dipesan)
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                Simpan Ruangan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
