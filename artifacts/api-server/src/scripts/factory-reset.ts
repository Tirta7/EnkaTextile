import { db, usersTable, categoriesTable, unitsTable, settingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root project is 3 levels up from artifacts/api-server/src/scripts
const rootDir = path.resolve(__dirname, "../../..");

async function factoryReset() {
  console.log("\n[1/3] Menghapus seluruh data & schema lama dari database...");
  try {
    await db.execute(sql`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database() AND pid <> pg_backend_pid();
    `);
  } catch (e) {
    // Abaikan jika tidak ada koneksi lain
  }

  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
  console.log("      [✓] Database berhasil dikosongkan.");

  console.log("\n[2/3] Membangun kembali tabel-tabel bersih (Drizzle Push)...");
  execSync("pnpm --filter @workspace/db run push-force", {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
  console.log("      [✓] Seluruh tabel database berhasil dibuat ulang.");

  console.log("\n[3/3] Menyiapkan akun default & data awal (Factory Initial State)...");
  const hash = await bcrypt.hash("vocpos2026", 10);
  await db.insert(usersTable).values({
    username: "admin",
    passwordHash: hash,
    fullName: "Administrator",
    role: "admin",
  });

  await db.insert(categoriesTable).values([
    { name: "Kain", description: "Kategori umum kain" },
    { name: "Rayon", description: "Kain rayon" },
    { name: "Linen", description: "Kain linen" },
    { name: "Katun", description: "Kain katun" },
  ]);

  await db.insert(unitsTable).values([
    { name: "METER", symbol: "M" },
    { name: "ROLL", symbol: "ROL" },
    { name: "YARD", symbol: "YD" },
  ]);

  await db.insert(settingsTable).values([
    { key: "store_name", value: "EnkaTextile", description: "Nama Usaha / Toko" },
    { key: "receipt_footer", value: "Terima kasih atas kunjungan Anda!", description: "Catatan nota kasir" },
  ]);

  console.log("      [✓] Data bawaan berhasil disiapkan:");
  console.log("          - Akun Admin : admin / vocpos2026");
  console.log("          - Kategori   : Kain, Rayon, Linen, Katun");
  console.log("          - Satuan     : METER, ROLL, YARD");
  console.log("          - Toko       : EnkaTextile");
}

factoryReset()
  .then(() => {
    console.log("\n==========================================================");
    console.log("       RESET FACTORY / HARD RESTART DATABASE BERHASIL!    ");
    console.log("==========================================================\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n[X] Gagal melakukan reset factory:", err);
    process.exit(1);
  });
