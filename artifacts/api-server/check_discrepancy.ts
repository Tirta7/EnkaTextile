import { db } from '@workspace/db';
import { salesTable, returnsTable } from '@workspace/db';
import { sql } from 'drizzle-orm';

async function main() {
  const sales = await db.select({
    id: salesTable.id,
    invoice: salesTable.invoiceNumber,
    total: salesTable.totalAmount,
    paid: salesTable.paidAmount,
    ret: sql`COALESCE((SELECT sum(difference_amount) FROM returns WHERE sale_id = sales.id), 0)`,
    retPaid: sql`COALESCE((SELECT sum(difference_amount) FROM returns WHERE sale_id = sales.id AND payment_status = 'lunas'), 0)`
  }).from(salesTable);

  console.log("Checking sales for discrepancy...");
  sales.forEach(s => {
    const g = parseFloat(s.total) + parseFloat(s.ret as any);
    const p = parseFloat(s.paid) + parseFloat(s.retPaid as any);
    const diff = g - p;
    if (diff < 0) {
      console.log(`${s.invoice}: Gross=${g}, Paid=${p}, Diff=${diff}`);
    }
  });
  
  process.exit(0);
}

main();
