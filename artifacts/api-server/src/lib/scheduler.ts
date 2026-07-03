import cron from "node-cron";
import { db } from "@workspace/db";
import { receivablesTable, payablesTable, customersTable, suppliersTable, salesTable, purchasesTable } from "@workspace/db";
import { lte, inArray, eq, and, isNotNull } from "drizzle-orm";
import { pushService } from "./push";
import { logger } from "./logger";

export function startScheduler() {
  // Berjalan setiap jam 08:00 pagi setiap hari
  cron.schedule("0 8 * * *", async () => {
    logger.info("Menjalankan pengecekan tagihan jatuh tempo harian...");
    try {
      await checkDueReceivables();
      await checkDuePayables();
    } catch (error) {
      logger.error(error, "Gagal menjalankan scheduler tagihan");
    }
  });
}

async function checkDueReceivables() {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Hingga akhir hari ini

  const dueReceivables = await db.select({
    id: receivablesTable.id,
    amount: receivablesTable.totalAmount,
    paid: receivablesTable.paidAmount,
    dueDate: receivablesTable.dueDate,
    customerName: customersTable.name,
    invoice: salesTable.invoiceNumber
  })
  .from(receivablesTable)
  .innerJoin(customersTable, eq(receivablesTable.customerId, customersTable.id))
  .innerJoin(salesTable, eq(receivablesTable.saleId, salesTable.id))
  .where(
    and(
      inArray(receivablesTable.status, ["unpaid", "partial"]),
      isNotNull(receivablesTable.dueDate),
      lte(receivablesTable.dueDate, today)
    )
  );

  for (const r of dueReceivables) {
    const remaining = parseFloat(r.amount as string) - parseFloat(r.paid as string);
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(remaining);
    
    try {
      await pushService.sendNotificationToAdmins(
        "⏰ Piutang Jatuh Tempo",
        `Pelanggan: ${r.customerName}\nInvoice: ${r.invoice}\nSisa Tagihan: ${formattedAmount}`,
        `/piutang`
      );
    } catch (e) {
      logger.error(e, "Gagal kirim notif piutang due");
    }
  }
}

async function checkDuePayables() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const duePayables = await db.select({
    id: payablesTable.id,
    amount: payablesTable.totalAmount,
    paid: payablesTable.paidAmount,
    dueDate: payablesTable.dueDate,
    supplierName: suppliersTable.name,
    invoice: purchasesTable.invoiceNumber
  })
  .from(payablesTable)
  .innerJoin(suppliersTable, eq(payablesTable.supplierId, suppliersTable.id))
  .innerJoin(purchasesTable, eq(payablesTable.purchaseId, purchasesTable.id))
  .where(
    and(
      inArray(payablesTable.status, ["unpaid", "partial"]),
      isNotNull(payablesTable.dueDate),
      lte(payablesTable.dueDate, today)
    )
  );

  for (const p of duePayables) {
    const remaining = parseFloat(p.amount as string) - parseFloat(p.paid as string);
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(remaining);
    
    try {
      await pushService.sendNotificationToAdmins(
        "⚠️ Hutang Jatuh Tempo",
        `Supplier: ${p.supplierName}\nInvoice: ${p.invoice}\nSisa Tagihan: ${formattedAmount}`,
        `/hutang`
      );
    } catch (e) {
      logger.error(e, "Gagal kirim notif hutang due");
    }
  }
}
