import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, productRollsTable, saleItemsTable, purchaseItemsTable, purchasesTable, payablesTable } from "@workspace/db";
import { eq, ilike, and, lte, sql, inArray, desc } from "drizzle-orm";
import { CreateProductBody, UpdateProductBody, CreateProductRollBody, UpdateProductRollBody } from "@workspace/api-zod";
import { pushService } from "../lib/push";
import * as XLSX from "xlsx";

const router = Router();

async function syncProductStockFromRolls(productId: number) {
  const existingRolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, productId), eq(productRollsTable.status, "available")));
  const rollStock = existingRolls.length;
  const meterStock = existingRolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);
  await db.update(productsTable).set({
    rollStock: String(rollStock),
    meterStock: String(meterStock)
  }).where(eq(productsTable.id, productId));
}

// Helper: Sync purchase totals from all its items (keepPaid=true: keep existing paidAmount)
async function syncPurchaseTotals(purchaseId: number, keepPaid: boolean = true) {
  try {
    const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, purchaseId));
    if (items.length === 0) return;
    const newTotal = items.reduce((s, i) => s + parseFloat(i.subtotal || "0"), 0);
    const [purchase] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, purchaseId));
    if (!purchase) return;
    const existingPaid = keepPaid ? parseFloat(purchase.paidAmount || "0") : 0;
    const newStatus = existingPaid >= newTotal ? "lunas" : existingPaid > 0 ? "partial" : "tempo";
    await db.update(purchasesTable).set({ totalAmount: String(newTotal), paidAmount: String(existingPaid), status: newStatus, updatedAt: new Date() } as any).where(eq(purchasesTable.id, purchaseId));
    const [payable] = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, purchaseId));
    if (payable) {
      await db.update(payablesTable).set({ totalAmount: String(newTotal), paidAmount: String(existingPaid), status: newStatus === "lunas" ? "paid" : newStatus === "partial" ? "partial" : "unpaid", updatedAt: new Date() } as any).where(eq(payablesTable.purchaseId, purchaseId));
    } else if (newStatus !== "lunas") {
      await db.insert(payablesTable).values({ purchaseId, supplierId: purchase.supplierId, totalAmount: String(newTotal), paidAmount: String(existingPaid), status: newStatus === "partial" ? "partial" : "unpaid" } as any);
    }
// Helper: After a specific roll is changed/deleted, update ONLY the purchase item that originally created it.
async function syncPurchaseItemForSpecificRoll(productId: number, modifiedRollId: number) {
  try {
    const purchaseItems = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.productId, productId));
    let targetItem = null;
    let originalRollIndex = -1;
    let originalRollCount = 0;
    
    for (const item of purchaseItems) {
      if (!item.rollId) continue;
      const startRollId = item.rollId as number;
      
      let count = Number(item.rolls) || 0;
      if (item.rollLengthsJson) {
        try {
          const parsed = JSON.parse(item.rollLengthsJson);
          if (Array.isArray(parsed) && parsed.length > count) count = parsed.length;
        } catch(e){}
      }
      
      if (modifiedRollId >= startRollId && modifiedRollId < startRollId + count) {
        targetItem = item;
        originalRollIndex = modifiedRollId - startRollId;
        originalRollCount = count;
        break;
      }
    }
    
    if (!targetItem) return; 
    
    const rollIds = Array.from({ length: originalRollCount }, (_, i) => (targetItem.rollId as number) + i);
    const existingRolls = await db.select().from(productRollsTable).where(inArray(productRollsTable.id, rollIds));
    
    const rollLengths: number[] = [];
    for (const rollId of rollIds) {
      const roll = existingRolls.find(r => r.id === rollId);
      if (roll) rollLengths.push(parseFloat(roll.currentLength));
    }
    
    const newMeters = rollLengths.reduce((a,b) => a + b, 0);
    const newRolls = rollLengths.length;
    const pricePerMeter = parseFloat(targetItem.pricePerMeter || "0");
    const newSubtotal = Math.round(newMeters * pricePerMeter);
    
    await db.update(purchaseItemsTable).set({
      rollLengthsJson: JSON.stringify(rollLengths),
      meters: String(newMeters),
      rolls: String(newRolls),
      subtotal: String(newSubtotal)
    } as any).where(eq(purchaseItemsTable.id, targetItem.id));
    
    await syncPurchaseTotals(targetItem.purchaseId, true);
  } catch (e) { console.error("syncPurchaseItemForSpecificRoll error:", e); }
}

