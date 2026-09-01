import { db, usersTable, pushSubscriptionsTable } from "@workspace/db"; 
async function run() { 
  const users = await db.select().from(usersTable); 
  console.log("Users:", users); 
  const subs = await db.select().from(pushSubscriptionsTable); 
  console.log("Subs:", subs); 
  process.exit(0); 
} 
run();
