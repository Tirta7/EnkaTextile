const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM push_subscriptions');
    console.log("Subscriptions:", res.rows);
    const users = await client.query('SELECT id, username, role FROM users');
    console.log("Users:", users.rows);
  } catch(e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}
check();
