// Script migrasi data lama: buat receivable untuk invoice partial tanpa receivable
// Run: node --env-file=../../.env migrate-receivables.cjs

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT s.id, s.invoice_number, s.customer_id, s.total_amount, s.paid_amount, s.due_date
      FROM sales s
      WHERE s.status = 'partial'
        AND s.paid_amount::numeric > 0
        AND NOT EXISTS (SELECT 1 FROM receivables r WHERE r.sale_id = s.id)
    `);

    console.log('Sales perlu receivable: ' + rows.length);

    for (const sale of rows) {
      console.log(' -> ' + sale.invoice_number + '  Total: ' + sale.total_amount + '  DP: ' + sale.paid_amount);
      await client.query(
        'INSERT INTO receivables (sale_id, customer_id, total_amount, paid_amount, status, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [sale.id, sale.customer_id, sale.total_amount, sale.paid_amount, 'partial', sale.due_date]
      );
    }

    console.log('SELESAI. Receivable dibuat: ' + rows.length);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error(err); process.exit(1); });
