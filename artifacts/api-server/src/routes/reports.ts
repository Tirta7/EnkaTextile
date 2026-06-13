import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, saleItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { and, gte, lte, eq, sql } from "drizzle-orm";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/reports/sales-summary", async (req, res) => {
  const { startDate, endDate } = req.query;
  const conditions: any[] = [];
  if (startDate) conditions.push(gte(salesTable.createdAt, new Date(startDate as string)));
  if (endDate) conditions.push(lte(salesTable.createdAt, new Date(endDate as string)));

  const [summary] = await db
    .select({
      totalRevenue: sql<string>`coalesce(sum(${salesTable.totalAmount}), 0)`,
      totalTransactions: sql<number>`count(*)`,
      cashRevenue: sql<string>`coalesce(sum(case when ${salesTable.paymentType} = 'tunai' then ${salesTable.totalAmount} else 0 end), 0)`,
      tempoRevenue: sql<string>`coalesce(sum(case when ${salesTable.paymentType} = 'tempo' then ${salesTable.totalAmount} else 0 end), 0)`,
    })
    .from(salesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [itemsSummary] = await db
    .select({
      totalRolls: sql<string>`coalesce(sum(si.rolls), 0)`,
      totalMeters: sql<string>`coalesce(sum(si.meters), 0)`,
    })
    .from(saleItemsTable)
    .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({
    totalRevenue: numStr(summary?.totalRevenue),
    totalTransactions: Number(summary?.totalTransactions ?? 0),
    totalRolls: numStr(itemsSummary?.totalRolls),
    totalMeters: numStr(itemsSummary?.totalMeters),
    cashRevenue: numStr(summary?.cashRevenue),
    tempoRevenue: numStr(summary?.tempoRevenue),
  });
});

router.get("/reports/stock-summary", async (req, res) => {
  const products = await db
    .select({
      productId: productsTable.id,
      productName: productsTable.name,
      categoryName: categoriesTable.name,
      rackLocation: productsTable.rackLocation,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
      pricePerMeter: productsTable.pricePerMeter,
      minStock: productsTable.minStock,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(productsTable.name);

  res.json(products.map(p => ({
    productId: p.productId,
    productName: p.productName,
    categoryName: p.categoryName ?? null,
    rackLocation: p.rackLocation,
    rollStock: numStr(p.rollStock),
    meterStock: numStr(p.meterStock),
    value: numStr(p.meterStock) * numStr(p.pricePerMeter),
    isLowStock: numStr(p.meterStock) <= numStr(p.minStock),
  })));
});

export default router;
