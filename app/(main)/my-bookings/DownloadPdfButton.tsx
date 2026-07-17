'use client';

import { toast } from 'sonner';

type DownloadPdfProps = {
  booking: {
    id: string;
    room?: { name: string } | null;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: string;
    createdAt: string;
  };
  userName: string;
};

export function DownloadPdfButton({ booking, userName }: DownloadPdfProps) {
  if (booking.status !== 'DISETUJUI') return null;

  const handleDownload = async () => {
    toast.info('Menyiapkan PDF...');

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // ===== HEADER =====
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('KAMPUSCONNECT', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistem Informasi Reservasi Ruang Organisasi Kampus', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Garis Kop Surat
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
    y += 15;

    // ===== JUDUL DOKUMEN =====
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SURAT BUKTI PERSETUJUAN RESERVASI', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. Ref: KC-${String(booking.id).toUpperCase().substring(0, 8)}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // ===== TABEL INFO =====
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    
    // Top border of table
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    
    const drawRow = (label: string, value: string, yPos: number) => {
      // Label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 2, yPos + 2);

      // Value
      doc.setFont('helvetica', 'normal');
      doc.text(': ' + value, margin + 45, yPos + 2);
      
      // Bottom border for this row
      doc.line(margin, yPos + 7, pageWidth - margin, yPos + 7);
    };

    drawRow('Pemohon', userName, y);
    y += 12;
    drawRow('Ruangan', booking.room?.name || 'Ruang Dihapus', y);
    y += 12;
    drawRow('Tanggal Kegiatan', new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), y);
    y += 12;
    drawRow('Waktu', `${booking.startTime} - ${booking.endTime} WIB`, y);
    y += 12;
    drawRow('Tujuan Kegiatan', booking.reason || '-', y);
    y += 12;
    drawRow('Status', 'DISETUJUI', y);
    y += 12;
    drawRow('Tanggal Pengajuan', new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), y);
    y += 20;

    // ===== KETENTUAN =====
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ketentuan Peminjaman Ruangan:', margin, y);
    y += 8;

    const rules = [
      'Surat ini merupakan bukti digital persetujuan reservasi ruangan.',
      'Peminjam wajib menunjukkan surat ini saat menggunakan ruangan.',
      'Ruangan wajib dikembalikan dalam keadaan bersih dan rapi.',
      'Kerusakan fasilitas ruangan selama pemakaian menjadi tanggung jawab organisasi peminjam.',
      'Pihak kampus berhak membatalkan persetujuan sepihak apabila terdapat acara mendesak universitas.',
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    rules.forEach((rule, i) => {
      doc.text(`${i + 1}. ${rule}`, margin + 5, y);
      y += 6;
    });

    y += 15;

    // ===== TTD AREA =====
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Dicetak tanggal: ${dateStr}`, pageWidth - margin - 65, y);
    y += 5;
    doc.text('Disetujui secara digital oleh,', pageWidth - margin - 65, y);
    y += 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Admin KampusConnect', pageWidth - margin - 65, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    doc.text('Bagian Sarana & Prasarana', pageWidth - margin - 65, y);

    // ===== FOOTER =====
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Dokumen ini dicetak otomatis oleh sistem KampusConnect dan tidak memerlukan tanda tangan basah.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`ID Referensi: ${booking.id}`, pageWidth / 2, footerY + 5, { align: 'center' });

    // Save
    const fileName = `Bukti_Reservasi_${booking.room?.name?.replace(/\s+/g, '_') || 'Ruangan'}_${booking.date}.pdf`;
    doc.save(fileName);
    toast.success('PDF Bukti Reservasi berhasil diunduh!');
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 transition-colors"
      title="Unduh Bukti Persetujuan (PDF)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
      Unduh PDF
    </button>
  );
}
