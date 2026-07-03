import { Router } from "express";
import { db } from "@workspace/db";
import { payablesTable, suppliersTable, purchasesTable, paymentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { AddPayablePaymentBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/payables", async (req, res) => {
  const { supplierId, status } = req.query;
  const conditions: any[] = [];
  if (supplierId) conditions.push(eq(payablesTable.supplierId, parseInt(supplierId as string)));
  if (status) conditions.push(sql`${payablesTable.status} = ${status}`);

  const payables = await db
    .select({
      id: payablesTable.id,
      purchaseId: payablesTable.purchaseId,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: payablesTable.supplierId,
      supplierName: suppliersTable.name,
      totalAmount: payablesTable.totalAmount,
      paidAmount: payablesTable.paidAmount,
      status: payablesTable.status,
      dueDate: payablesTable.dueDate,
      createdAt: payablesTable.createdAt,
    })
    .from(payablesTable)
    .leftJoin(suppliersTable, eq(payablesTable.supplierId, suppliersTable.id))
    .leftJoin(purchasesTable, eq(payablesTable.purchaseId, purchasesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(payablesTable.createdAt);

  const now = new Date();
  res.json(payables.map(p => ({
    ...p,
    totalAmount: numStr(p.totalAmount),
    paidAmount: numStr(p.paidAmount),
    remainingAmount: numStr(p.totalAmount) - numStr(p.paidAmount),
    dueDate: p.dueDate?.toISOString() ?? null,
    isOverdue: p.dueDate ? p.dueDate < now && p.status !== "lunas" : false,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/payables/:id/payments", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = AddPayablePaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [pay] = await db.select().from(payablesTable).where(eq(payablesTable.id, id));
  if (!pay) { res.status(404).json({ error: "Not found" }); return; }

  const [payment] = await db.insert(paymentsTable).values({
    payableId: id,
    amount: parsed.data.amount.toString(),
    paymentMethod: parsed.data.paymentMethod,
    notes: parsed.data.notes ?? null,
  }).returning();

  const newPaidAmount = numStr(pay.paidAmount) + parsed.data.amount;
  const totalAmount = numStr(pay.totalAmount);
  const newStatus = newPaidAmount >= totalAmount ? "lunas" : "partial";

  await db.update(payablesTable).set({
    paidAmount: newPaidAmount.toString(),
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(payablesTable.id, id));

  broadcastRefresh();

  // Trigger push notification for payment
  try {
    const [supplier] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, pay.supplierId));
    const supplierName = supplier?.name ?? "Umum";
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parsed.data.amount);
    
    const { pushService } = require("../lib/push");
    await pushService.sendNotificationToAdmins(
      "💸 Pembayaran Hutang",
      `Supplier: ${supplierName}\nJumlah Bayar: ${formattedAmount}\nMetode: ${parsed.data.paymentMethod.toUpperCase()}`,
      `/hutang`
    );
  } catch (e) {
    console.error("Gagal kirim notif pembayaran hutang", e);
  }
  res.status(201).json({
    ...payment,
    amount: numStr(payment.amount),
    paidAt: payment.paidAt.toISOString(),
  });
});

export default router;
