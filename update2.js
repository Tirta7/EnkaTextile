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
];

for (const file of files) {
  const filepath = path.join(process.cwd(), file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Make all Buttons with variant="outline" and text "Batal" use variant="ghost" and className="flex-1"
    content = content.replace(/<Button ([^>]*)variant="outline"([^>]*)className="w-full"([^>]*)>Batal<\/Button>/g, '<Button $1variant="ghost"$2className="flex-1"$3>Batal</Button>');
    
    // In case className and variant are swapped or missing
    content = content.replace(/<Button ([^>]*)className="w-full"([^>]*)variant="outline"([^>]*)>Batal<\/Button>/g, '<Button $1className="flex-1"$2variant="ghost"$3>Batal</Button>');

    // If it only has variant="outline" and no className
    content = content.replace(/<Button ([^>]*)variant="outline"([^>]*)>Batal<\/Button>/g, (match, p1, p2) => {
      if (!p1.includes('className') && !p2.includes('className')) {
        return `<Button ${p1}variant="ghost" className="flex-1"${p2}>Batal</Button>`;
      }
      return match;
    });

    // Also some "Simpan" buttons might not have been caught if they had multiple } in disabled=...
    // But Simpan buttons are generally `<Button type="submit" className="w-full" disabled={...}>Simpan</Button>`
    // I already successfully replaced Simpan in Pelanggan.tsx! Look at the diff: <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
    // The previous regex for Simpan worked because it didn't use `}` inside `disabled={...}` usually.

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
}
