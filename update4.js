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

    // Make all Buttons with text "Batal" use text-muted-foreground if they don't have it
    content = content.replace(/<Button(.*?)>Batal<\/Button>/g, (match, p1) => {
      // Avoid doubling it if I run the script twice
      if (p1.includes('text-muted-foreground')) {
        return match;
      }
      
      // If there is already a className attribute
      if (p1.includes('className="')) {
        return `<Button${p1.replace('className="', 'className="text-muted-foreground ')}>Batal</Button>`;
      } else {
        // If there isn't a className attribute
        return `<Button${p1} className="text-muted-foreground">Batal</Button>`;
      }
    });

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('Updated', file);
  }
}
