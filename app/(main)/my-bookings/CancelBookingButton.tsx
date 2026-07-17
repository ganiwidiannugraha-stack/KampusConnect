'use client';

import { useState } from 'react';
import { cancelBooking } from './actions';
import { toast } from 'sonner';

import { ConfirmModal } from '@/components/ConfirmModal';

type CancelButtonProps = {
  bookingId: string;
  bookingDate: string;
  status: string;
};

export function CancelBookingButton({ bookingId, bookingDate, status }: CancelButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Jika status sudah final, jangan tampilkan tombol
  if (status === 'Dibatalkan' || status === 'Ditolak' || status === 'Selesai') {
    return null;
  }

  // Cek batas H-1 di frontend
  const bookingD = new Date(bookingDate);
  const today = new Date();
  bookingD.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((bookingD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isTooLate = diffDays <= 1;

  const handleCancelClick = () => {
    if (isTooLate) {
      toast.error('Pembatalan maksimal dilakukan H-1 sebelum tanggal penggunaan ruangan.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmCancel = async () => {
    setIsConfirmOpen(false);
    setIsCancelling(true);
    
    const res = await cancelBooking(bookingId);
    
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.message);
    }
    setIsCancelling(false);
  };

  return (
    <>
      <button
        onClick={handleCancelClick}
        disabled={isCancelling || isTooLate}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
          isTooLate 
            ? 'bg-red-50/50 text-red-400 border-red-100 cursor-not-allowed dark:bg-red-900/10 dark:text-red-500/50 dark:border-red-800/30' 
            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20'
        }`}
        title={isTooLate ? 'Sudah melewati batas pembatalan H-1' : 'Batalkan Reservasi'}
      >
        {isCancelling ? 'Membatalkan...' : 'Batalkan'}
      </button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Batalkan Reservasi"
        message="Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat diurungkan."
        confirmText="Ya, Batalkan"
        onConfirm={confirmCancel}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
