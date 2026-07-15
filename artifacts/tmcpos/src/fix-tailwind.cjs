const fs = require('fs');
const path = require('path');

const filesToReplace = [
  { path: 'pages/Barang.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Mutasi.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Pembelian.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'components/DateRangeFilter.tsx', replace: ['z-[300]', 'z-300'] },
  { path: 'components/layout/BottomNav.tsx', replace: ['z-[100]', 'z-100'] },
  { path: 'components/ui/drawer.tsx', replace: ['z-[200]', 'z-200'] },
  { path: 'pages/BukuKas.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Home.tsx', replace: ['bg-gradient-to-r', 'bg-linear-to-r'] },
  { path: 'pages/Hutang.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Karyawan.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Kategori.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Pelanggan.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Penjualan.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Piutang.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
  { path: 'pages/Supplier.tsx', replace: ['flex-shrink-0', 'shrink-0'] },
];

filesToReplace.forEach(fileInfo => {
  const fullPath = path.join(__dirname, fileInfo.path);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // globally replace
    content = content.split(fileInfo.replace[0]).join(fileInfo.replace[1]);
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${fileInfo.path}`);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});
