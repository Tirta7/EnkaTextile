import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import * as XLSX from "xlsx";

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

// ─── GET /categories/export ─────────────────────────────────────────────────
router.get("/categories/export", async (req, res): Promise<void> => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        description: categoriesTable.description,
        productCount: sql<number>`(select count(*) from ${productsTable} where ${productsTable.categoryId} = ${categoriesTable.id})`.as("product_count"),
      })
      .from(categoriesTable)
      .orderBy(categoriesTable.name);

    const rows: any[] = [];
    let rowNo = 1;

    for (const c of categories) {
      rows.push({
        "No": rowNo++,
        "Nama Kategori": c.name,
        "Deskripsi": c.description || "",
        "Jumlah Produk": Number(c.productCount || 0),
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 35 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kategori");
    const filename = `Data_Kategori_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err: any) {
    console.error("Export categories error:", err);
    res.status(500).json({ error: err.message || "Export kategori gagal" });
  }
});

// ─── POST /categories/import ────────────────────────────────────────────────
router.post("/categories/import", async (req, res): Promise<void> => {
  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "Content-Type harus multipart/form-data" });
      return;
    }

    const busboy = (await import("busboy")).default;
    const bb = busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
    const chunks: Buffer[] = [];
    let fileReceived = false;

    await new Promise<void>((resolve, reject) => {
      bb.on("file", (_f, file) => {
        fileReceived = true;
        file.on("data", (c: Buffer) => chunks.push(c));
        file.on("end", () => {});
        file.on("error", reject);
      });
      bb.on("finish", resolve);
      bb.on("error", reject);
      req.pipe(bb);
    });

    if (!fileReceived || chunks.length === 0) {
      res.status(400).json({ error: "File Excel tidak ditemukan" });
      return;
    }

    const buffer = Buffer.concat(chunks);
    const wb = XLSX.read(buffer, { type: "buffer" });

    let ws = wb.Sheets[wb.SheetNames[0]];
    for (const name of wb.SheetNames) {
      if (name.toLowerCase().includes("kategori") || name.toLowerCase().includes("category")) {
        ws = wb.Sheets[name];
        break;
      }
    }

    const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const getVal = (row: any, ...keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
          return String(row[k]).trim();
        }
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const found = rowKeys.find(rk => rk.trim().toLowerCase() === k.toLowerCase());
        if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== "") {
          return String(row[found]).trim();
        }
      }
      return "";
    };

    if (rawRows.length === 0) {
      res.json({ success: 0, created: 0, updated: 0, failed: 0, skipped: 0, message: "File kosong" });
      return;
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const existingCategories = await db.select().from(categoriesTable);
    const categoryMap = new Map<string, typeof existingCategories[0]>();
    for (const c of existingCategories) {
      categoryMap.set(c.name.trim().toLowerCase(), c);
    }

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowIdx = i + 2;

      const name = getVal(row, "Nama Kategori", "Nama", "Kategori", "Category Name", "Category");
      if (!name) {
        skippedCount++;
        continue;
      }

      const description = getVal(row, "Deskripsi", "Description", "Keterangan", "Ket");

      try {
        const key = name.toLowerCase();
        const existing = categoryMap.get(key);

        if (existing) {
          await db
            .update(categoriesTable)
            .set({
              description: description || existing.description,
              updatedAt: new Date(),
            })
            .where(eq(categoriesTable.id, existing.id));
          updatedCount++;
        } else {
          const [newCat] = await db
            .insert(categoriesTable)
            .values({
              name,
              description: description || null,
            })
            .returning();
          categoryMap.set(key, newCat);
          createdCount++;
        }
      } catch (err: any) {
        errors.push(`Baris ${rowIdx} (${name}): ${err.message || "Gagal disimpan"}`);
      }
    }

    broadcastRefresh();

    res.json({
      success: createdCount + updatedCount,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: errors.length,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error("Import categories error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses file import" });
  }
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...cat, productCount: 0 });
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [cat] = await db.update(categoriesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...cat, productCount: 0 });
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: "Gagal menghapus kategori. Pastikan kategori tidak terpakai oleh barang." });
  }
});

export default router;
