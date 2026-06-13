import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      description: categoriesTable.description,
      createdAt: categoriesTable.createdAt,
      productCount: sql<number>`(select count(*) from ${productsTable} where ${productsTable.categoryId} = ${categoriesTable.id})`.as("product_count"),
    })
    .from(categoriesTable)
    .orderBy(categoriesTable.name);
  res.json(categories);
});

router.post("/categories", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

router.get("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) return res.status(404).json({ error: "Not found" });
  res.json({ ...cat, productCount: 0 });
});

router.patch("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [cat] = await db.update(categoriesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) return res.status(404).json({ error: "Not found" });
  res.json({ ...cat, productCount: 0 });
});

router.delete("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).send();
});

export default router;
