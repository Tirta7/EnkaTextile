import { db } from "@workspace/db";
import { salesTable, saleItemsTable, productsTable, productRollsTable, stockMutationsTable, cashEntriesTable, receivablesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";

async function run() {
  const invoiceNumber = `INV-${Date.now()}`;
  const customerId = undefined;
  const paymentType = "qris";
  const dueDate = undefined;
  const notes = undefined;
  
  const items = [
    {
      productId: 1, // assuming ROSE GOLD is id 1 or something
      rollId: 1,
      rolls: 1,
      meters: 382.98,
      pricePerMeter: 14000,
      subtotal: 5361720
    }
  ];
  
  const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);
  const paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
  const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

  try {
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
    
    console.log("SALE CREATED:", sale);

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
      console.log("ITEM CREATED:", item.productId);

      if (item.rollId) {
        await db.execute(sql`
          UPDATE ${productRollsTable}
          SET current_length = current_length - ${item.meters}, 
              status = CASE WHEN current_length - ${item.meters} <= 0.01 THEN 'empty' ELSE 'available' END,
              updated_at = NOW()
          WHERE id = ${item.rollId}
        `);
        console.log("ROLL DEDUCTED");
      }
    }
  } catch (err) {
    console.error("ERROR CREATING SALE:", err);
  }
  process.exit(0);
}
run();
