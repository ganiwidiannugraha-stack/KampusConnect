const fs = require('fs');
const { execSync } = require('child_process');

const mdPath = 'D:\\PROJECT VIBE\\SI\\VB\\Presentasi\\Persiapan_Code_Review_Gani.md';
let markdownContent = fs.readFileSync(mdPath, 'utf8');

// Function to get specific lines from a file
function getLines(filePath, startKeyword, linesCount) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let startIdx = lines.findIndex(l => l.includes(startKeyword));
    if (startIdx === -1) startIdx = 0;
    
    // go back a few lines for context if possible
    startIdx = Math.max(0, startIdx - 5);
    
    const selected = lines.slice(startIdx, startIdx + linesCount);
    return '```typescript\n' + selected.join('\n') + '\n```';
  } catch (e) {
    return '```\nKode tidak dapat dimuat\n```';
  }
}

// 1. Booking Actions
const bookingCode = getLines('D:\\PROJECT VIBE\\SI\\VB\\app\\booking\\actions.ts', 'CEK BENTROK JADWAL', 30);

// 2. Middleware / Layout
const middlewareCode = getLines('D:\\PROJECT VIBE\\SI\\VB\\app\\admin\\layout.tsx', 'if (!user || !user.role?.canAccessDashboard)', 15);

// 3. Admin Actions
const adminCode = getLines('D:\\PROJECT VIBE\\SI\\VB\\app\\admin\\actions.ts', 'updateBookingStatus', 30);

// 4. Export PDF
const pdfCode = getLines('D:\\PROJECT VIBE\\SI\\VB\\app\\(main)\\my-bookings\\DownloadPdfButton.tsx', 'new jsPDF', 35);

// Correct the texts in markdownContent since the files have changed
markdownContent = markdownContent.replace('`middleware.ts` (di folder paling luar)', '`app/admin/layout.tsx` (sebagai pengganti middleware)');
markdownContent = markdownContent.replace('Fungsi utama middleware', 'canAccessDashboard');
markdownContent = markdownContent.replace('app/admin/reports/ExportPDFButton.tsx', 'app/(main)/my-bookings/DownloadPdfButton.tsx');
markdownContent = markdownContent.replace('exportToPDF', 'jsPDF');

markdownContent += `

---
# 💻 LAMPIRAN KODE PENTING (Untuk Ditunjukkan)

## 1. app/booking/actions.ts (Validasi Bentrok)
${bookingCode}

## 2. app/admin/layout.tsx (Proteksi Akses)
${middlewareCode}

## 3. app/admin/actions.ts (Proses Approve/Tolak)
${adminCode}

## 4. app/(main)/my-bookings/DownloadPdfButton.tsx (Generate PDF)
${pdfCode}
`;

const outMdPath = 'D:\\PROJECT VIBE\\SI\\Draf_Code_Review_Gani.md';
fs.writeFileSync(outMdPath, markdownContent);
console.log('Markdown generated successfully.');
