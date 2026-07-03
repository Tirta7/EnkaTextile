import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, saleItemsTable, customersTable, productsTable, categoriesTable, receivablesTable, stockMutationsTable, productRollsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { CreateSaleBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import { pushService } from "../lib/push";

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
    .orderBy(desc(salesTable.createdAt));

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
  const paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
  const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

  const counter = await db.select({ count: sql<number>`count(*)` }).from(salesTable);
  const invoiceNumber = req.body.invoiceNumber || `INV-${Date.now()}`;

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
      rollId: item.rollId ?? null,
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      pricePerMeter: item.pricePerMeter.toString(),
      subtotal: item.subtotal.toString(),
    });
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
      // 1. Specific Roll Selected
      await db.execute(sql`
        UPDATE ${productRollsTable}
        SET current_length = current_length - ${item.meters}, 
            status = CASE WHEN current_length - ${item.meters} <= 0.01 THEN 'empty' ELSE 'available' END,
            updated_at = NOW()
        WHERE id = ${item.rollId}
      `);
    } else {
      // Auto-deduct rolls if no specific rollId is provided
      if (item.rolls > 0) {
        // 2. Qty > 0 (E.g. Grouped Length Selection)
        // Find rolls that match the exact target length
        const availableRolls = await db.select().from(productRollsTable)
          .where(and(
            eq(productRollsTable.productId, item.productId),
            eq(productRollsTable.status, 'available')
          ));
        
        // Filter in JS to avoid floating point precision issues in SQL
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
           console.warn(`Not enough exact rolls found for product ${item.productId}, target length ${targetLength}`);
           // Fallback to FIFO if exact match not found
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
        // 3. Bebas Meteran (rolls = 0)
        // FIFO deduction from oldest available rolls
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
  
  // Trigger Push Notification
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
      `/penjualan` // URL to navigate when clicked
    );
  } catch (error) {
    console.error("Gagal mengirim push notif untuk sale", error);
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
      categoryName: categoriesTable.name,
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

  res.json({
    ...sale,
    totalAmount: numStr(sale.totalAmount),
    paidAmount: numStr(sale.paidAmount),
    remainingAmount: numStr(sale.totalAmount) - numStr(sale.paidAmount),
    dueDate: sale.dueDate?.toISOString() ?? null,
    createdAt: sale.createdAt.toISOString(),
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

router.delete("/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  
  // Fetch sale details first for notification
  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(saleItemsTable).where(eq(saleItemsTable.saleId, id));
  await db.delete(salesTable).where(eq(salesTable.id, id));
  broadcastRefresh();

  // Trigger cancellation notification
  try {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(sale.totalAmount as string || "0"));
    await pushService.sendNotificationToAdmins(
      "⚠️ Pembatalan Transaksi",
      `Invoice: ${sale.invoiceNumber} dibatalkan\nTotal: ${formattedAmount}`,
      `/penjualan`
    );
  } catch (error) {
    console.error("Gagal mengirim notif pembatalan", error);
  }

  res.status(204).send();
});

export default router;
