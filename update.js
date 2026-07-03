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
    
    // Replace <DrawerFooter className="px-0 pt-4"> with <DrawerFooter className="px-0 pt-4 flex-row gap-2">
    content = content.replace(/<DrawerFooter className="([^"]+)">/g, (match, p1) => {
      if (!p1.includes('flex-row') && !p1.includes('flex-wrap')) {
        return `<DrawerFooter className="${p1} flex-row gap-2">`;
      }
      return match;
    });

    // Replace the specific Batal buttons
    content = content.replace(/<Button type="button" variant="outline" className="w-full" onClick=\{([^}]+)\}>Batal<\/Button>/g, '<Button type="button" variant="ghost" className="flex-1" onClick={$1}>Batal</Button>');
    content = content.replace(/<Button variant="outline" className="w-full" onClick=\{([^}]+)\}>Batal<\/Button>/g, '<Button variant="ghost" className="flex-1" onClick={$1}>Batal</Button>');

    // Replace the specific Simpan buttons
    content = content.replace(/<Button type="submit" className="w-full" disabled=\{([^}]+)\}>Simpan<\/Button>/g, '<Button type="submit" className="flex-1" disabled={$1}>Simpan</Button>');
    content = content.replace(/<Button className="w-full" onClick=\{([^}]+)\} disabled=\{([^}]+)\}>Simpan([^<]*)<\/Button>/g, '<Button className="flex-1" onClick={$1} disabled={$2}>Simpan$3</Button>');

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
}