router.get("/products", async (req, res): Promise<void> => {
  const { categoryId, search, lowStock } = req.query;
  const conditions = [];
  if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId as string)));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      imageUrl: productsTable.imageUrl,
      description: productsTable.description,
      costPricePerMeter: productsTable.costPricePerMeter,
      costPricePerRoll: productsTable.costPricePerRoll,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
      minStock: productsTable.minStock,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.name);

  const result = products.map(p => ({
    ...p,
    costPricePerMeter: parseFloat(p.costPricePerMeter ?? "0"),
    costPricePerRoll: p.costPricePerRoll ? parseFloat(p.costPricePerRoll) : null,
    pricePerMeter: parseFloat(p.pricePerMeter ?? "0"),
    pricePerRoll: p.pricePerRoll ? parseFloat(p.pricePerRoll) : null,
    rollStock: parseFloat(p.rollStock ?? "0"),
    meterStock: parseFloat(p.meterStock ?? "0"),
    minStock: parseFloat(p.minStock ?? "0"),
    isLowStock: parseFloat(p.rollStock ?? "0") <= parseFloat(p.minStock ?? "0"),
  }));

  if (lowStock === "true") { res.json(result.filter(p => p.isLowStock)); return; }
  res.json(result);
});

// ─── GET /products/export ─────────────────────────────────────────────────────
router.get("/products/export", async (req, res): Promise<void> => {
  try {
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        barcode: productsTable.barcode,
        categoryName: categoriesTable.name,
        primaryUnit: productsTable.primaryUnit,
        secondaryUnit: productsTable.secondaryUnit,
        costPricePerMeter: productsTable.costPricePerMeter,
        pricePerMeter: productsTable.pricePerMeter,
        costPricePerRoll: productsTable.costPricePerRoll,
        pricePerRoll: productsTable.pricePerRoll,
        rollStock: productsTable.rollStock,
        meterStock: productsTable.meterStock,
        minStock: productsTable.minStock,
        description: productsTable.description,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(productsTable.name);

    // Get available rolls to populate Roll columns
    const allAvailableRolls = await db.select().from(productRollsTable).where(eq(productRollsTable.status, "available"));
    const rollsByProductId = new Map<number, any[]>();
    for (const r of allAvailableRolls) {
      if (!rollsByProductId.has(r.productId)) rollsByProductId.set(r.productId, []);
      rollsByProductId.get(r.productId)!.push(r);
    }

    let maxRolls = 0;
    for (const [_, rolls] of rollsByProductId) {
      if (rolls.length > maxRolls) maxRolls = rolls.length;
    }

    const rows: any[] = [];
    let rowNo = 1;

    for (const p of products) {
      const row: any = {
        "No": rowNo++,
        "Barcode": p.barcode || "",
        "Nama Barang": p.name || "",
        "Kategori": p.categoryName || "",
        "Unit 1": p.primaryUnit || "",
        "Unit 2": p.secondaryUnit || "",
        "Stok (Roll)": parseFloat(p.rollStock || "0"),
        "Stok (Meter)": parseFloat(p.meterStock || "0"),
        "Min Stok": parseFloat(p.minStock || "0"),
      };

      const productRolls = rollsByProductId.get(p.id) || [];
      for (let i = 1; i <= maxRolls; i++) {
        row[`Roll ${i}`] = productRolls[i - 1] ? parseFloat(productRolls[i - 1].currentLength) : "";
      }

      row["Harga Beli (M)"] = parseFloat(p.costPricePerMeter || "0");
      row["Harga Jual (M)"] = parseFloat(p.pricePerMeter || "0");
      row["Harga Beli (R)"] = parseFloat(p.costPricePerRoll || "0");
      row["Harga Jual (R)"] = parseFloat(p.pricePerRoll || "0");
      row["Deskripsi"] = p.description || "";

      rows.push(row);
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang");
    const filename = `Data_Barang.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err: any) {
    console.error("Export products error:", err);
    res.status(500).json({ error: err.message || "Export gagal" });
  }
});

// ─── POST /products/import ────────────────────────────────────────────────────
router.post("/products/import", async (req, res): Promise<void> => {
  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "Content-Type harus multipart/form-data" }); return;
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
      res.status(400).json({ error: "File Excel tidak ditemukan" }); return;
    }

    const buffer = Buffer.concat(chunks);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (rawRows.length === 0) {
      res.json({ success: 0, failed: 0, message: "File kosong" }); return;
    }

    const allCategories = await db.select().from(categoriesTable);
    const findCategory = (name: string) => allCategories.find(c => c.name.toLowerCase() === name?.trim().toLowerCase());

    let successCount = 0;
    const errors: string[] = [];

    for (const row of rawRows) {
      try {
        const name = String(row["Nama Barang"] || "").trim();
        if (!name) continue; // Skip empty rows

        let categoryId: number | null = null;
        const catName = String(row["Kategori"] || "").trim();
        if (catName) {
          let cat = findCategory(catName);
          if (!cat) {
            const [newCat] = await db.insert(categoriesTable).values({ name: catName }).returning();
            allCategories.push(newCat);
            cat = newCat;
          }
          categoryId = cat.id;
        }

        const barcode = String(row["Barcode"] || "").trim() || `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        let existingProd = (await db.select().from(productsTable).where(eq(productsTable.name, name)))[0];
        if (!existingProd && row["Barcode"]) {
           existingProd = (await db.select().from(productsTable).where(eq(productsTable.barcode, String(row["Barcode"]))))[0];
        }

        // Parse rolls
        const rollLengths: number[] = [];
        for (const key of Object.keys(row)) {
          if (key.startsWith("Roll ") && key !== "Roll") {
            const val = parseFloat(String(row[key]).replace(",", "."));
            if (!isNaN(val) && val > 0) {
               const rollIndexStr = key.replace("Roll ", "").trim();
               const rollIndex = parseInt(rollIndexStr, 10);
               if (!isNaN(rollIndex) && rollIndex > 0) {
                   rollLengths[rollIndex - 1] = val;
               }
            }
          }
        }
        const cleanRollLengths = rollLengths.filter(r => r !== undefined);
        const meterStock = cleanRollLengths.reduce((a, b) => a + b, 0);
        const rollStock = cleanRollLengths.length;

        // Base Data
        const prodData = {
          name, barcode, categoryId,
          primaryUnit: String(row["Unit 1"] || "METER").trim(),
          secondaryUnit: String(row["Unit 2"] || "ROLL").trim(),
          costPricePerMeter: String(parseFloat(String(row["Harga Beli (M)"] || "0").replace(",", ".")) || 0),
          pricePerMeter: String(parseFloat(String(row["Harga Jual (M)"] || "0").replace(",", ".")) || 0),
          costPricePerRoll: String(parseFloat(String(row["Harga Beli (R)"] || "0").replace(",", ".")) || 0),
          pricePerRoll: String(parseFloat(String(row["Harga Jual (R)"] || "0").replace(",", ".")) || 0),
          minStock: String(parseFloat(String(row["Min Stok"] || "0").replace(",", ".")) || 0),
          description: String(row["Deskripsi"] || "").trim(),
          rollStock: String(rollStock),
          meterStock: String(meterStock),
        };

        let prodId;
        if (existingProd) {
          await db.update(productsTable).set({ ...prodData, updatedAt: new Date() }).where(eq(productsTable.id, existingProd.id));
          prodId = existingProd.id;
        } else {
          const [newProd] = await db.insert(productsTable).values(prodData as any).returning();
          prodId = newProd.id;
        }

        // Sync rolls
        await db.delete(productRollsTable).where(and(eq(productRollsTable.productId, prodId), eq(productRollsTable.status, "available")));

        if (rollStock > 0) {
           const ts = Date.now();
           const rollsToInsert = cleanRollLengths.map((len, i) => ({
             productId: prodId,
             barcode: `${barcode}-R${ts}-${i + 1}-${Math.floor(Math.random() * 9999)}`,
             originalLength: String(len),
             currentLength: String(len),
             status: "available"
           }));
           await db.insert(productRollsTable).values(rollsToInsert as any);
        }

        successCount++;
      } catch (err: any) {
        errors.push(`Gagal memproses baris: ${err.message}`);
      }
    }

    res.json({ success: successCount, failed: errors.length, errors, message: "Import selesai" });
  } catch (err: any) {
    console.error("Import products error:", err);
    res.status(500).json({ error: err.message || "Import gagal" });
  }
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const barcodeToSave = d.barcode ? d.barcode : `PRD-${Date.now()}`;
  const { rollLengths: createRollLengths, ...productData } = d;
  const [prod] = await db.insert(productsTable).values({
    ...productData,
    barcode: barcodeToSave,
    primaryUnit: d.primaryUnit || "METER",
    secondaryUnit: d.secondaryUnit || "ROLL",
    costPricePerMeter: String(d.costPricePerMeter ?? 0),
    costPricePerRoll: d.costPricePerRoll != null ? String(d.costPricePerRoll) : null,
    pricePerMeter: String(d.pricePerMeter ?? 0),
    pricePerRoll: d.pricePerRoll != null ? String(d.pricePerRoll) : null,
    rollStock: String(d.rollStock ?? 0),
    meterStock: String(d.meterStock ?? 0),
    minStock: String(d.minStock ?? 0),
  }).returning();
    
    const rollStockNum = Math.floor(d.rollStock ?? 0);
    const meterStockNum = d.meterStock ?? 0;
    if (rollStockNum > 0) {
      const rollsToInsert = Array.from({ length: rollStockNum }).map((_, i) => {
      const lengthToUse = (createRollLengths && createRollLengths[i] != null && createRollLengths[i] > 0)
        ? createRollLengths[i]
        : (meterStockNum / rollStockNum);
        return {
          productId: prod.id,
          barcode: `${prod.barcode}-R${Date.now()}-${i + 1}`,
          originalLength: String(lengthToUse),
          currentLength: String(lengthToUse),
          status: "available",
        };
      });
      await db.insert(productRollsTable).values(rollsToInsert);
    }
    
  res.status(201).json({
    ...prod,
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: false,
    categoryName: null,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [prod] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      lotNumber: productsTable.lotNumber,
      rackLocation: productsTable.rackLocation,
      imageUrl: productsTable.imageUrl,
      description: productsTable.description,
      costPricePerMeter: productsTable.costPricePerMeter,
      costPricePerRoll: productsTable.costPricePerRoll,
      pricePerMeter: productsTable.pricePerMeter,
      pricePerRoll: productsTable.pricePerRoll,
      rollStock: productsTable.rollStock,
      meterStock: productsTable.meterStock,
      minStock: productsTable.minStock,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));
  if (!prod) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...prod,
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: parseFloat(prod.rollStock ?? "0") <= parseFloat(prod.minStock ?? "0"),
  });
});

