import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, saleItemsTable, customersTable, productsTable, categoriesTable, receivablesTable, paymentsTable, stockMutationsTable, productRollsTable, returnsTable, returnReturnedItemsTable, returnExchangedItemsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc, inArray, ne } from "drizzle-orm";
import { CreateSaleBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import { pushService } from "../lib/push";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

// ─── Helper: Deduct stock for sale items ───────────────────────────────────────
async function deductStockForItems(items: any[], invoiceNumber: string) {
  for (const item of items) {
    // Decrease product stock
    const [updatedProduct] = await db.update(productsTable)
      .set({
        rollStock: sql`${productsTable.rollStock} - ${item.rolls}`,
        meterStock: sql`${productsTable.meterStock} - ${item.meters}`,
        updatedAt: sql`NOW()`
      })
      .where(eq(productsTable.id, item.productId))
      .returning();

    // Trigger low stock notification
    if (updatedProduct) {
      const meterStock = parseFloat(updatedProduct.meterStock as string || "0");
      const minStock = parseFloat(updatedProduct.minStock as string || "0");
      if (meterStock <= minStock) {
        try {
          await pushService.sendNotificationToAdmins(
            "⚠️ Peringatan Stok Rendah",
            `Bahan: ${updatedProduct.name}\nSisa Stok: ${meterStock} Meter (Min: ${minStock})\nMohon segera lakukan pengadaan ulang.`,
            `/barang`
          );
        } catch (err) {
          console.error("Gagal mengirim notif stok", err);
        }
      }
    }

    // Deduct rolls logic
    if (item.rollId) {
      await db.execute(sql`
        UPDATE ${productRollsTable}
        SET current_length = current_length - ${item.meters}, 
            status = CASE WHEN current_length - ${item.meters} <= 0.01 THEN 'empty' ELSE 'available' END,
            updated_at = NOW()
        WHERE id = ${item.rollId}
      `);
    } else {
      if (item.rolls > 0) {
        const availableRolls = await db.select().from(productRollsTable)
          .where(and(
            eq(productRollsTable.productId, item.productId),
            eq(productRollsTable.status, 'available')
          ));
        const targetLength = item.meters / item.rolls;
        const exactRolls = availableRolls.filter(r => Math.abs(parseFloat(r.currentLength) - targetLength) < 0.01);

        if (exactRolls.length >= item.rolls) {
          const idsToDeduct = exactRolls.slice(0, item.rolls).map(r => r.id);
          for (const rId of idsToDeduct) {
            await db.execute(sql`
              UPDATE ${productRollsTable}
              SET current_length = 0, status = 'empty', updated_at = NOW()
              WHERE id = ${rId}
            `);
          }
        } else {
          let remainingMeters = item.meters;
          for (const roll of availableRolls) {
            if (remainingMeters <= 0.01) break;
            const rollLen = parseFloat(roll.currentLength);
            if (rollLen > remainingMeters) {
              await db.execute(sql`UPDATE ${productRollsTable} SET current_length = current_length - ${remainingMeters}, updated_at = NOW() WHERE id = ${roll.id}`);
              remainingMeters = 0;
            } else {
              await db.execute(sql`UPDATE ${productRollsTable} SET current_length = 0, status = 'empty', updated_at = NOW() WHERE id = ${roll.id}`);
              remainingMeters -= rollLen;
            }
          }
        }
      } else if (item.meters > 0) {
        let remainingMeters = item.meters;
        const availableRolls = await db.select().from(productRollsTable)
          .where(and(
            eq(productRollsTable.productId, item.productId),
            eq(productRollsTable.status, 'available')
          ));
        for (const roll of availableRolls) {
          if (remainingMeters <= 0.01) break;
          const rollLen = parseFloat(roll.currentLength);
          if (rollLen > remainingMeters + 0.01) {
            await db.execute(sql`UPDATE ${productRollsTable} SET current_length = current_length - ${remainingMeters}, updated_at = NOW() WHERE id = ${roll.id}`);
            remainingMeters = 0;
          } else {
            await db.execute(sql`UPDATE ${productRollsTable} SET current_length = 0, status = 'empty', updated_at = NOW() WHERE id = ${roll.id}`);
            remainingMeters -= rollLen;
          }
        }
      }
    }

    // Log stock mutation
    await db.insert(stockMutationsTable).values({
      productId: item.productId,
      type: "keluar",
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      description: `Penjualan ${invoiceNumber}`,
      reference: invoiceNumber,
    });
  }
}

// ─── Helper: Reverse stock for sale items ──────────────────────────────────────
async function reverseStockForItems(saleId: number, invoiceNumber: string) {
  const oldItems = await db.select().from(saleItemsTable)
    .where(eq(saleItemsTable.saleId, saleId));

  for (const item of oldItems) {
    const rolls = numStr(item.rolls as string);
    const meters = numStr(item.meters as string);

    // Restore product stock
    await db.update(productsTable)
      .set({
        rollStock: sql`${productsTable.rollStock} + ${rolls}`,
        meterStock: sql`${productsTable.meterStock} + ${meters}`,
        updatedAt: sql`NOW()`
      })
      .where(eq(productsTable.id, item.productId));

    // Restore roll if specific roll was used
    if (item.rollId) {
      await db.execute(sql`
        UPDATE ${productRollsTable}
        SET current_length = current_length + ${meters},
            status = 'available',
            updated_at = NOW()
        WHERE id = ${item.rollId}
      `);
    }

    // Log reversal mutation
    await db.insert(stockMutationsTable).values({
      productId: item.productId,
      type: "masuk",
      rolls: rolls.toString(),
      meters: meters.toString(),
      description: `Pembatalan ${invoiceNumber}`,
      reference: invoiceNumber,
    });
  }
}

// ─── Helper: Generate sequential invoice number ─────────────────────────────────
async function generateNextInvoiceNumber(prefix: string = "INV"): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  // Get all invoices for today that are NOT draft (already paid/confirmed)
  const todaySales = await db.select({ invoiceNumber: salesTable.invoiceNumber })
    .from(salesTable)
    .where(and(
      sql`${salesTable.invoiceNumber} LIKE ${`${prefix}/${dateStr}/%`}`,
      ne(salesTable.status, 'draft')
    ));

  let maxSeq = 0;
  for (const s of todaySales) {
    const parts = s.invoiceNumber?.split('/');
    if (parts && parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}/${dateStr}/${String(nextSeq).padStart(4, "0")}`;
}

// ─── GET /sales ────────────────────────────────────────────────────────────────
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
      hasReturns: sql<boolean>`EXISTS(SELECT 1 FROM ${returnsTable} WHERE ${returnsTable.saleId} = ${salesTable.id})`,
      returnDifference: sql<string>`COALESCE((SELECT sum(${returnsTable.differenceAmount}) FROM ${returnsTable} WHERE ${returnsTable.saleId} = ${salesTable.id}), 0)`,
      returnDifferencePaid: sql<string>`COALESCE((SELECT sum(${returnsTable.differenceAmount}) FROM ${returnsTable} WHERE ${returnsTable.saleId} = ${salesTable.id} AND ${returnsTable.paymentStatus} = 'lunas'), 0)`,
      totalReturnedValue: sql<string>`COALESCE((SELECT sum(${returnsTable.totalReturnedValue}) FROM ${returnsTable} WHERE ${returnsTable.saleId} = ${salesTable.id}), 0)`,
      totalExchangedValue: sql<string>`COALESCE((SELECT sum(${returnsTable.totalExchangedValue}) FROM ${returnsTable} WHERE ${returnsTable.saleId} = ${salesTable.id}), 0)`,
    })
    .from(salesTable)
    .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(salesTable.createdAt));

  res.json(sales.map(s => {
    // For draft/cancelled/held, return as-is without recalculation
    if (s.status === 'draft' || s.status === 'cancelled' || s.status === 'held') {
      return {
        ...s,
        totalAmount: numStr(s.totalAmount),
        paidAmount: numStr(s.paidAmount),
        remainingAmount: numStr(s.totalAmount) - numStr(s.paidAmount),
        dueDate: s.dueDate?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        hasReturns: false,
        returnDifference: 0,
        totalReturnedValue: 0,
        totalExchangedValue: 0,
      };
    }

    const saleGross = numStr(s.totalAmount) + numStr(s.returnDifference);
    const salePaid = numStr(s.paidAmount) + numStr((s as any).returnDifferencePaid);
    const remainingAmount = saleGross - salePaid;

    let finalStatus = s.status;
    if (remainingAmount <= 0) {
      finalStatus = 'lunas';
    } else {
      finalStatus = salePaid > 0 ? 'partial' : 'tempo';
    }

    return {
      ...s,
      status: finalStatus,
      totalAmount: saleGross,
      paidAmount: salePaid,
      remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
      dueDate: s.dueDate?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      hasReturns: Boolean(s.hasReturns),
      returnDifference: numStr(s.returnDifference),
      totalReturnedValue: numStr((s as any).totalReturnedValue),
      totalExchangedValue: numStr((s as any).totalExchangedValue),
    };
  }));
});

// ─── POST /sales ───────────────────────────────────────────────────────────────
router.post("/sales", async (req, res): Promise<void> => {
  try {
    const parsed = CreateSaleBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { customerId, paymentType, dueDate, notes, items, dpAmount } = parsed.data;
    const isDraft = (req.body as any).isDraft === true;

    const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

    let paidAmount = 0;
    let status: string;
    let invoiceNumber: string;

    if (isDraft) {
      // Draft/Held: invoice number temp, deduct stock
      paidAmount = dpAmount || 0;
      status = paidAmount > 0 ? 'partial' : 'held';
      invoiceNumber = `HOLD-${Date.now()}`;
    } else {
      paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
      status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";
      invoiceNumber = req.body.invoiceNumber || await generateNextInvoiceNumber("INV");
    }

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

    // Insert line items (always saved, stock deduction only if not draft)
    for (const item of items) {
      await db.insert(saleItemsTable).values({
        saleId: sale.id,
        productId: item.productId,
        rollId: item.rollId ?? null,
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        pricePerMeter: item.pricePerMeter.toString(),
        subtotal: item.subtotal.toString(),
      });
    }

    // Deduct stock for all except purely virtual draft (we use 'held' now which deducts)
    if (status !== 'draft') {
      await deductStockForItems(items, invoiceNumber);
    }

    // Create receivable for:
    // - Non-draft: tempo/partial sales
    // - HOLD/Draft WITH DP (partial): customer masih punya sisa hutang, harus masuk piutang
    const shouldCreateReceivable = (!isDraft && (status === "partial" || status === "tempo" || status === "unpaid"))
      || (isDraft && status === "partial" && paidAmount > 0 && paidAmount < totalAmount);

    if (shouldCreateReceivable) {
      await db.insert(receivablesTable).values({
        saleId: sale.id,
        customerId: customerId ?? null,
        totalAmount: totalAmount.toString(),
        paidAmount: paidAmount.toString(),
        status: "partial",
        dueDate: dueDate ? new Date(dueDate) : null,
      });
    }

    broadcastRefresh();

    if (!isDraft) {
      // Push notification
      try {
        let customerName = "Umum";
        if (customerId) {
          const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
          if (customer) customerName = customer.name;
        }
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount);
        await pushService.sendNotificationToAdmins(
          "Transaksi Penjualan Baru",
          `Pelanggan: ${customerName}\nInvoice: ${invoiceNumber}\nTotal: ${formattedAmount}\nStatus: ${status.toUpperCase()}\nMetode: ${paymentType.toUpperCase()}`,
          `/pos/penjualan`
        );
      } catch (error) {
        console.error("Gagal mengirim push notif untuk sale", error);
      }
    }

    res.status(201).json({
      ...sale,
      totalAmount: numStr(sale.totalAmount),
      paidAmount: numStr(sale.paidAmount),
      remainingAmount: numStr(sale.totalAmount) - numStr(sale.paidAmount),
      dueDate: sale.dueDate?.toISOString() ?? null,
      createdAt: sale.createdAt.toISOString(),
      customerName: null,
    });

  } catch (error: any) {
    require('fs').writeFileSync('error.log', String(error) + '\n' + (error.stack || ''));
    res.status(500).json({ error: "Internal Server Error", detail: String(error) });
  }
});

// ─── POST /sales/:id/pay ──────────────────────────────────────────────────────
router.post("/sales/:id/pay", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
    if (!sale) { res.status(404).json({ error: "Not found" }); return; }
    if (sale.status === 'lunas' || sale.status === 'cancelled') { res.status(400).json({ error: "Nota ini sudah lunas atau dibatalkan" }); return; }

    const { paymentType, dueDate, notes } = req.body;
    const items = await db.select().from(saleItemsTable).where(eq(saleItemsTable.saleId, id));

    const totalAmount = numStr(sale.totalAmount);
    // If it was held, subtract the DP already paid
    const remainingToPay = totalAmount - numStr(sale.paidAmount);
    
    const { amount } = req.body;
    let additionalPaid = 0;
    
    if (paymentType !== "kredit" && paymentType !== "tempo") {
      additionalPaid = amount !== undefined ? numStr(amount) : remainingToPay;
    }
    
    const finalPaidAmount = numStr(sale.paidAmount) + additionalPaid;
    
    const status = finalPaidAmount >= totalAmount ? "lunas" : finalPaidAmount > 0 ? "partial" : "tempo";

    // Assign real sequential invoice number now if it's still HOLD/DRAFT
    const isHold = sale.invoiceNumber.startsWith("HOLD-") || sale.invoiceNumber.startsWith("DRAFT-");
    const invoiceNumber = isHold ? await generateNextInvoiceNumber("INV") : sale.invoiceNumber;

    // Update sale header
    await db.update(salesTable).set({
      invoiceNumber,
      paymentType: paymentType || sale.paymentType,
      paidAmount: finalPaidAmount.toString(),
      status,
      dueDate: dueDate ? new Date(dueDate) : (sale.dueDate ?? null),
      notes: notes ?? sale.notes,
      updatedAt: sql`NOW()`,
    }).where(eq(salesTable.id, id));

    // Deduct stock ONLY if it was purely 'draft' (our 'held' already deducted)
    if (sale.status === 'draft') {
      const itemsForDeduction = items.map(i => ({
        productId: i.productId,
        rollId: i.rollId,
        rolls: numStr(i.rolls as string),
        meters: numStr(i.meters as string),
        pricePerMeter: numStr(i.pricePerMeter as string),
        subtotal: numStr(i.subtotal as string),
      }));
      await deductStockForItems(itemsForDeduction, invoiceNumber);
    }

    // Create or update receivable
    const customerId = sale.customerId;
    const existingReceivables = await db.select().from(receivablesTable).where(eq(receivablesTable.saleId, id));

    if (status !== "lunas") {
      if (existingReceivables.length > 0) {
        // Update existing receivable: paidAmount, status, dan invoiceNumber (jika HOLD dikonfirmasi)
        await db.update(receivablesTable).set({
          paidAmount: finalPaidAmount.toString(),
          status: status === "partial" ? "partial" : "unpaid",
          updatedAt: sql`NOW()`,
        }).where(eq(receivablesTable.id, existingReceivables[0].id));
      } else {
        // Buat receivable baru (termasuk kasus HOLD tanpa DP yang baru dikonfirmasi dengan metode tempo)
        await db.insert(receivablesTable).values({
          saleId: id,
          customerId,
          totalAmount: totalAmount.toString(),
          paidAmount: finalPaidAmount.toString(),
          status: status === "partial" ? "partial" : "unpaid",
          dueDate: dueDate ? new Date(dueDate) : (sale.dueDate ?? null),
        });
      }
    } else if (status === "lunas") {
      // Jika lunas, tandai receivable sebagai paid (atau hapus)
      if (existingReceivables.length > 0) {
        await db.update(receivablesTable).set({
          paidAmount: finalPaidAmount.toString(),
          status: "lunas",
          updatedAt: sql`NOW()`,
        }).where(eq(receivablesTable.id, existingReceivables[0].id));
      }
    }

    broadcastRefresh();

    // Push notification
    try {
      let customerName = "Umum";
      if (customerId) {
        const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
        if (customer) customerName = customer.name;
      }
      const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount);
      await pushService.sendNotificationToAdmins(
        "💳 Pembayaran Diterima",
        `Pelanggan: ${customerName}\nInvoice: ${invoiceNumber}\nTotal: ${formattedAmount}\nMetode: ${(paymentType || sale.paymentType).toUpperCase()}`,
        `/pos/penjualan`
      );
    } catch (error) {
      console.error("Gagal mengirim notif pembayaran", error);
    }

    const [updated] = await db.select().from(salesTable).where(eq(salesTable.id, id));
    res.json({
      ...updated,
      totalAmount: numStr(updated.totalAmount),
      paidAmount: numStr(updated.paidAmount),
      remainingAmount: numStr(updated.totalAmount) - numStr(updated.paidAmount),
      dueDate: updated.dueDate?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", detail: String(error) });
  }
});

// ─── POST /sales/:id/cancel ───────────────────────────────────────────────────
router.post("/sales/:id/cancel", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
    if (!sale) { res.status(404).json({ error: "Not found" }); return; }

    if (sale.status === 'draft') {
      // Draft: delete completely so invoice numbers stay continuous
      await db.delete(saleItemsTable).where(eq(saleItemsTable.saleId, id));
      await db.delete(salesTable).where(eq(salesTable.id, id));
    } else if (sale.status === 'cancelled') {
      res.status(400).json({ error: "Nota sudah dibatalkan" }); return;
    } else {
      // Paid or held sale: reverse stock, mark cancelled
      // held has deducted stock, so we reverse it
      await reverseStockForItems(id, sale.invoiceNumber);

      // Remove receivables if any
      await db.delete(receivablesTable).where(eq(receivablesTable.saleId, id));

      // Mark as cancelled
      await db.update(salesTable).set({
        status: 'cancelled',
        updatedAt: sql`NOW()`,
      }).where(eq(salesTable.id, id));

      // Push notification
      try {
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numStr(sale.totalAmount));
        await pushService.sendNotificationToAdmins(
          "⚠️ Transaksi Dibatalkan",
          `Invoice: ${sale.invoiceNumber} dibatalkan\nTotal: ${formattedAmount}\nStok telah dikembalikan.`,
          `/pos/penjualan`
        );
      } catch (error) {
        console.error("Gagal mengirim notif pembatalan", error);
      }
    }

    broadcastRefresh();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", detail: String(error) });
  }
});

// ─── PUT /sales/:id ───────────────────────────────────────────────────────────
router.put("/sales/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
    if (!sale) { res.status(404).json({ error: "Not found" }); return; }
    if (sale.status === 'cancelled') { res.status(400).json({ error: "Nota dibatalkan tidak bisa diedit" }); return; }

    const parsed = CreateSaleBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { customerId, paymentType, dueDate, notes, items, dpAmount } = parsed.data;

    // If sale was already paid, reverse stock from old items first
    if (sale.status !== 'draft') {
      await reverseStockForItems(id, sale.invoiceNumber);
    }

    // Delete old items
    await db.delete(saleItemsTable).where(eq(saleItemsTable.saleId, id));

    const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

    let paidAmount = numStr(sale.paidAmount);
    let statusAfter = sale.status;

    if (sale.status === 'draft' || sale.status === 'held') {
       paidAmount = dpAmount || paidAmount;
       statusAfter = paidAmount > 0 ? 'partial' : 'held';
    } else {
      const paymentTypeToUse = paymentType || sale.paymentType;
      if (dpAmount !== undefined) {
        paidAmount = dpAmount;
      } else {
        paidAmount = (paymentTypeToUse !== "kredit" && paymentTypeToUse !== "tempo") ? totalAmount : Math.min(numStr(sale.paidAmount), totalAmount);
      }
      statusAfter = (paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo");
    }

    // Update sale header
    await db.update(salesTable).set({
      customerId: customerId ?? null,
      paymentType: paymentType || sale.paymentType,
      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      status: statusAfter,
      dueDate: dueDate ? new Date(dueDate) : (sale.dueDate ?? null),
      notes: notes ?? sale.notes,
      updatedAt: sql`NOW()`,
    }).where(eq(salesTable.id, id));

    // Insert new items
    for (const item of items) {
      await db.insert(saleItemsTable).values({
        saleId: id,
        productId: item.productId,
        rollId: item.rollId ?? null,
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        pricePerMeter: item.pricePerMeter.toString(),
        subtotal: item.subtotal.toString(),
      });
    }

    // Deduct stock for new items (only if not draft)
    if (statusAfter !== 'draft') {
      await deductStockForItems(items, sale.invoiceNumber);
    }

    // Update/create receivables berdasarkan status
    const existingReceivables = await db.select().from(receivablesTable).where(eq(receivablesTable.saleId, id));

    if (statusAfter === 'partial' || statusAfter === 'tempo' || statusAfter === 'unpaid') {
      // Perlu piutang — baik untuk HOLD+DP maupun invoice non-draft
      if (existingReceivables.length > 0) {
        await db.update(receivablesTable).set({
          totalAmount: totalAmount.toString(),
          paidAmount: paidAmount.toString(),
          status: statusAfter === "partial" ? "partial" : "unpaid",
          updatedAt: sql`NOW()`,
        }).where(eq(receivablesTable.saleId, id));
      } else {
        await db.insert(receivablesTable).values({
          saleId: id,
          customerId: customerId ?? sale.customerId ?? null,
          totalAmount: totalAmount.toString(),
          paidAmount: paidAmount.toString(),
          status: statusAfter === "partial" ? "partial" : "unpaid",
          dueDate: dueDate ? new Date(dueDate) : (sale.dueDate ?? null),
        });
      }
    } else if (statusAfter === 'lunas') {
      // Lunas — hapus piutang
      if (existingReceivables.length > 0) {
        await db.delete(receivablesTable).where(eq(receivablesTable.saleId, id));
      }
    } else if (statusAfter === 'held') {
      // HOLD tanpa DP — tidak ada piutang, hapus jika sebelumnya ada (DP dihapus)
      if (existingReceivables.length > 0) {
        await db.delete(receivablesTable).where(eq(receivablesTable.saleId, id));
      }
    }

    broadcastRefresh();

    const [updated] = await db.select().from(salesTable).where(eq(salesTable.id, id));
    res.json({
      ...updated,
      totalAmount: numStr(updated.totalAmount),
      paidAmount: numStr(updated.paidAmount),
      remainingAmount: numStr(updated.totalAmount) - numStr(updated.paidAmount),
      dueDate: updated.dueDate?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", detail: String(error) });
  }
});

// ─── GET /sales/:id ───────────────────────────────────────────────────────────
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
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      rollId: saleItemsTable.rollId,
      rolls: saleItemsTable.rolls,
      meters: saleItemsTable.meters,
      pricePerMeter: saleItemsTable.pricePerMeter,
      subtotal: saleItemsTable.subtotal,
    })
    .from(saleItemsTable)
    .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(saleItemsTable.saleId, id));

  const returns = await db.select().from(returnsTable).where(eq(returnsTable.saleId, id));
  const returnIds = returns.map(r => r.id);
  let returnedItems: any[] = [];
  let exchangedItems: any[] = [];
  let returnsHistory: any[] = [];

  if (returnIds.length > 0) {
    returnedItems = await db.select().from(returnReturnedItemsTable).where(sql`${returnReturnedItemsTable.returnId} IN ${returnIds}`);
    exchangedItems = await db.select({
      returnId: returnExchangedItemsTable.returnId,
      productId: returnExchangedItemsTable.productId,
      productName: productsTable.name,
      categoryName: categoriesTable.name,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      rollId: returnExchangedItemsTable.rollId,
      rolls: returnExchangedItemsTable.rolls,
      meters: returnExchangedItemsTable.meters,
      pricePerMeter: returnExchangedItemsTable.pricePerMeter,
      subtotal: returnExchangedItemsTable.subtotal,
    })
    .from(returnExchangedItemsTable)
    .leftJoin(productsTable, eq(returnExchangedItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(sql`${returnExchangedItemsTable.returnId} IN ${returnIds}`);

    returnsHistory = returns.map(r => {
      const retItems = returnedItems.filter(ri => ri.returnId === r.id);
      const excItems = exchangedItems.filter(ei => ei.returnId === r.id).map(ei => ({
        ...ei,
        rolls: numStr(ei.rolls as string),
        meters: numStr(ei.meters as string),
        pricePerMeter: numStr(ei.pricePerMeter as string),
        subtotal: numStr(ei.subtotal as string),
      }));
      return {
        ...r,
        totalReturnedValue: numStr(r.totalReturnedValue),
        totalExchangedValue: numStr(r.totalExchangedValue),
        differenceAmount: numStr(r.differenceAmount),
        cashRefunded: numStr(r.cashRefunded),
        createdAt: r.createdAt.toISOString(),
        returnedItems: retItems,
        exchangedItems: excItems,
      };
    });
  }

  const returnDiffPaid = returnsHistory.reduce((sum, r) => r.paymentStatus === 'lunas' ? sum + parseFloat(r.differenceAmount as string || "0") : sum, 0);
  const returnDiff = returnsHistory.reduce((sum, r) => sum + parseFloat(r.differenceAmount as string || "0"), 0);

  const saleGross = numStr(sale.totalAmount) + returnDiff;
  const salePaid = numStr(sale.paidAmount) + returnDiffPaid;
  const remainingAmount = saleGross - salePaid;

  let finalStatus = sale.status;
  if (sale.status !== 'draft' && sale.status !== 'cancelled') {
    if (remainingAmount <= 0) {
      finalStatus = 'lunas';
    } else {
      finalStatus = salePaid > 0 ? 'partial' : 'tempo';
    }
  }

  // ─── Ambil riwayat pembayaran cicilan dari tabel payments ────────────────
  let paymentHistory: any[] = [];
  const receivableForSale = await db
    .select()
    .from(receivablesTable)
    .where(eq(receivablesTable.saleId, id));

  if (receivableForSale.length > 0) {
    const recId = receivableForSale[0].id;
    const pmts = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.receivableId, recId))
      .orderBy(paymentsTable.paidAt);

    paymentHistory = pmts.map((p, idx) => ({
      step: idx + 1,
      id: p.id,
      amount: numStr(p.amount),
      paymentMethod: p.paymentMethod,
      notes: p.notes,
      paidAt: p.paidAt.toISOString(),
    }));
  }

  res.json({
    ...sale,
    status: finalStatus,
    totalAmount: sale.status === 'draft' ? numStr(sale.totalAmount) : saleGross,
    paidAmount: sale.status === 'draft' ? 0 : salePaid,
    remainingAmount: sale.status === 'draft' ? numStr(sale.totalAmount) : (remainingAmount > 0 ? remainingAmount : 0),
    dueDate: sale.dueDate?.toISOString() ?? null,
    createdAt: sale.createdAt.toISOString(),
    paymentHistory,
    items: (() => {
      let availableReturnedItems = [...returnedItems];
      return items.map(i => {
        const matchIndex = availableReturnedItems.findIndex(ri =>
          ri.productId === i.productId &&
          (ri.rollId === i.rollId || (!ri.rollId && !i.rollId)) &&
          parseFloat(ri.meters as string || "0") === parseFloat(i.meters as string || "0") &&
          parseFloat(ri.rolls as string || "0") === parseFloat(i.rolls as string || "0")
        );

        let isReturned = false;
        let itemReturns: any[] = [];

        if (matchIndex !== -1) {
          isReturned = true;
          const matchedReturnId = availableReturnedItems[matchIndex].returnId;
          itemReturns = returnsHistory.filter(rh => rh.id === matchedReturnId);
          availableReturnedItems.splice(matchIndex, 1);
        }

        return {
          ...i,
          rollId: i.rollId,
          rolls: numStr(i.rolls as string),
          meters: numStr(i.meters as string),
          pricePerMeter: numStr(i.pricePerMeter as string),
          subtotal: numStr(i.subtotal as string),
          isReturned,
          returns: itemReturns,
        };
      });
    })(),
    exchangedItems: exchangedItems.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
      isExchangedItem: true
    })),
  });
});

// ─── DELETE /sales/:id (legacy, calls cancel internally) ─────────────────────
router.delete("/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(saleItemsTable).where(eq(saleItemsTable.saleId, id));
  await db.delete(salesTable).where(eq(salesTable.id, id));
  broadcastRefresh();

  try {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(sale.totalAmount as string || "0"));
    await pushService.sendNotificationToAdmins(
      "⚠️ Pembatalan Transaksi",
      `Invoice: ${sale.invoiceNumber} dibatalkan\nTotal: ${formattedAmount}`,
      `/pos/penjualan`
    );
  } catch (error) {
    console.error("Gagal mengirim notif pembatalan", error);
  }

  res.status(204).send();
});

export default router;









