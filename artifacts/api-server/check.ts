import { db } from "@workspace/db";
import { cashEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  const entries = await db.select().from(cashEntriesTable).where(eq(cashEntriesTable.reference, 'RET-1788204791643'));
  console.log('CASH ENTRIES:', entries);
  process.exit(0);
}
run();