router.get("/products/:id/rolls", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rolls = await db
    .select()
    .from(productRollsTable)
    .where(and(eq(productRollsTable.productId, id), eq(productRollsTable.status, "available")))
    .orderBy(productRollsTable.createdAt);
  
  res.json(rolls.map(r => ({
    ...r,
    originalLength: parseFloat(r.originalLength),
    currentLength: parseFloat(r.currentLength),
    createdAt: r.createdAt.toISOString()
  })));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.name != null) updateData.name = d.name;
  if (d.categoryId != null) updateData.categoryId = d.categoryId;
  if (d.barcode != null) updateData.barcode = d.barcode;
  if (d.primaryUnit != null) updateData.primaryUnit = d.primaryUnit;
  if (d.secondaryUnit != null) updateData.secondaryUnit = d.secondaryUnit;
  if (d.lotNumber != null) updateData.lotNumber = d.lotNumber;
  if (d.rackLocation != null) updateData.rackLocation = d.rackLocation;
  if (d.imageUrl !== undefined) updateData.imageUrl = d.imageUrl;
  if (d.description !== undefined) updateData.description = d.description;
  if (d.costPricePerMeter != null) updateData.costPricePerMeter = String(d.costPricePerMeter);
  if (d.costPricePerRoll != null) updateData.costPricePerRoll = String(d.costPricePerRoll);
  if (d.pricePerMeter != null) updateData.pricePerMeter = String(d.pricePerMeter);
  if (d.pricePerRoll != null) updateData.pricePerRoll = String(d.pricePerRoll);
  if (d.minStock != null) updateData.minStock = String(d.minStock);
  if (d.rollStock != null) updateData.rollStock = String(d.rollStock);
  if (d.meterStock != null) updateData.meterStock = String(d.meterStock);
  const [prod] = await db.update(productsTable).set(updateData as any).where(eq(productsTable.id, id)).returning();
  if (!prod) { res.status(404).json({ error: "Not found" }); return; }
  
  // Sync rolls
  const rollStockNum = Math.floor(parseFloat(prod.rollStock ?? "0"));
  const meterStockNum = parseFloat(prod.meterStock ?? "0");
  if (rollStockNum >= 0) {
    const existingRolls = await db.select().from(productRollsTable).where(eq(productRollsTable.productId, id));
    const currentRollCount = existingRolls.length;
    
    if (rollStockNum > currentRollCount) {
      const diff = rollStockNum - currentRollCount;
      const avgLength = rollStockNum > 0 ? (meterStockNum / rollStockNum) : 0;
      const updateRollLengths = d.rollLengths;
      const rollsToInsert = Array.from({ length: diff }).map((_, i) => {
        // i offset by currentRollCount so rollLengths index aligns with new rolls
        const offsetIdx = currentRollCount + i;
        const lengthToUse = (updateRollLengths && updateRollLengths[offsetIdx] != null && updateRollLengths[offsetIdx] > 0)
          ? updateRollLengths[offsetIdx]
          : avgLength;
        return {
          productId: prod.id,
          barcode: `${prod.barcode || `PRD-${prod.id}`}-R${Date.now()}-${i + 1}`,
          originalLength: String(lengthToUse),
          currentLength: String(lengthToUse),
          status: "available",
        };
      });
      if (rollsToInsert.length > 0) {
        await db.insert(productRollsTable).values(rollsToInsert);
      }
    } else if (rollStockNum < currentRollCount) {
      const diff = currentRollCount - rollStockNum;
      const availableRolls = existingRolls.filter(r => r.status === "available").sort((a, b) => b.id - a.id);
      const rollsToDelete = availableRolls.slice(0, diff).map(r => r.id);
      if (rollsToDelete.length > 0) {
        await db.delete(productRollsTable).where(inArray(productRollsTable.id, rollsToDelete));
      }
    }
  }

  try {
    await pushService.sendNotificationToAdmins(
      "📝 Perubahan Data Barang",
      `Data barang "${prod.name}" baru saja diubah.`,
      `/barang`
    );
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }

  res.json({
    ...prod,
    costPricePerMeter: parseFloat(prod.costPricePerMeter ?? "0"),
    costPricePerRoll: prod.costPricePerRoll ? parseFloat(prod.costPricePerRoll) : null,
    pricePerMeter: parseFloat(prod.pricePerMeter ?? "0"),
    pricePerRoll: prod.pricePerRoll ? parseFloat(prod.pricePerRoll) : null,
    rollStock: parseFloat(prod.rollStock ?? "0"),
    meterStock: parseFloat(prod.meterStock ?? "0"),
    minStock: parseFloat(prod.minStock ?? "0"),
    isLowStock: parseFloat(prod.rollStock ?? "0") <= parseFloat(prod.minStock ?? "0"),
    categoryName: null,
  });
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: "Gagal menghapus barang. Pastikan barang tidak memiliki riwayat transaksi/mutasi." });
  }
});

