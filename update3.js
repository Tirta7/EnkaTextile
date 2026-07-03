const fs = require('fs');
const path = require('path');

const files = [
  'artifacts/tmcpos/src/pages/Pelanggan.tsx',
  'artifacts/tmcpos/src/pages/Barang.tsx',
  'artifacts/tmcpos/src/pages/Kategori.tsx',
  'artifacts/tmcpos/src/pages/Supplier.tsx',
  'artifacts/tmcpos/src/pages/Karyawan.tsx',
  'artifacts/tmcpos/src/pages/Pengaturan.tsx',
  'artifacts/tmcpos/src/pages/Mutasi.tsx',
  'artifacts/tmcpos/src/pages/BukuKas.tsx',
  'artifacts/tmcpos/src/pages/Hutang.tsx',
  'artifacts/tmcpos/src/pages/Piutang.tsx',
  'artifacts/tmcpos/src/pages/Pembelian.tsx',
  'artifacts/tmcpos/src/pages/Penjualan.tsx',
  'artifacts/tmcpos/src/components/ProductRollsModal.tsx'
];

for (const file of files) {
  const filepath = path.join(process.cwd(), file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Make all Buttons with text "Batal" use variant="ghost" and className="flex-1"
    content = content.replace(/<Button(.*?)variant="outline"(.*?)className="w-full"(.*?)>Batal<\/Button>/g, '<Button$1variant="ghost"$2className="flex-1"$3>Batal</Button>');
    content = content.replace(/<Button(.*?)className="w-full"(.*?)variant="outline"(.*?)>Batal<\/Button>/g, '<Button$1className="flex-1"$2variant="ghost"$3>Batal</Button>');

    // If it only has variant="outline" and no className, add className="flex-1"
    content = content.replace(/<Button(.*?)variant="outline"(.*?)>Batal<\/Button>/g, (match, p1, p2) => {
      if (!p1.includes('className') && !p2.includes('className')) {
        return `<Button${p1}variant="ghost" className="flex-1"${p2}>Batal</Button>`;
      }
      return match;
    });

    // For Simpan buttons that might have not matched because of > inside disabled block
    content = content.replace(/<Button(.*?)className="w-full"(.*?)>Simpan([^<]*)<\/Button>/g, '<Button$1className="flex-1"$2>Simpan$3</Button>');

    // Also update any missed DrawerFooters
    content = content.replace(/<DrawerFooter className="([^"]+)">/g, (match, p1) => {
      if (!p1.includes('flex-row') && !p1.includes('flex-wrap')) {
        return `<DrawerFooter className="${p1} flex-row gap-2">`;
      }
      return match;
    });

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('Updated', file);
  }
}
