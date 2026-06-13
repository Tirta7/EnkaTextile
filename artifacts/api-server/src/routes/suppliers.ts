import { Router } from "express";
import { db } from "@workspace/db";
import { suppliersTable, payablesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { CreateSupplierBody, UpdateSupplierBody } from "@workspace/api-zod";

const router = Router();

async function getSupplierDebt(supplierId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<string>`coalesce(sum(${payablesTable.totalAmount} - ${payablesTable.paidAmount}), 0)` })
    .from(payablesTable)
    .where(eq(payablesTable.supplierId, supplierId));
  return parseFloat(result?.total ?? "0");
}

router.get("/suppliers", async (req, res) => {
  const { search } = req.query;
  const suppliers = await db
    .select()
    .from(suppliersTable)
    .where(search ? ilike(suppliersTable.name, `%${search}%`) : undefined)
    .orderBy(suppliersTable.name);

  const result = await Promise.all(suppliers.map(async s => ({
    ...s,
    currentDebt: await getSupplierDebt(s.id),
  })));
  res.json(result);
});

router.post("/suppliers", async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [supp] = await db.insert(suppliersTable).values(parsed.data).returning();
  res.status(201).json({ ...supp, currentDebt: 0 });
});

router.get("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [supp] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, id));
  if (!supp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...supp, currentDebt: await getSupplierDebt(id) });
});

router.patch("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [supp] = await db.update(suppliersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(suppliersTable.id, id)).returning();
  if (!supp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...supp, currentDebt: await getSupplierDebt(id) });
});

router.delete("/suppliers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(suppliersTable).where(eq(suppliersTable.id, id));
  res.status(204).send();
});

export default router;
