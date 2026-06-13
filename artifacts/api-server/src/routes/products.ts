import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, lte, sql } from "drizzle-orm";
import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  const { categoryId, search, lowStock } = req.query;
  const conditions = [];
  if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId as string)));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
      minStock: productsTable.minStock,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.name);

  const result = products.map(p => ({
    ...p,
    pricePerMeter: parseFloat(p.pricePerMeter ?? "0"),
    pricePerRoll: p.pricePerRoll ? parseFloat(p.pricePerRoll) : null,
    rollStock: parseFloat(p.rollStock ?? "0"),
    meterStock: parseFloat(p.meterStock ?? "0"),
    minStock: parseFloat(p.minStock ?? "0"),
    isLowStock: parseFloat(p.meterStock ?? "0") <= parseFloat(p.minStock ?? "0"),
  }));

  if (lowStock === "true") { res.json(result.filter(p => p.isLowStock)); return; }
  res.json(result);
});

router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const d = parsed.data;
  const [prod] = await db.insert(productsTable).values({
    ...d,
    pricePerMeter: String(d.pricePerMeter ?? 0),
    pricePerRoll: d.pricePerRoll != null ? String(d.pricePerRoll) : null,
    rollStock: String(d.rollStock ?? 0),
    meterStock: String(d.meterStock ?? 0),
    minStock: String(d.minStock ?? 0),
  }).returning();
  res.status(201).json({
    ...prod,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: false,
    categoryName: null,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [prod] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
      minStock: productsTable.minStock,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));
  if (!prod) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...prod,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: parseFloat(prod.meterStock ?? "0") <= parseFloat(prod.minStock ?? "0"),
  });
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.name != null) updateData.name = d.name;
  if (d.categoryId != null) updateData.categoryId = d.categoryId;
  if (d.lotNumber != null) updateData.lotNumber = d.lotNumber;
  if (d.rackLocation != null) updateData.rackLocation = d.rackLocation;
  if (d.pricePerMeter != null) updateData.pricePerMeter = String(d.pricePerMeter);
  if (d.pricePerRoll != null) updateData.pricePerRoll = String(d.pricePerRoll);
  if (d.minStock != null) updateData.minStock = String(d.minStock);
  const [prod] = await db.update(productsTable).set(updateData as any).where(eq(productsTable.id, id)).returning();
  if (!prod) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...prod,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: parseFloat(prod.meterStock ?? "0") <= parseFloat(prod.minStock ?? "0"),
    categoryName: null,
  });
});

router.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
