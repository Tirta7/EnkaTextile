import { Router } from "express";
import { db } from "@workspace/db";
import { stockMutationsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreateMutationBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/mutations", async (req, res) => {
  const { productId, type } = req.query;
  const conditions: any[] = [];
  if (productId) conditions.push(eq(stockMutationsTable.productId, parseInt(productId as string)));
  if (type) conditions.push(sql`${stockMutationsTable.type} = ${type}`);

  const mutations = await db
    .select({
      id: stockMutationsTable.id,
      productId: stockMutationsTable.productId,
      productName: productsTable.name,
      type: stockMutationsTable.type,
      rolls: stockMutationsTable.rolls,
      meters: stockMutationsTable.meters,
      description: stockMutationsTable.description,
      reference: stockMutationsTable.reference,
      createdAt: stockMutationsTable.createdAt,
    })
    .from(stockMutationsTable)
    .leftJoin(productsTable, eq(stockMutationsTable.productId, productsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(stockMutationsTable.createdAt);

  res.json(mutations.map(m => ({
    ...m,
    rolls: numStr(m.rolls),
    meters: numStr(m.meters),
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/mutations", async (req, res): Promise<void> => {
  const parsed = CreateMutationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { productId, type, rolls, meters, description, reference } = parsed.data;

  const [mut] = await db.insert(stockMutationsTable).values({
    productId,
    type,
    rolls: rolls.toString(),
    meters: meters.toString(),
    description,
    reference: reference ?? null,
  }).returning();

  // Update stock based on type
  const isIncoming = ["masuk", "transfer_masuk"].includes(type);
  const isOutgoing = ["keluar", "transfer_keluar", "reject"].includes(type);

  if (isIncoming) {
    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = roll_stock + ${rolls}, meter_stock = meter_stock + ${meters}, updated_at = NOW()
      WHERE id = ${productId}
    `);
  } else if (isOutgoing) {
    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = roll_stock - ${rolls}, meter_stock = meter_stock - ${meters}, updated_at = NOW()
      WHERE id = ${productId}
    `);
  }

  broadcastRefresh();
  const [product] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, productId));
  res.status(201).json({
    ...mut,
    productName: product?.name ?? null,
    rolls: numStr(mut.rolls),
    meters: numStr(mut.meters),
    createdAt: mut.createdAt.toISOString(),
  });
});

export default router;
