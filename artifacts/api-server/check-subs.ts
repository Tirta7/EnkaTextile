import { db } from "@workspace/db";
import { pushSubscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const subs = await db.select().from(pushSubscriptionsTable);
  console.log("Subscriptions:", subs);
  
  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  console.log("Admins:", admins.map(a => ({ id: a.id, username: a.username, role: a.role })));
  
  process.exit(0);
}

main().catch(console.error);
