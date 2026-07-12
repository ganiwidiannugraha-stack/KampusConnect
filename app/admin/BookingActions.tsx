'use client';

import { useState, useEffect } from 'react';
import { updateBookingStatus } from './actions';
import { useRouter } from 'next/navigation';

export function BookingActions({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const router = useRouter();
  
  // State for the undo mechanism (IMK: Permit easy reversal of actions)
  const [pendingAction, setPendingAction] = useState<'DISETUJUI' | 'DITOLAK' | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pendingAction && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (pendingAction && countdown === 0 && !isProcessing) {
      // Execute the action automatically when countdown finishes
      executeAction(pendingAction);
    }
    return () => clearTimeout(timer);
  }, [pendingAction, countdown]);

  const handleActionClick = (action: 'DISETUJUI' | 'DITOLAK') => {
    setPendingAction(action);
    setCountdown(5);
  };

  const handleUndo = () => {
    setPendingAction(null); // Membatalkan aksi dengan seketika
  };

  const executeAction = async (action: 'DISETUJUI' | 'DITOLAK') => {
    setIsProcessing(true);
    await updateBookingStatus(bookingId, action);
    setIsProcessing(false);
    setPendingAction(null);
    router.refresh();
  };

  // Visibility of system status
  if (currentStatus !== 'MENUNGGU') {
    return <div className="text-center text-[11px] text-muted-foreground font-bold uppercase tracking-wider flex justify-center w-full">- Selesai -</div>;
  }

  // Loading state
  if (isProcessing) {
    return (
      <div className="flex justify-center w-full py-1">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Undo Mechanism Interface
  if (pendingAction) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 w-full animate-in fade-in zoom-in-95 duration-200">
        <span className="text-[11px] font-bold text-foreground">
          {pendingAction === 'DISETUJUI' ? 'Menyetujui' : 'Menolak'} dalam {countdown}s...
        </span>
        <button 
          onClick={handleUndo}
          className="text-[11px] bg-background hover:bg-muted text-foreground px-4 py-1.5 rounded-full font-bold transition-all border-2 border-border shadow-sm hover:scale-105 active:scale-95"
        >
          Batalkan (Undo)
        </button>
      </div>
    );
  }

  // Normal Buttons
  return (
    <div className="flex gap-2 justify-center w-full">
      <button 
        onClick={() => handleActionClick('DISETUJUI')}
        className="px-4 py-1.5 bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-105 active:scale-95"
      >
        Setujui
      </button>
      <button 
        onClick={() => handleActionClick('DITOLAK')}
        className="px-4 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-105 active:scale-95"
      >
        Tolak
      </button>
    </div>
  );
}
