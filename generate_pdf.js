const { jsPDF } = require("jspdf");
const fs = require('fs');

const doc = new jsPDF();

// Header
doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text("PROPOSAL KEGIATAN MAHASISWA", 105, 20, { align: "center" });
doc.setFontSize(14);
doc.text("Universitas KampusConnect", 105, 28, { align: "center" });

// Line
doc.setLineWidth(0.5);
doc.line(20, 35, 190, 35);

// Content
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("I. Latar Belakang", 20, 50);
doc.setFont("helvetica", "italic");
doc.text("(Dikosongkan)", 25, 58);

doc.setFont("helvetica", "bold");
doc.text("II. Nama Kegiatan", 20, 70);
doc.setFont("helvetica", "italic");
doc.text("(Dikosongkan)", 25, 78);

doc.setFont("helvetica", "bold");
doc.text("III. Tujuan Kegiatan", 20, 90);
doc.setFont("helvetica", "italic");
doc.text("(Dikosongkan)", 25, 98);

doc.setFont("helvetica", "bold");
doc.text("IV. Waktu dan Tempat Pelaksanaan", 20, 110);
doc.setFont("helvetica", "normal");
doc.text("- Tanggal: .......................................", 25, 118);
doc.text("- Waktu: .........................................", 25, 126);
doc.text("- Tempat: ........................................", 25, 134);

doc.setFont("helvetica", "bold");
doc.text("V. Susunan Acara", 20, 146);
doc.setFont("helvetica", "italic");
doc.text("(Dikosongkan)", 25, 154);

doc.setFont("helvetica", "bold");
doc.text("VI. Peserta", 20, 166);
doc.setFont("helvetica", "normal");
doc.text("- Jumlah Peserta: ................................", 25, 174);
doc.text("- Kategori: Mahasiswa / Umum", 25, 182);

doc.setFont("helvetica", "bold");
doc.text("VII. Rencana Anggaran Biaya", 20, 194);
doc.setFont("helvetica", "italic");
doc.text("(Dikosongkan)", 25, 202);

doc.setFont("helvetica", "bold");
doc.text("VIII. Penutup", 20, 214);
doc.setFont("helvetica", "normal");
doc.text("Demikian proposal ini dibuat sebagai syarat pengajuan peminjaman ruangan.", 25, 222);
doc.text("Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.", 25, 228);

// Signature
doc.text("Mengetahui,", 150, 250);
doc.text("Ketua Pelaksana", 145, 280);

doc.line(140, 281, 180, 281);

doc.setFontSize(10);
doc.setFont("helvetica", "italic");
doc.text("Catatan: Dokumen ini adalah contoh (dummy) yang khusus digunakan untuk", 20, 290);
doc.text("keperluan testing sistem informasi KampusConnect.", 20, 295);

// Save the PDF
const pdfData = doc.output();
fs.writeFileSync('Proposal_Lengkap_Kosong.pdf', pdfData, 'binary');

console.log("Berhasil membuat Proposal_Lengkap_Kosong.pdf");
