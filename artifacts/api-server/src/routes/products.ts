import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, productRollsTable } from "@workspace/db";
import { eq, ilike, and, lte, sql, inArray } from "drizzle-orm";
import { CreateProductBody, UpdateProductBody, CreateProductRollBody, UpdateProductRollBody } from "@workspace/api-zod";
import { pushService } from "../lib/push";

const router = Router();

async function syncProductStockFromRolls(productId: number) {
  const existingRolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, productId), eq(productRollsTable.status, "available")));
  const rollStock = existingRolls.length;
  const meterStock = existingRolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);
  await db.update(productsTable).set({
    rollStock: String(rollStock),
    meterStock: String(meterStock)
  }).where(eq(productsTable.id, productId));
}

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
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      costPricePerMeter: productsTable.costPricePerMeter,
      costPricePerRoll: productsTable.costPricePerRoll,
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
    costPricePerMeter: parseFloat(p.costPricePerMeter ?? "0"),
    costPricePerRoll: p.costPricePerRoll ? parseFloat(p.costPricePerRoll) : null,
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

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const barcodeToSave = d.barcode ? d.barcode : `PRD-${Date.now()}`;
  const [prod] = await db.insert(productsTable).values({
    ...d,
    barcode: barcodeToSave,
    primaryUnit: d.primaryUnit || "METER",
    secondaryUnit: d.secondaryUnit || "ROLL",
    costPricePerMeter: String(d.costPricePerMeter ?? 0),
    costPricePerRoll: d.costPricePerRoll != null ? String(d.costPricePerRoll) : null,
    pricePerMeter: String(d.pricePerMeter ?? 0),
    pricePerRoll: d.pricePerRoll != null ? String(d.pricePerRoll) : null,
    rollStock: String(d.rollStock ?? 0),
    meterStock: String(d.meterStock ?? 0),
    minStock: String(d.minStock ?? 0),
  }).returning();
    
    const rollStockNum = Math.floor(d.rollStock ?? 0);
    const meterStockNum = d.meterStock ?? 0;
    if (rollStockNum > 0) {
      const avgLength = (meterStockNum / rollStockNum).toFixed(3);
      const rollsToInsert = Array.from({ length: rollStockNum }).map((_, i) => ({
        productId: prod.id,
        barcode: `${prod.barcode}-R${Date.now()}-${i + 1}`,
        originalLength: String(avgLength),
        currentLength: String(avgLength),
        status: "available",
      }));
      await db.insert(productRollsTable).values(rollsToInsert);
    }
    
  res.status(201).json({
    ...prod,
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
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
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      costPricePerMeter: productsTable.costPricePerMeter,
      costPricePerRoll: productsTable.costPricePerRoll,
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
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: parseFloat(prod.meterStock ?? "0") <= parseFloat(prod.minStock ?? "0"),
  });
});

