const PDFDocument = require('pdfkit');
const fs = require('fs');

const outPath = process.argv[2] || 'Proposal_Lengkap_Kosong.pdf';
const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(outPath));

doc.fontSize(20).text('PROPOSAL KEGIATAN MAHASISWA', { align: 'center' });
doc.fontSize(16).text('Universitas KampusConnect', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).text('I. Latar Belakang');
doc.fontSize(12).text('(Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('II. Nama Kegiatan');
doc.fontSize(12).text('(Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('III. Tujuan Kegiatan');
doc.fontSize(12).text('(Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('IV. Waktu dan Tempat Pelaksanaan');
doc.fontSize(12).text('• Tanggal: (Dikosongkan)', { indent: 20 });
doc.text('• Waktu: (Dikosongkan)', { indent: 20 });
doc.text('• Tempat: (Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('V. Susunan Acara');
doc.fontSize(12).text('(Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('VI. Peserta');
doc.fontSize(12).text('• Jumlah Peserta: (Dikosongkan)', { indent: 20 });
doc.text('• Kategori: Mahasiswa / Umum', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('VII. Rencana Anggaran Biaya');
doc.fontSize(12).text('(Dikosongkan)', { indent: 20 });
doc.moveDown();

doc.fontSize(14).text('VIII. Penutup');
doc.fontSize(12).text('Demikian proposal ini dibuat sebagai syarat pengajuan peminjaman ruangan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.', { indent: 20 });
doc.moveDown(3);

doc.text('Mengetahui,             ', { align: 'right' });
doc.moveDown(3);
doc.text('Ketua Pelaksana             ', { align: 'right' });

doc.end();
