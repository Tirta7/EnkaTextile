import { Router } from "express";
import { db } from "@workspace/db";
import { purchasesTable, purchaseItemsTable, suppliersTable, productsTable, payablesTable, paymentsTable, stockMutationsTable, productRollsTable, saleItemsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";
import { CreatePurchaseBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/purchases", async (req, res) => {
  const { supplierId, startDate, endDate } = req.query;
  const conditions: any[] = [];
  if (supplierId) conditions.push(eq(purchasesTable.supplierId, parseInt(supplierId as string)));
  if (startDate) conditions.push(gte(purchasesTable.createdAt, new Date(startDate as string)));
  if (endDate) conditions.push(lte(purchasesTable.createdAt, new Date(endDate as string)));

  const purchases = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(purchasesTable.createdAt));

  res.json(purchases.map(p => ({
    ...p,
    totalAmount: numStr(p.totalAmount),
    paidAmount: numStr(p.paidAmount),
    remainingAmount: numStr(p.totalAmount) - numStr(p.paidAmount),
    dueDate: p.dueDate?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/purchases", async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { supplierId, paymentType, dueDate, notes, items } = parsed.data;
  const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);
  const paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
  const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

  const invoiceNumber = parsed.data.invoiceNumber || `PO-${Date.now()}`;

  const [purchase] = await db.insert(purchasesTable).values({
    invoiceNumber,
    supplierId,
    paymentType,
    totalAmount: totalAmount.toString(),
    paidAmount: paidAmount.toString(),
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
    notes: notes ?? null,
  }).returning();

  for (const item of items) {
    const rollCount = Number(item.rolls) || 0;
    const totalMeters = Number(item.meters) || 0;
    
    // Auto-generate rolls if roll count > 0
    let insertedRollId: number | null = null;
    
    if (rollCount > 0) {
      const avgLength = totalMeters / rollCount;
      const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      const baseBarcode = prod?.barcode || `PRD-${item.productId}`;
      
      for (let i = 0; i < rollCount; i++) {
        // Only use the user-provided barcode for the first roll if specified, otherwise generate
        const barcodeToSave = (item.barcode && i === 0) ? item.barcode : `${baseBarcode}-R${Date.now()}-${i}`;
        
        // @ts-ignore - rollLengths exists on our updated schema
        const lengthToUse = (item.rollLengths && item.rollLengths[i]) ? item.rollLengths[i] : avgLength;
        
        const [roll] = await db.insert(productRollsTable).values({
          productId: item.productId,
          barcode: barcodeToSave,
          originalLength: lengthToUse.toString(),
          currentLength: lengthToUse.toString(),
          status: "available",
        }).returning();
        
        if (i === 0) insertedRollId = roll.id;
      }
    }

    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      productId: item.productId,
      rollId: insertedRollId,
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      pricePerMeter: item.pricePerMeter.toString(),
      subtotal: item.subtotal.toString(),
      // Simpan panjang tiap roll sebagai JSON agar bisa dipulihkan saat restore
      rollLengthsJson: (item.rollLengths && item.rollLengths.length > 0)
        ? JSON.stringify(item.rollLengths.map((l: any) => parseFloat(String(l).replace(',', '.')) || 0))
        : null,
    } as any);
    
    // Sync the product's meter_stock and roll_stock based on the productRollsTable
    const rolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, item.productId), eq(productRollsTable.status, "available")));
    const calculatedRollStock = rolls.length;
    const calculatedMeterStock = rolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);

    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = ${calculatedRollStock}, meter_stock = ${calculatedMeterStock}, updated_at = NOW()
      WHERE id = ${item.productId}
    `);
    
    await db.insert(stockMutationsTable).values({
      productId: item.productId,
      type: "masuk",
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      description: `Pembelian ${invoiceNumber}`,
      reference: invoiceNumber,
    });
  }

  if (status !== "lunas") {
    await db.insert(payablesTable).values({
      purchaseId: purchase.id,
      supplierId,
      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      status: status === "partial" ? "partial" : "unpaid",
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  broadcastRefresh();
  res.status(201).json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    supplierName: null,
  });
});

// ────────── GET by invoice number (for restore cancelled purchase) ──────────
// MUST be registered BEFORE /purchases/:id to avoid Express matching "by-invoice" as an id
router.get("/purchases/by-invoice", async (req, res): Promise<void> => {
  const invoiceNumber = req.query.invoice as string;
  const [purchase] = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(eq(purchasesTable.invoiceNumber, invoiceNumber));

  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      productId: purchaseItemsTable.productId,
      productName: productsTable.name,
      categoryId: productsTable.categoryId,
      rollId: purchaseItemsTable.rollId,
      rollLengthsJson: purchaseItemsTable.rollLengthsJson,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      barcode: productsTable.barcode,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .where(eq(purchaseItemsTable.purchaseId, purchase.id));

  const itemsWithRolls = await Promise.all(items.map(async (i) => {
    const rollCount = Number(i.rolls) || 0;
    let rollLengths: number[] = [];

    if (rollCount > 0) {
      // Priority 1: gunakan rollLengthsJson yang tersimpan saat pembelian dibuat
      if (i.rollLengthsJson) {
        try {
          const parsed = JSON.parse(i.rollLengthsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rollLengths = parsed.map(Number);
          }
        } catch {}
      }

      // Priority 2: coba ambil dari productRollsTable jika rollId masih ada
      if (rollLengths.length === 0 && i.rollId) {
        const rollIds = Array.from({ length: rollCount }, (_, idx) => (i.rollId as number) + idx);
        const rolls = await db
          .select({ id: productRollsTable.id, length: productRollsTable.originalLength })
          .from(productRollsTable)
          .where(inArray(productRollsTable.id, rollIds));
        if (rolls.length > 0) {
          rollLengths = rolls.map(r => parseFloat(r.length));
        }
      }

      // Priority 3: fallback ke rata-rata
      if (rollLengths.length === 0) {
        const avg = Number(i.meters) / rollCount;
        rollLengths = Array.from({ length: rollCount }, () => parseFloat(avg.toFixed(3)));
      }
    }
    return { ...i, rollLengths };
  }));

  res.json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    items: itemsWithRolls.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
      rollLengths: i.rollLengths,
    })),
  });
});

router.get("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [purchase] = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(eq(purchasesTable.id, id));

  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      productId: purchaseItemsTable.productId,
      productName: productsTable.name,
      categoryId: productsTable.categoryId,
      rollId: purchaseItemsTable.rollId,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .where(eq(purchaseItemsTable.purchaseId, id));

  const itemsWithRolls = await Promise.all(items.map(async (i) => {
    const rollCount = Number(i.rolls) || 0;
    let rollLengths: number[] = [];
    if (rollCount > 0 && i.rollId) {
      const rollIds = Array.from({ length: rollCount }, (_, idx) => (i.rollId as number) + idx);
      const rolls = await db.select({ length: productRollsTable.originalLength }).from(productRollsTable).where(inArray(productRollsTable.id, rollIds));
      rollLengths = rolls.map(r => parseFloat(r.length));
    }
    return { ...i, rollLengths };
  }));

  res.json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    items: itemsWithRolls.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
      rollLengths: i.rollLengths,
    })),
  });

});

router.delete("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [purchase] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, id));
  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  try {
    // Get items into memory first (kept for stock rollback & mutations)
    const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, id));

    for (const item of items) {
      const rollCount = Number(item.rolls) || 0;
      if (rollCount > 0 && item.rollId) {
        // Delete rolls created for this purchase item using barcode pattern (PO invoice number)
        // Rolls created by this purchase have IDs starting from item.rollId (first roll inserted)
        const rollIds = Array.from({ length: rollCount }, (_, i) => (item.rollId as number) + i);
        
        // Only delete rolls that still belong to this product (safety check)
        const rollsToDelete = await db.select()
          .from(productRollsTable)
          .where(
            and(
              eq(productRollsTable.productId, item.productId),
              inArray(productRollsTable.id, rollIds)
            )
          );

        if (rollsToDelete.length > 0) {
          const rollIdsToDelete = rollsToDelete.map(r => r.id);
          // Unlink from sale_items to avoid FK constraint
          await db.update(saleItemsTable).set({ rollId: null }).where(inArray(saleItemsTable.rollId, rollIdsToDelete));
          // Unlink from purchase_items to avoid FK constraint (soft delete keeps purchase_items)
          await db.update(purchaseItemsTable).set({ rollId: null }).where(inArray(purchaseItemsTable.rollId, rollIdsToDelete));
          await db.delete(productRollsTable).where(inArray(productRollsTable.id, rollIdsToDelete));
        }
      }

      // Record stock mutation
      await db.insert(stockMutationsTable).values({
        productId: item.productId,
        type: "keluar",
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        description: `Batal Pembelian ${purchase.invoiceNumber}`,
        reference: purchase.invoiceNumber,
      });

      // Sync product stock
      const rolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, item.productId), eq(productRollsTable.status, "available")));
      const calculatedRollStock = rolls.length;
      const calculatedMeterStock = rolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);

      await db.execute(sql`
        UPDATE ${productsTable} 
        SET roll_stock = ${calculatedRollStock}, meter_stock = ${calculatedMeterStock}, updated_at = NOW()
        WHERE id = ${item.productId}
      `);
    }

    // Find and delete payments linked to payables of this purchase
    const relatedPayables = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, id));
    if (relatedPayables.length > 0) {
      for (const payable of relatedPayables) {
        await db.delete(paymentsTable).where(eq(paymentsTable.payableId, payable.id));
      }
      await db.delete(payablesTable).where(eq(payablesTable.purchaseId, id));
    }

    // SOFT DELETE: mark purchase as cancelled instead of hard deleting
    // This preserves purchase_items so detail roll can be restored later
    await db.update(purchasesTable).set({ status: "cancelled" } as any).where(eq(purchasesTable.id, id));

    broadcastRefresh();
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting purchase:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
