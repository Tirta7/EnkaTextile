import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, receivablesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { CreateCustomerBody, UpdateCustomerBody } from "@workspace/api-zod";

const router = Router();

async function getCustomerDebt(customerId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<string>`coalesce(sum(${receivablesTable.totalAmount} - ${receivablesTable.paidAmount}), 0)` })
    .from(receivablesTable)
    .where(eq(receivablesTable.customerId, customerId));
  return parseFloat(result?.total ?? "0");
}

router.get("/customers", async (req, res): Promise<void> => {
  const { search, overLimit } = req.query;
  const customers = await db
    .select()
    .from(customersTable)
    .where(search ? ilike(customersTable.name, `%${search}%`) : undefined)
    .orderBy(customersTable.name);

  const result = await Promise.all(customers.map(async c => {
    const currentDebt = await getCustomerDebt(c.id);
    const creditLimit = parseFloat(c.creditLimit ?? "0");
    return {
      ...c,
      creditLimit,
      currentDebt,
      isOverLimit: currentDebt > creditLimit,
    };
  }));

  if (overLimit === "true") { res.json(result.filter(c => c.isOverLimit)); return; }
  res.json(result);
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const [cust] = await db.insert(customersTable).values({
    ...d,
    creditLimit: d.creditLimit != null ? String(d.creditLimit) : undefined
  }).returning();
  res.status(201).json({ ...cust, creditLimit: parseFloat(cust.creditLimit ?? "0"), currentDebt: 0, isOverLimit: false });
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({ ...cust, creditLimit, currentDebt, isOverLimit: currentDebt > creditLimit });
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: any = { ...d, updatedAt: new Date() };
  if (d.creditLimit != null) updateData.creditLimit = String(d.creditLimit);
  const [cust] = await db.update(customersTable).set(updateData).where(eq(customersTable.id, id)).returning();
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({ ...cust, creditLimit, currentDebt, isOverLimit: currentDebt > creditLimit });
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: "Gagal menghapus pelanggan. Pastikan pelanggan tidak memiliki transaksi terkait." });
  }
});

router.get("/customers/:id/credit-status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({
    customerId: id,
    creditLimit,
    currentDebt,
    available: Math.max(0, creditLimit - currentDebt),
    isOverLimit: currentDebt > creditLimit,
  });
});

export default router;
