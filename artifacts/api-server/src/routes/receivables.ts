import { Router } from "express";
import { db } from "@workspace/db";
import { receivablesTable, customersTable, salesTable, paymentsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { AddReceivablePaymentBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/receivables", async (req, res): Promise<void> => {
  const { customerId, status, overdue } = req.query;
  const conditions: any[] = [];
  if (customerId) conditions.push(eq(receivablesTable.customerId, parseInt(customerId as string)));
  if (status) conditions.push(sql`${receivablesTable.status} = ${status}`);

  const receivables = await db
    .select({
      id: receivablesTable.id,
      saleId: receivablesTable.saleId,
      invoiceNumber: salesTable.invoiceNumber,
      customerId: receivablesTable.customerId,
      customerName: customersTable.name,
      totalAmount: receivablesTable.totalAmount,
      paidAmount: receivablesTable.paidAmount,
      status: receivablesTable.status,
      dueDate: receivablesTable.dueDate,
      createdAt: receivablesTable.createdAt,
    })
    .from(receivablesTable)
    .leftJoin(customersTable, eq(receivablesTable.customerId, customersTable.id))
    .leftJoin(salesTable, eq(receivablesTable.saleId, salesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(receivablesTable.createdAt));

  const now = new Date();
  const result = receivables.map(r => ({
    ...r,
    totalAmount: numStr(r.totalAmount),
    paidAmount: numStr(r.paidAmount),
    remainingAmount: numStr(r.totalAmount) - numStr(r.paidAmount),
    dueDate: r.dueDate?.toISOString() ?? null,
    isOverdue: r.dueDate ? r.dueDate < now && r.status !== "lunas" : false,
    createdAt: r.createdAt.toISOString(),
  }));

  if (overdue === "true") { res.json(result.filter(r => r.isOverdue)); return; }
  res.json(result);
});

router.get("/receivables/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [rec] = await db
    .select({
      id: receivablesTable.id,
      saleId: receivablesTable.saleId,
      invoiceNumber: salesTable.invoiceNumber,
      customerId: receivablesTable.customerId,
      customerName: customersTable.name,
      totalAmount: receivablesTable.totalAmount,
      paidAmount: receivablesTable.paidAmount,
      status: receivablesTable.status,
      dueDate: receivablesTable.dueDate,
      createdAt: receivablesTable.createdAt,
    })
    .from(receivablesTable)
    .leftJoin(customersTable, eq(receivablesTable.customerId, customersTable.id))
    .leftJoin(salesTable, eq(receivablesTable.saleId, salesTable.id))
    .where(eq(receivablesTable.id, id));

  if (!rec) { res.status(404).json({ error: "Not found" }); return; }

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.receivableId, id))
    .orderBy(desc(paymentsTable.paidAt));

  const now = new Date();
  res.json({
    ...rec,
    totalAmount: numStr(rec.totalAmount),
    paidAmount: numStr(rec.paidAmount),
    remainingAmount: numStr(rec.totalAmount) - numStr(rec.paidAmount),
    dueDate: rec.dueDate?.toISOString() ?? null,
    isOverdue: rec.dueDate ? rec.dueDate < now && rec.status !== "lunas" : false,
    createdAt: rec.createdAt.toISOString(),
    payments: payments.map(p => ({
      ...p,
      amount: numStr(p.amount),
      paidAt: p.paidAt.toISOString(),
    })),
  });
});

router.post("/receivables/:id/payments", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = AddReceivablePaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [rec] = await db.select().from(receivablesTable).where(eq(receivablesTable.id, id));
  if (!rec) { res.status(404).json({ error: "Not found" }); return; }

  const [payment] = await db.insert(paymentsTable).values({
    receivableId: id,
    amount: parsed.data.amount.toString(),
    paymentMethod: parsed.data.paymentMethod,
    notes: parsed.data.notes ?? null,
  }).returning();

  const newPaidAmount = numStr(rec.paidAmount) + parsed.data.amount;
  const totalAmount = numStr(rec.totalAmount);
  const newStatus = newPaidAmount >= totalAmount ? "lunas" : "partial";

  await db.update(receivablesTable).set({
    paidAmount: newPaidAmount.toString(),
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(receivablesTable.id, id));

  // Update linked sale
  await db.execute(sql`
    UPDATE sales 
    SET paid_amount = paid_amount + ${parsed.data.amount},
        status = CASE WHEN paid_amount + ${parsed.data.amount} >= total_amount THEN 'lunas' ELSE 'partial' END,
        updated_at = NOW()
    WHERE id = ${rec.saleId}
  `);

  broadcastRefresh();

  // Trigger push notification for payment
  try {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, rec.customerId));
    const customerName = customer?.name ?? "Umum";
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parsed.data.amount);
    
    // Import pushService at the top is needed! Wait, let's just require it if we didn't import it, but I'll import it at the top later.
    const { pushService } = require("../lib/push");
    await pushService.sendNotificationToAdmins(
      "💰 Pembayaran Piutang",
      `Pelanggan: ${customerName}\nJumlah Bayar: ${formattedAmount}\nMetode: ${parsed.data.paymentMethod.toUpperCase()}`,
      `/piutang`
    );
  } catch (e) {
    console.error("Gagal kirim notif pembayaran piutang", e);
  }
  res.status(201).json({
    ...payment,
    amount: numStr(payment.amount),
    paidAt: payment.paidAt.toISOString(),
  });
});

export default router;
