import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { setupWebSocket } from "./lib/websocket";
import { startScheduler } from "./lib/scheduler";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Pastikan tabel user_sessions, settings, dan kolom-kolom baru categories ada sebelum server mulai
async function ensureSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid  VARCHAR NOT NULL COLLATE "default",
        sess JSON    NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      ) WITH (OIDS=FALSE);
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON user_sessions (expire);

      CREATE TABLE IF NOT EXISTS settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        description text,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      ALTER TABLE categories ADD COLUMN IF NOT EXISTS primary_unit text DEFAULT 'METER';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS secondary_unit text DEFAULT 'ROLL';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS cost_price_per_meter numeric(15, 2) DEFAULT 0;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS price_per_meter numeric(15, 2) DEFAULT 0;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS cost_price_per_roll numeric(15, 2);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS price_per_roll numeric(15, 2);
    `);
    logger.info("Database schema and session table verified ready");
  } catch (err) {
    logger.warn({ err }, "Could not ensure schema / session table — continuing startup");
  }
}

const server = http.createServer(app);
setupWebSocket(server);
startScheduler();

// Tunggu schema siap baru listen
ensureSchema().finally(() => {
  server.listen(port, () => {
    logger.info({ port }, "Server listening with WebSocket support");
  });
});
