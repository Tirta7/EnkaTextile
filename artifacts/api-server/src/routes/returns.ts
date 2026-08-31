import { Router } from "express";
import { db } from "@workspace/db";
import {
  returnsTable,
  returnReturnedItemsTable,
  returnExchangedItemsTable,
  productsTable,
  productRollsTable,
  stockMutationsTable,
  cashEntriesTable,
  receivablesTable,
  payablesTable,
  customersTable,
  suppliersTable,
} from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { CreateReturnBody } from "@workspace/api-zod";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/returns", async (req, res) => {
  const returns = await db
    .select({
      id: returnsTable.id,
      returnNumber: returnsTable.returnNumber,
      type: returnsTable.type,
      saleId: returnsTable.saleId,
      purchaseId: returnsTable.purchaseId,
      customerId: returnsTable.customerId,
      customerName: customersTable.name,
      supplierId: returnsTable.supplierId,
      supplierName: suppliersTable.name,
      totalReturnedValue: returnsTable.totalReturnedValue,
      totalExchangedValue: returnsTable.totalExchangedValue,
      differenceAmount: returnsTable.differenceAmount,
      paymentStatus: returnsTable.paymentStatus,
      cashRefunded: returnsTable.cashRefunded,
      status: returnsTable.status,
      notes: returnsTable.notes,
      createdAt: returnsTable.createdAt,
    })
    .from(returnsTable)
    .leftJoin(customersTable, eq(returnsTable.customerId, customersTable.id))
    .leftJoin(suppliersTable, eq(returnsTable.supplierId, suppliersTable.id))
    .orderBy(desc(returnsTable.createdAt));

  res.json(returns.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString()
  })));
});

router.get("/returns/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  
  const [returnDoc] = await db.select({
    returnInfo: returnsTable,
    customer: customersTable,
    supplier: suppliersTable,
  })
  .from(returnsTable)
  .leftJoin(customersTable, eq(returnsTable.customerId, customersTable.id))
  .leftJoin(suppliersTable, eq(returnsTable.supplierId, suppliersTable.id))
  .where(eq(returnsTable.id, parseInt(id)));

  if (!returnDoc) {
    res.status(404).json({ error: "Return not found" });
    return;
  }

  const returnedItems = await db
    .select({
      id: returnReturnedItemsTable.id,
      productId: returnReturnedItemsTable.productId,
      productName: productsTable.name,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      rolls: returnReturnedItemsTable.rolls,
      meters: returnReturnedItemsTable.meters,
      pricePerMeter: returnReturnedItemsTable.pricePerMeter,
      subtotal: returnReturnedItemsTable.subtotal,
    })
    .from(returnReturnedItemsTable)
    .leftJoin(productsTable, eq(returnReturnedItemsTable.productId, productsTable.id))
    .where(eq(returnReturnedItemsTable.returnId, parseInt(id)));

  const exchangedItems = await db
    .select({
      id: returnExchangedItemsTable.id,
      productId: returnExchangedItemsTable.productId,
      productName: productsTable.name,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      rolls: returnExchangedItemsTable.rolls,
      meters: returnExchangedItemsTable.meters,
      pricePerMeter: returnExchangedItemsTable.pricePerMeter,
      subtotal: returnExchangedItemsTable.subtotal,
    })
    .from(returnExchangedItemsTable)
    .leftJoin(productsTable, eq(returnExchangedItemsTable.productId, productsTable.id))
    .where(eq(returnExchangedItemsTable.returnId, parseInt(id)));

  res.json({
    ...returnDoc.returnInfo,
    customer: returnDoc.customer,
    supplier: returnDoc.supplier,
    createdAt: returnDoc.returnInfo.createdAt.toISOString(),
    returnedItems,
    exchangedItems,
  });
});