router.post("/products/:id/rolls", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = CreateProductRollBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  
  const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!prod) { res.status(404).json({ error: "Product not found" }); return; }

  const barcodeToSave = d.barcode ? d.barcode : `${prod.barcode || `PRD-${prod.id}`}-R${Date.now()}`;
  const [newRoll] = await db.insert(productRollsTable).values({
    productId: id,
    barcode: barcodeToSave,
    originalLength: String(d.originalLength),
    currentLength: String(d.currentLength),
    status: "available",
  }).returning();
  
  await syncProductStockFromRolls(id);
  
  res.status(201).json({
    ...newRoll,
    originalLength: parseFloat(newRoll.originalLength),
    currentLength: parseFloat(newRoll.currentLength),
    createdAt: newRoll.createdAt.toISOString()
  });
});

router.patch("/products/:id/rolls/:rollId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rollId = parseInt(req.params.rollId);
  const parsed = UpdateProductRollBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.barcode != null) updateData.barcode = d.barcode;
  if (d.originalLength != null) updateData.originalLength = String(d.originalLength);
  if (d.currentLength != null) updateData.currentLength = String(d.currentLength);

  const [updatedRoll] = await db.update(productRollsTable).set(updateData as any).where(and(eq(productRollsTable.id, rollId), eq(productRollsTable.productId, id))).returning();
  if (!updatedRoll) { res.status(404).json({ error: "Roll not found" }); return; }

  await syncProductStockFromRolls(id);
  await syncPurchaseItemForSpecificRoll(id, rollId);

  res.json({
    ...updatedRoll,
    originalLength: parseFloat(updatedRoll.originalLength),
    currentLength: parseFloat(updatedRoll.currentLength),
    createdAt: updatedRoll.createdAt.toISOString()
  });
});

