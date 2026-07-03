import { Router } from "express";
import { db } from "@workspace/db";
import { unitsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

router.get("/units", async (req, res): Promise<void> => {
  const units = await db
    .select()
    .from(unitsTable)
    .orderBy(asc(unitsTable.name));
  res.json(units);
});

router.post("/units", async (req, res): Promise<void> => {
  const { name, symbol } = req.body;
  if (!name || !symbol) {
    res.status(400).json({ error: "Name dan symbol wajib diisi" }); return;
  }
  const [unit] = await db.insert(unitsTable).values({
    name: String(name).toUpperCase(),
    symbol: String(symbol),
  }).returning();
  broadcastRefresh();
  res.status(201).json(unit);
});

router.put("/units/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { name, symbol } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = String(name).toUpperCase();
  if (symbol !== undefined) update.symbol = String(symbol);
  
  const [unit] = await db
    .update(unitsTable)
    .set(update)
    .where(eq(unitsTable.id, id))
    .returning();
  if (!unit) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  broadcastRefresh();
  res.json(unit);
});

router.delete("/units/:id", async (req, res): Promise<void> => {
  await db.delete(unitsTable).where(eq(unitsTable.id, parseInt(req.params.id)));
  broadcastRefresh();
  res.json({ ok: true });
});

export default router;
