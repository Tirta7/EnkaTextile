const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:vocpos2026@127.0.0.1:4538/avocpos' });

async function run() {
  const client = await pool.connect();
  try {
    // Cek duplikat
    const dups = await client.query(
      'SELECT invoice_number, COUNT(*) as jumlah, array_agg(id ORDER BY created_at) as ids FROM purchases GROUP BY invoice_number HAVING COUNT(*) > 1'
    );
    console.log('Duplikat ditemukan:', dups.rows.length);
    dups.rows.forEach(r => console.log(' -', r.invoice_number, ':', r.ids));

    if (dups.rows.length === 0) {
      console.log('Tidak ada duplikat! Lanjut tambah constraint...');
    } else {
      // Hapus payables duplikat
      const r1 = await client.query(
        'DELETE FROM payables WHERE purchase_id IN (SELECT id FROM purchases WHERE id NOT IN (SELECT MIN(id) FROM purchases GROUP BY invoice_number))'
      );
      console.log('Payables dihapus:', r1.rowCount);

      // Hapus purchase_items duplikat
      const r2 = await client.query(
        'DELETE FROM purchase_items WHERE purchase_id IN (SELECT id FROM purchases WHERE id NOT IN (SELECT MIN(id) FROM purchases GROUP BY invoice_number))'
      );
      console.log('Purchase items dihapus:', r2.rowCount);

      // Hapus purchases duplikat
      const r3 = await client.query(
        'DELETE FROM purchases WHERE id NOT IN (SELECT MIN(id) FROM purchases GROUP BY invoice_number)'
      );
      console.log('Purchases duplikat dihapus:', r3.rowCount);
    }

    // Tambah UNIQUE constraint
    try {
      await client.query('ALTER TABLE purchases ADD CONSTRAINT purchases_invoice_number_unique UNIQUE (invoice_number)');
      console.log('UNIQUE constraint berhasil ditambahkan!');
    } catch (e) {
      if (e.code === '42710') console.log('Constraint sudah ada sebelumnya.');
      else throw e;
    }

    console.log('Selesai!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
