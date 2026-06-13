import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, saleItemsTable, customersTable, productsTable, receivablesTable, stockMutationsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { CreateSaleBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/sales", async (req, res) => {
  const { customerId, status, startDate, endDate } = req.query;
  const conditions: any[] = [];
  if (customerId) conditions.push(eq(salesTable.customerId, parseInt(customerId as string)));
  if (status) conditions.push(sql`${salesTable.status} = ${status}`);
  if (startDate) conditions.push(gte(salesTable.createdAt, new Date(startDate as string)));
  if (endDate) conditions.push(lte(salesTable.createdAt, new Date(endDate as string)));

  const sales = await db
    .select({
      id: salesTable.id,
      invoiceNumber: salesTable.invoiceNumber,
      customerId: salesTable.customerId,
      customerName: customersTable.name,
      paymentType: salesTable.paymentType,
      totalAmount: salesTable.totalAmount,
      paidAmount: salesTable.paidAmount,
      status: salesTable.status,
      dueDate: salesTable.dueDate,
      notes: salesTable.notes,
      createdAt: salesTable.createdAt,
    })
    .from(salesTable)
    .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(salesTable.createdAt);

  res.json(sales.map(s => ({
    ...s,
    totalAmount: numStr(s.totalAmount),
    paidAmount: numStr(s.paidAmount),
    remainingAmount: numStr(s.totalAmount) - numStr(s.paidAmount),
    dueDate: s.dueDate?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { customerId, paymentType, dueDate, notes, items } = parsed.data;
  const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);
  const paidAmount = paymentType === "tunai" || paymentType === "transfer" || paymentType === "cashless" ? totalAmount : 0;
  const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

  const counter = await db.select({ count: sql<number>`count(*)` }).from(salesTable);
  const invoiceNumber = `INV-${Date.now()}`;

  const [sale] = await db.insert(salesTable).values({
    invoiceNumber,
    customerId: customerId ?? null,
    paymentType,
    totalAmount: totalAmount.toString(),
    paidAmount: paidAmount.toString(),
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
    notes: notes ?? null,
  }).returning();

  // Insert items and update stock
  for (const item of items) {
    await db.insert(saleItemsTable).values({
      saleId: sale.id,
      productId: item.productId,
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      pricePerMeter: item.pricePerMeter.toString(),
      subtotal: item.subtotal.toString(),
    });
    // Decrease stock
    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = roll_stock - ${item.rolls}, meter_stock = meter_stock - ${item.meters}, updated_at = NOW()
      WHERE id = ${item.productId}
    `);
    // Log mutation
    await db.insert(stockMutationsTable).values({
      productId: item.productId,
      type: "keluar",
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      description: `Penjualan ${invoiceNumber}`,
      reference: invoiceNumber,
    });
  }

  // Create receivable for tempo sales
  if (status !== "lunas" && customerId) {
    await db.insert(receivablesTable).values({
      saleId: sale.id,
      customerId,
      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      status: status === "partial" ? "partial" : "unpaid",
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  broadcastRefresh();
  res.status(201).json({
    ...sale,
    totalAmount: numStr(sale.totalAmount),
    paidAmount: numStr(sale.paidAmount),
    remainingAmount: numStr(sale.totalAmount) - numStr(sale.paidAmount),
    dueDate: sale.dueDate?.toISOString() ?? null,
    createdAt: sale.createdAt.toISOString(),
    customerName: null,
  });
});

router.get("/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [sale] = await db
    .select({
      id: salesTable.id,
      invoiceNumber: salesTable.invoiceNumber,
      customerId: salesTable.customerId,
      customerName: customersTable.name,
      paymentType: salesTable.paymentType,
      totalAmount: salesTable.totalAmount,
      paidAmount: salesTable.paidAmount,
      status: salesTable.status,
      dueDate: salesTable.dueDate,
      notes: salesTable.notes,
      createdAt: salesTable.createdAt,
    })
    .from(salesTable)
    .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
    .where(eq(salesTable.id, id));

  if (!sale) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      productId: saleItemsTable.productId,
      productName: productsTable.name,
      rolls: saleItemsTable.rolls,
      meters: saleItemsTable.meters,
      pricePerMeter: saleItemsTable.pricePerMeter,
      subtotal: saleItemsTable.subtotal,
    })
    .from(saleItemsTable)
    .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
    .where(eq(saleItemsTable.saleId, id));

  res.json({
    ...sale,
    totalAmount: numStr(sale.totalAmount),
    paidAmount: numStr(sale.paidAmount),
    remainingAmount: numStr(sale.totalAmount) - numStr(sale.paidAmount),
    dueDate: sale.dueDate?.toISOString() ?? null,
    createdAt: sale.createdAt.toISOString(),
    items: items.map(i => ({
      ...i,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
    })),
  });
});

router.delete("/sales/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(saleItemsTable).where(eq(saleItemsTable.saleId, id));
  await db.delete(salesTable).where(eq(salesTable.id, id));
  broadcastRefresh();
  res.status(204).send();
});

export default router;
