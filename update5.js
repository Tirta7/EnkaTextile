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

    // Currently, Batal button classes might look like:
    // className="text-muted-foreground flex-1"
    // We want to add bg-muted and hover:bg-muted/80
    // So we will just replace className="text-muted-foreground flex-1"
    // with className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80"
    
    // Catch cases where it's already updated to avoid duplication
    if (!content.includes('bg-muted hover:bg-muted/80')) {
      content = content.replace(/className="text-muted-foreground flex-1"/g, 'className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80"');
    }

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('Updated', file);
  }
}