router.get("/products/:id/rolls", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rolls = await db
    .select()
    .from(productRollsTable)
    .where(and(eq(productRollsTable.productId, id), eq(productRollsTable.status, "available")))
    .orderBy(productRollsTable.createdAt);
  
  res.json(rolls.map(r => ({
    ...r,
    originalLength: parseFloat(r.originalLength),
    currentLength: parseFloat(r.currentLength),
    createdAt: r.createdAt.toISOString()
  })));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.name != null) updateData.name = d.name;
  if (d.categoryId != null) updateData.categoryId = d.categoryId;
  if (d.barcode != null) updateData.barcode = d.barcode;
  if (d.primaryUnit != null) updateData.primaryUnit = d.primaryUnit;
  if (d.secondaryUnit != null) updateData.secondaryUnit = d.secondaryUnit;
  if (d.lotNumber != null) updateData.lotNumber = d.lotNumber;
  if (d.rackLocation != null) updateData.rackLocation = d.rackLocation;
  if (d.costPricePerMeter != null) updateData.costPricePerMeter = String(d.costPricePerMeter);
  if (d.costPricePerRoll != null) updateData.costPricePerRoll = String(d.costPricePerRoll);
  if (d.pricePerMeter != null) updateData.pricePerMeter = String(d.pricePerMeter);
  if (d.pricePerRoll != null) updateData.pricePerRoll = String(d.pricePerRoll);
  if (d.minStock != null) updateData.minStock = String(d.minStock);
  if (d.rollStock != null) updateData.rollStock = String(d.rollStock);
  if (d.meterStock != null) updateData.meterStock = String(d.meterStock);
  const [prod] = await db.update(productsTable).set(updateData as any).where(eq(productsTable.id, id)).returning();
  if (!prod) { res.status(404).json({ error: "Not found" }); return; }
  
  // Sync rolls
  const rollStockNum = Math.floor(parseFloat(prod.rollStock ?? "0"));
  const meterStockNum = parseFloat(prod.meterStock ?? "0");
  if (rollStockNum >= 0) {
    const existingRolls = await db.select().from(productRollsTable).where(eq(productRollsTable.productId, id));
    const currentRollCount = existingRolls.length;
    
    if (rollStockNum > currentRollCount) {
      const diff = rollStockNum - currentRollCount;
      const avgLength = rollStockNum > 0 ? (meterStockNum / rollStockNum).toFixed(3) : "0";
      const rollsToInsert = Array.from({ length: diff }).map((_, i) => ({
        productId: prod.id,
        barcode: `${prod.barcode || `PRD-${prod.id}`}-R${Date.now()}-${i + 1}`,
        originalLength: String(avgLength),
        currentLength: String(avgLength),
        status: "available",
      }));
      if (rollsToInsert.length > 0) {
        await db.insert(productRollsTable).values(rollsToInsert);
      }
    } else if (rollStockNum < currentRollCount) {
      const diff = currentRollCount - rollStockNum;
      const availableRolls = existingRolls.filter(r => r.status === "available").sort((a, b) => b.id - a.id);
      const rollsToDelete = availableRolls.slice(0, diff).map(r => r.id);
      if (rollsToDelete.length > 0) {
        await db.delete(productRollsTable).where(inArray(productRollsTable.id, rollsToDelete));
      }
    }
  }

  try {
    await pushService.sendNotificationToAdmins(
      "📝 Perubahan Data Barang",
      `Data barang "${prod.name}" baru saja diubah.`,
      `/barang`
    );
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }

  res.json({
    ...prod,
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
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
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: "Gagal menghapus barang. Pastikan barang tidak memiliki riwayat transaksi/mutasi." });
  }
});

router.post("/products/:id/rolls", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = CreateProductRollBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  
  const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!prod) { res.status(404).json({ error: "Product not found" }); return; }

  const barcodeToSave = d.barcode ? d.barcode : `${prod.barcode || `PRD-${prod.id}`}-R${Date.now()}`;
  const [newRoll] = await db.insert(productRollsTable).values({
    productId: id,
    barcode: barcodeToSave,
    originalLength: String(d.originalLength),
    currentLength: String(d.currentLength),
    status: "available",
  }).returning();
  
  await syncProductStockFromRolls(id);
  
  res.status(201).json({
    ...newRoll,
    originalLength: parseFloat(newRoll.originalLength),
    currentLength: parseFloat(newRoll.currentLength),
    createdAt: newRoll.createdAt.toISOString()
  });
});

router.patch("/products/:id/rolls/:rollId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rollId = parseInt(req.params.rollId);
  const parsed = UpdateProductRollBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.barcode != null) updateData.barcode = d.barcode;
  if (d.originalLength != null) updateData.originalLength = String(d.originalLength);
  if (d.currentLength != null) updateData.currentLength = String(d.currentLength);

  const [updatedRoll] = await db.update(productRollsTable).set(updateData as any).where(and(eq(productRollsTable.id, rollId), eq(productRollsTable.productId, id))).returning();
  if (!updatedRoll) { res.status(404).json({ error: "Roll not found" }); return; }

  await syncProductStockFromRolls(id);

  res.json({
    ...updatedRoll,
    originalLength: parseFloat(updatedRoll.originalLength),
    currentLength: parseFloat(updatedRoll.currentLength),
    createdAt: updatedRoll.createdAt.toISOString()
  });
});

router.delete("/products/:id/rolls/:rollId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rollId = parseInt(req.params.rollId);
  await db.delete(productRollsTable).where(and(eq(productRollsTable.id, rollId), eq(productRollsTable.productId, id)));
  
  await syncProductStockFromRolls(id);
  
  res.status(204).send();
});

export default router;
