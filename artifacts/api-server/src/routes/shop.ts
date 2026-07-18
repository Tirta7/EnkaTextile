import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, productRollsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

const router = Router();

// GET /api/shop/categories — daftar kategori yang memiliki produk
router.get("/shop/categories", async (req, res): Promise<void> => {
  const categories = await db
    .selectDistinct({
      id: categoriesTable.id,
      name: categoriesTable.name,
      description: categoriesTable.description,
    })
    .from(categoriesTable)
    .innerJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(categoriesTable.name);
  res.json(categories);
});

// GET /api/shop/products — daftar produk publik (tidak butuh auth)
router.get("/shop/products", async (req, res): Promise<void> => {
  const { categoryId, search } = req.query;

  const baseProducts = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      imageUrl: productsTable.imageUrl,
      description: productsTable.description,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(productsTable.name);

  let result = baseProducts.map(p => ({
    ...p,
    pricePerMeter: parseFloat(p.pricePerMeter ?? "0"),
    pricePerRoll: p.pricePerRoll ? parseFloat(p.pricePerRoll) : null,
    rollStock: parseFloat(p.rollStock ?? "0"),
    meterStock: parseFloat(p.meterStock ?? "0"),
    inStock: parseFloat(p.rollStock ?? "0") > 0,
  }));

  if (categoryId) {
    result = result.filter(p => p.categoryId === parseInt(categoryId as string));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }

  res.json(result);
});

// GET /api/shop/products/:id — detail produk publik
router.get("/shop/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);

  const [prod] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      imageUrl: productsTable.imageUrl,
      description: productsTable.description,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));

  if (!prod) { res.status(404).json({ error: "Not found" }); return; }

  // Ambil available rolls untuk ditampilkan sebagai variasi ukuran
  const rolls = await db
    .select({
      id: productRollsTable.id,
      currentLength: productRollsTable.currentLength,
      barcode: productRollsTable.barcode,
    })
    .from(productRollsTable)
    .where(and(eq(productRollsTable.productId, id), eq(productRollsTable.status, "available")))
    .orderBy(productRollsTable.currentLength);

  // Kelompokkan ukuran yang tersedia
  const availableSizes: { length: number; count: number }[] = [];
  const sizeMap: Record<string, number> = {};
  rolls.forEach(r => {
    const len = parseFloat(r.currentLength).toFixed(1);
    sizeMap[len] = (sizeMap[len] || 0) + 1;
  });
  Object.entries(sizeMap).forEach(([len, count]) => {
    availableSizes.push({ length: parseFloat(len), count });
  });
  availableSizes.sort((a, b) => a.length - b.length);

  res.json({
    ...prod,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    inStock: parseFloat(prod.rollStock ?? "0") > 0,
    availableSizes,
    totalRolls: rolls.length,
  });
});

export default router;
