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
      totalRolls: sql<string>`coalesce(sum(${saleItemsTable.rolls}), 0)`,
      totalMeters: sql<string>`coalesce(sum(${saleItemsTable.meters}), 0)`,
    })
    .from(saleItemsTable)
    .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const byProduct = await db
    .select({
      productId: saleItemsTable.productId,
      productName: productsTable.name,
      totalMeters: sql<string>`coalesce(sum(${saleItemsTable.meters}), 0)`,
      totalRevenue: sql<string>`coalesce(sum(${saleItemsTable.subtotal}), 0)`,
    })
    .from(saleItemsTable)
    .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
    .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(saleItemsTable.productId, productsTable.name)
    .orderBy(sql`sum(${saleItemsTable.subtotal}) DESC`);

  const byCategory = await db
    .select({
      categoryName: categoriesTable.name,
      totalRevenue: sql<string>`coalesce(sum(${saleItemsTable.subtotal}), 0)`,
    })
    .from(saleItemsTable)
    .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
    .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(categoriesTable.name)
    .orderBy(sql`sum(${saleItemsTable.subtotal}) DESC`);

  const totalRev = numStr(summary?.totalRevenue);
  const totalTx = Number(summary?.totalTransactions ?? 0);

  res.json({
    totalRevenue: totalRev,
    totalTransactions: totalTx,
    averageTransaction: totalTx > 0 ? totalRev / totalTx : 0,
    totalRolls: numStr(itemsSummary?.totalRolls),
    totalMeters: numStr(itemsSummary?.totalMeters),
    cashRevenue: numStr(summary?.cashRevenue),
    tempoRevenue: numStr(summary?.tempoRevenue),
    byProduct: byProduct.map(p => ({
      productId: p.productId,
      productName: p.productName ?? "Unknown",
      totalMeters: numStr(p.totalMeters),
      totalRevenue: numStr(p.totalRevenue)
    })),
    byCategory: byCategory.map(c => ({
      categoryName: c.categoryName ?? "Tanpa Kategori",
      totalRevenue: numStr(c.totalRevenue)
    }))
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

  const formattedProducts = products.map(p => ({
    id: p.productId,
    name: p.productName,
    categoryName: p.categoryName ?? null,
    rackLocation: p.rackLocation,
    rollStock: numStr(p.rollStock),
    meterStock: numStr(p.meterStock),
    minStock: numStr(p.minStock),
    stockValue: numStr(p.meterStock) * numStr(p.pricePerMeter),
    isLowStock: numStr(p.meterStock) <= numStr(p.minStock),
  }));

  const totalProducts = formattedProducts.length;
  const totalValue = formattedProducts.reduce((acc, p) => acc + p.stockValue, 0);
  const lowStockCount = formattedProducts.filter(p => p.isLowStock).length;

  res.json({
    totalProducts,
    totalValue,
    lowStockCount,
    products: formattedProducts
  });
});

export default router;
