import { db } from "./artifacts/api-server/node_modules/@workspace/db/dist/index.js";
import { pushSubscriptionsTable, usersTable } from "./artifacts/api-server/node_modules/@workspace/db/dist/schema/index.js";
import 'dotenv/config';

async function check() {
  const subs = await db.select().from(pushSubscriptionsTable);
  console.log("Subscriptions:", subs);
  const users = await db.select().from(usersTable);
  console.log("Users:", users.map(u => ({ id: u.id, username: u.username, role: u.role })));
  process.exit(0);
}
check();