router.post("/returns", async (req, res): Promise<void> => {
  try {
    const parsed = CreateReturnBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;
    
    // Check lengths
    const returnedItems = data.returnedItems || [];
    const exchangedItems = data.exchangedItems || [];

    const totalReturned = returnedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const totalExchanged = exchangedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const differenceAmount = totalExchanged - totalReturned;

    const returnNumber = `RET-${Date.now()}`;

    let cashRefunded = 0;
    
    // Pre-calculate financial stuff
    if (data.type === 'penjualan') {
       if (differenceAmount < 0) {
          if (data.paymentStatus === 'lunas') {
             cashRefunded = Math.abs(differenceAmount);
          }
       }
    } else {
       if (differenceAmount < 0) {
          if (data.paymentStatus === 'lunas') {
             cashRefunded = Math.abs(differenceAmount);
          }
       }
    }

    const [returnDoc] = await db.insert(returnsTable).values({
      returnNumber,
      type: data.type,
      saleId: data.saleId ?? null,
      purchaseId: data.purchaseId ?? null,
      customerId: data.customerId ?? null,
      supplierId: data.supplierId ?? null,
      totalReturnedValue: totalReturned.toString(),
      totalExchangedValue: totalExchanged.toString(),
      differenceAmount: differenceAmount.toString(),
      paymentStatus: data.paymentStatus,
      cashRefunded: cashRefunded.toString(),
      notes: data.notes ?? null,
    }).returning();

    // Process Returned Items (Masuk ke Toko kalau penjualan, Keluar kalau pembelian)
    for (const item of returnedItems) {
      await db.insert(returnReturnedItemsTable).values({
        returnId: returnDoc.id,
        productId: item.productId,
        rollId: item.rollId ?? null,
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        pricePerMeter: item.pricePerMeter.toString(),
        subtotal: item.subtotal.toString(),
      });

      const rollOp = data.type === 'penjualan' ? '+' : '-';
      
      await db.update(productsTable)
        .set({
          rollStock: sql`${productsTable.rollStock} ${sql.raw(rollOp)} ${item.rolls}`,
          meterStock: sql`${productsTable.meterStock} ${sql.raw(rollOp)} ${item.meters}`,
          updatedAt: sql`NOW()`
        })
        .where(eq(productsTable.id, item.productId));

      if (item.rollId) {
        await db.execute(sql`
          UPDATE ${productRollsTable}
          SET current_length = current_length ${sql.raw(rollOp)} ${item.meters},
              status = CASE WHEN current_length ${sql.raw(rollOp)} ${item.meters} > 0.01 THEN 'available' ELSE 'empty' END,
              updated_at = NOW()
          WHERE id = ${item.rollId}
        `);
      }

      await db.insert(stockMutationsTable).values({
        productId: item.productId,
        rollId: item.rollId ?? null,
        type: data.type === 'penjualan' ? 'retur_masuk' : 'retur_keluar',
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        description: `Retur ${data.type === 'penjualan' ? 'Penjualan' : 'Pembelian'} ${returnNumber}`,
        reference: returnNumber,
      });
    }

    // Process Exchanged Items (Keluar dari Toko kalau penjualan, Masuk kalau pembelian)
    for (const item of exchangedItems) {
      await db.insert(returnExchangedItemsTable).values({
        returnId: returnDoc.id,
        productId: item.productId,
        rollId: item.rollId ?? null,
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        pricePerMeter: item.pricePerMeter.toString(),
        subtotal: item.subtotal.toString(),
      });

      const rollOp = data.type === 'penjualan' ? '-' : '+';
      
      await db.update(productsTable)
        .set({
          rollStock: sql`${productsTable.rollStock} ${sql.raw(rollOp)} ${item.rolls}`,
          meterStock: sql`${productsTable.meterStock} ${sql.raw(rollOp)} ${item.meters}`,
          updatedAt: sql`NOW()`
        })
        .where(eq(productsTable.id, item.productId));

      if (item.rollId) {
        await db.execute(sql`
          UPDATE ${productRollsTable}
          SET current_length = current_length ${sql.raw(rollOp)} ${item.meters},
              status = CASE WHEN current_length ${sql.raw(rollOp)} ${item.meters} > 0.01 THEN 'available' ELSE 'empty' END,
              updated_at = NOW()
          WHERE id = ${item.rollId}
        `);
      } else {
        // Fallback or auto-deduct if exchanged items don't have rollId
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
        }
      }

      await db.insert(stockMutationsTable).values({
        productId: item.productId,
        rollId: item.rollId ?? null,
        type: data.type === 'penjualan' ? 'retur_keluar' : 'retur_masuk',
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        description: `Tukar Pengganti Retur ${returnNumber}`,
        reference: returnNumber,
      });
    }

    // Financial Sync
    if (data.type === 'penjualan') {
      if (differenceAmount > 0) {
         if (data.paymentStatus === 'tempo' && data.saleId) {
            await db.insert(receivablesTable).values({
               saleId: data.saleId,
               customerId: data.customerId ?? null,
               totalAmount: differenceAmount.toString(),
               paidAmount: "0"
            });
         } else if (data.paymentStatus === 'lunas') {
            await db.insert(cashEntriesTable).values({
               type: 'masuk',
               amount: differenceAmount.toString(),
               description: `Selisih Tambah Retur Penjualan ${returnNumber}`,
               reference: returnNumber,
            });
         }
      } else if (differenceAmount < 0) {
         if (data.paymentStatus === 'tempo' && data.saleId) {
            const [receivable] = await db.select().from(receivablesTable).where(eq(receivablesTable.saleId, data.saleId));
            if (receivable) {
               const newTotal = numStr(receivable.totalAmount) - Math.abs(differenceAmount);
               await db.update(receivablesTable)
                  .set({ totalAmount: newTotal.toString() })
                  .where(eq(receivablesTable.id, receivable.id));
            }
         } else if (data.paymentStatus === 'lunas') {
            await db.insert(cashEntriesTable).values({
               type: 'keluar',
               amount: Math.abs(differenceAmount).toString(),
               description: `Refund Retur Penjualan ${returnNumber}`,
               reference: returnNumber,
            });
         }
      }
    } else if (data.type === 'pembelian') {
      if (differenceAmount > 0) {
         if (data.paymentStatus === 'tempo' && data.supplierId && data.purchaseId) {
            await db.insert(payablesTable).values({
               purchaseId: data.purchaseId,
               supplierId: data.supplierId,
               totalAmount: differenceAmount.toString(),
               paidAmount: "0"
            });
         } else if (data.paymentStatus === 'lunas') {
            await db.insert(cashEntriesTable).values({
               type: 'keluar',
               amount: differenceAmount.toString(),
               description: `Selisih Tambah Retur Pembelian ${returnNumber}`,
               reference: returnNumber,
            });
         }
      } else if (differenceAmount < 0) {
         if (data.paymentStatus === 'tempo' && data.supplierId && data.purchaseId) {
            const [payable] = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, data.purchaseId));
            if (payable) {
               const newTotal = numStr(payable.totalAmount) - Math.abs(differenceAmount);
               await db.update(payablesTable)
                  .set({ totalAmount: newTotal.toString() })
                  .where(eq(payablesTable.id, payable.id));
            }
         } else if (data.paymentStatus === 'lunas') {
            await db.insert(cashEntriesTable).values({
               type: 'masuk',
               amount: Math.abs(differenceAmount).toString(),
               description: `Refund Retur Pembelian ${returnNumber}`,
               reference: returnNumber,
            });
         }
      }
    }

    res.status(201).json(returnDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create return" });
  }
});

export default router;
