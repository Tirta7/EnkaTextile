import { Router } from "express";
import { db } from "@workspace/db";
import { paymentMethodsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

const DEFAULT_METHODS = [
  { code: "tunai", name: "Tunai / Cash", isActive: true, sortOrder: 0 },
  { code: "transfer", name: "Transfer Bank", isActive: true, sortOrder: 1 },
  { code: "debit", name: "Kartu Debit", isActive: true, sortOrder: 2 },
  { code: "qris", name: "QRIS", isActive: true, sortOrder: 3 },
  { code: "kredit", name: "Kredit / Tempo", isActive: true, sortOrder: 4 },
];

async function ensureDefaults() {
  const existing = await db.select().from(paymentMethodsTable);
  if (existing.length === 0) {
    await db.insert(paymentMethodsTable).values(DEFAULT_METHODS);
  }
}

router.get("/payment-methods", async (req, res): Promise<void> => {
  await ensureDefaults();
  const methods = await db
    .select()
    .from(paymentMethodsTable)
    .orderBy(asc(paymentMethodsTable.sortOrder), asc(paymentMethodsTable.name));
  res.json(methods);
});

router.post("/payment-methods", async (req, res): Promise<void> => {
  const { code, name, isActive = true, sortOrder = 99 } = req.body;
  if (!code || !name) {
    res.status(400).json({ error: "Code dan name wajib diisi" }); return;
  }
  const [method] = await db.insert(paymentMethodsTable).values({
    code: String(code).toLowerCase().replace(/\s+/g, "_"),
    name: String(name),
    isActive: Boolean(isActive),
    sortOrder: Number(sortOrder),
  }).returning();
  broadcastRefresh();
  res.status(201).json(method);
});

router.put("/payment-methods/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { name, isActive, sortOrder } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = String(name);
  if (isActive !== undefined) update.isActive = Boolean(isActive);
  if (sortOrder !== undefined) update.sortOrder = Number(sortOrder);
  const [method] = await db
    .update(paymentMethodsTable)
    .set(update)
    .where(eq(paymentMethodsTable.id, id))
    .returning();
  if (!method) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  broadcastRefresh();
  res.json(method);
});

router.delete("/payment-methods/:id", async (req, res): Promise<void> => {
  await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, parseInt(req.params.id)));
  broadcastRefresh();
  res.json({ ok: true });
});

export default router;
