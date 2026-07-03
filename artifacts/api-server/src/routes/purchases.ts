import { Router } from "express";
import { db } from "@workspace/db";
import { purchasesTable, purchaseItemsTable, suppliersTable, productsTable, payablesTable, stockMutationsTable, productRollsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
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

  const invoiceNumber = `PO-${Date.now()}`;

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
    // Create product roll if barcode is provided
    let insertedRollId: number | null = null;
    if (item.barcode) {
      const [roll] = await db.insert(productRollsTable).values({
        productId: item.productId,
        barcode: item.barcode,
        originalLength: item.meters.toString(),
        currentLength: item.meters.toString(),
        status: "available",
      }).returning();
      insertedRollId = roll.id;
    }

    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      productId: item.productId,
      rollId: insertedRollId,
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      pricePerMeter: item.pricePerMeter.toString(),
      subtotal: item.subtotal.toString(),
    });
    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = roll_stock + ${item.rolls}, meter_stock = meter_stock + ${item.meters}, updated_at = NOW()
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
      rollId: purchaseItemsTable.rollId,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .where(eq(purchaseItemsTable.purchaseId, id));

  res.json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    items: items.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
    })),
  });
});

export default router;
