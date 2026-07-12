'use client';

import { useTransition, useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { ConfirmModal } from '@/components/ConfirmModal';

export function LogoutButton({ className, children }: { className?: string, children?: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsConfirmOpen(false);
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        disabled={isPending}
        className={className || "inline-flex h-9 items-center justify-center rounded-full bg-secondary px-6 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"}
      >
        {children || (isPending ? 'Keluar...' : 'Keluar')}
      </button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk masuk."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmLogout}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