router.delete("/products/:id/rolls/:rollId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const rollId = parseInt(req.params.rollId);

  try {
    // Find the purchase item this roll belongs to before nullifying its rollId
    const purchaseItems = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.productId, id));
    let targetPurchaseItemId = null;
    let originalRollCountForTarget = 0;
    for (const item of purchaseItems) {
      if (!item.rollId) continue;
      const startRollId = item.rollId as number;
      let count = Number(item.rolls) || 0;
      if (item.rollLengthsJson) {
        try {
          const parsed = JSON.parse(item.rollLengthsJson);
          if (Array.isArray(parsed) && parsed.length > count) count = parsed.length;
        } catch(e){}
      }
      if (rollId >= startRollId && rollId < startRollId + count) {
        targetPurchaseItemId = item.id;
        originalRollCountForTarget = count;
        break;
      }
    }

    // Nullify rollId references in sale_items and purchase_items to avoid FK constraint
    await db.update(saleItemsTable).set({ rollId: null }).where(eq(saleItemsTable.rollId, rollId));
    // Soft nullify in purchaseItems by doing nothing, wait, if we nullify it, we can't find the range again.
    // Actually, purchaseItemsTable.rollId CAN be nullified because we already stored targetPurchaseItemId.
    await db.update(purchaseItemsTable).set({ rollId: null }).where(eq(purchaseItemsTable.rollId, rollId));

    await db.delete(productRollsTable).where(and(eq(productRollsTable.id, rollId), eq(productRollsTable.productId, id)));

    await syncProductStockFromRolls(id);
    
    if (targetPurchaseItemId) {
      // Re-fetch the item because its rollId might have been nullified
      const [tItem] = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.id, targetPurchaseItemId));
      if (tItem) {
        // If its rollId was just nullified, we use the deleted rollId as the start
        const startRollId = (tItem.rollId as number) || rollId;
        const rollIds = Array.from({ length: originalRollCountForTarget }, (_, i) => startRollId + i);
        const existingRolls = await db.select().from(productRollsTable).where(inArray(productRollsTable.id, rollIds));
        const rollLengths: number[] = [];
        for (const rid of rollIds) {
          const r = existingRolls.find(x => x.id === rid);
          if (r) rollLengths.push(parseFloat(r.currentLength));
        }
        const newMeters = rollLengths.reduce((a,b) => a + b, 0);
        const newRolls = rollLengths.length;
        const pricePerMeter = parseFloat(tItem.pricePerMeter || "0");
        const newSubtotal = Math.round(newMeters * pricePerMeter);
        await db.update(purchaseItemsTable).set({
          rollLengthsJson: JSON.stringify(rollLengths),
          meters: String(newMeters),
          rolls: String(newRolls),
          subtotal: String(newSubtotal)
        } as any).where(eq(purchaseItemsTable.id, tItem.id));
        await syncPurchaseTotals(tItem.purchaseId, true);
      }
    }

    res.status(204).send();
  } catch (err: any) {
    console.error("Error deleting roll:", err);
    res.status(500).json({ error: err.message || "Gagal menghapus roll" });
  }
});

export default router;
