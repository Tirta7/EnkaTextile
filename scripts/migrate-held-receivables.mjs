/**
 * Script migrasi: Buat receivable untuk semua invoice HOLD/partial yang sudah ada
 * tapi belum punya receivable (data lama sebelum fix DP piutang)
 * 
 * Jalankan: node --env-file=../.env scripts/migrate-held-receivables.mjs
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Mencari invoice partial yang belum punya receivable...');

    const { rows: salesNeedingReceivable } = await client.query(`
      SELECT s.id, s.invoice_number, s.customer_id, s.total_amount, s.paid_amount, s.status, s.due_date
      FROM sales s
      WHERE s.status = 'partial'
        AND s.paid_amount::numeric > 0
        AND NOT EXISTS (
          SELECT 1 FROM receivables r WHERE r.sale_id = s.id
        )
    `);

    console.log('Ditemukan ' + salesNeedingReceivable.length + ' invoice partial tanpa receivable');

    if (salesNeedingReceivable.length === 0) {
      console.log('Tidak ada data yang perlu dimigrasi');
      return;
    }

    let created = 0;
    for (const sale of salesNeedingReceivable) {
      console.log('  -> Membuat receivable untuk: ' + sale.invoice_number + ' (ID: ' + sale.id + ') - Total: ' + sale.total_amount + ', DP: ' + sale.paid_amount);
      
      await client.query(
        'INSERT INTO receivables (sale_id, customer_id, total_amount, paid_amount, status, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [sale.id, sale.customer_id, sale.total_amount, sale.paid_amount, 'partial', sale.due_date]
      );
      
      created++;
    }

    console.log('Migrasi selesai! ' + created + ' receivable berhasil dibuat.');
  } catch (err) {
    console.error('Error migrasi:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
