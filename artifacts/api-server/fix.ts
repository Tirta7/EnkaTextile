import { db } from "@workspace/db";
import { returnsTable, cashEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  await db.update(returnsTable).set({ paymentStatus: 'lunas' }).where(eq(returnsTable.id, 6));

  await db.insert(cashEntriesTable).values({
    type: 'masuk',
    amount: "3108000.00",
    description: `Selisih Tambah Retur Penjualan RET-1788204791643`,
    reference: 'RET-1788204791643',
  });
  
  console.log("FIXED INVOICE 5435!");
  process.exit(0);
}
run();
