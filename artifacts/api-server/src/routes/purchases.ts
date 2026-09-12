import { Router } from "express";
import { db } from "@workspace/db";
import { purchasesTable, purchaseItemsTable, suppliersTable, productsTable, payablesTable, paymentsTable, stockMutationsTable, productRollsTable, saleItemsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";
import { CreatePurchaseBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import * as XLSX from "xlsx";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

// ─── GET /purchases/export ─────────────────────────────────────────────────────
router.get("/purchases/export", async (req, res): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(purchasesTable.createdAt, new Date(startDate as string)));
    if (endDate) {
      const endDt = new Date(endDate as string);
      endDt.setHours(23, 59, 59, 999);
      conditions.push(lte(purchasesTable.createdAt, endDt));
    }

    const purchases = await db
      .select({
        id: purchasesTable.id,
        invoiceNumber: purchasesTable.invoiceNumber,
        supplierId: purchasesTable.supplierId,
        supplierName: suppliersTable.name,
        paymentType: purchasesTable.paymentType,
        totalAmount: purchasesTable.totalAmount,
        paidAmount: purchasesTable.paidAmount,
        status: purchasesTable.status,
        dueDate: purchasesTable.dueDate,
        notes: purchasesTable.notes,
        createdAt: purchasesTable.createdAt,
      })
      .from(purchasesTable)
      .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(purchasesTable.createdAt));

    const purchaseIds = purchases.map(p => p.id);
    let itemsData: any[] = [];
    if (purchaseIds.length > 0) {
      itemsData = await db
        .select({
          purchaseId: purchaseItemsTable.purchaseId,
          productName: productsTable.name,
          barcode: productsTable.barcode,
          rolls: purchaseItemsTable.rolls,
          meters: purchaseItemsTable.meters,
          pricePerMeter: purchaseItemsTable.pricePerMeter,
          subtotal: purchaseItemsTable.subtotal,
          rollLengthsJson: purchaseItemsTable.rollLengthsJson,
        })
        .from(purchaseItemsTable)
        .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
        .where(inArray(purchaseItemsTable.purchaseId, purchaseIds));
    }

    const itemsByPurchaseId = new Map<number, any[]>();
    for (const item of itemsData) {
      if (!itemsByPurchaseId.has(item.purchaseId)) itemsByPurchaseId.set(item.purchaseId, []);
      itemsByPurchaseId.get(item.purchaseId)!.push(item);
    }

    const rows: any[] = [];
    let rowNo = 1;

    for (const p of purchases) {
      const items = itemsByPurchaseId.get(p.id) || [];
      const totalAmt = parseFloat(p.totalAmount as string) || 0;
      const paidAmt = parseFloat(p.paidAmount as string) || 0;
      const remaining = totalAmt - paidAmt;
      const tanggal = p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "";

      if (items.length === 0) {
        rows.push({
          "No": rowNo++, "Tanggal": tanggal,
          "No Invoice": p.invoiceNumber, "Supplier": p.supplierName || "",
          "Barcode": "", "Produk / Barang": "",
          "Roll": 0, "Meter/Yard": 0, "Detail Roll": "", "Harga / Meter": 0, "Subtotal": 0,
          "Total Nota": totalAmt, "Sudah Dibayar": paidAmt,
          "Sisa Bayar": remaining > 0 ? remaining : 0,
          "Metode Bayar": p.paymentType, "Status": p.status, "Catatan": p.notes || "",
        });
      } else {
        items.forEach((item, idx) => {
          rows.push({
            "No": idx === 0 ? rowNo++ : "",
            "Tanggal": idx === 0 ? tanggal : "",
            "No Invoice": idx === 0 ? p.invoiceNumber : "",
            "Supplier": idx === 0 ? (p.supplierName || "") : "",
            "Barcode": item.barcode || "",
            "Produk / Barang": item.productName || "",
            "Roll": parseFloat(item.rolls) || 0,
            "Meter/Yard": parseFloat(item.meters) || 0,
            "Detail Roll": item.rollLengthsJson ? (JSON.parse(item.rollLengthsJson) as number[]).map((r, i) => `R#${i + 1}: ${r}`).join(", ") : "",
            "Harga / Meter": parseFloat(item.pricePerMeter) || 0,
            "Subtotal": parseFloat(item.subtotal) || 0,
            "Total Nota": idx === 0 ? totalAmt : "",
            "Sudah Dibayar": idx === 0 ? paidAmt : "",
            "Sisa Bayar": idx === 0 ? (remaining > 0 ? remaining : 0) : "",
            "Metode Bayar": idx === 0 ? p.paymentType : "",
            "Status": idx === 0 ? p.status : "",
            "Catatan": idx === 0 ? (p.notes || "") : "",
          });
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 }, { wch: 14 }, { wch: 24 }, { wch: 22 }, { wch: 14 }, { wch: 24 },
      { wch: 8 }, { wch: 12 }, { wch: 40 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pembelian");

    const fromLabel = startDate ? (startDate as string).replace(/-/g, "") : "all";
    const toLabel = endDate ? (endDate as string).replace(/-/g, "") : "all";
    const filename = `Pembelian_${fromLabel}_sd_${toLabel}.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err: any) {
    console.error("Export purchases error:", err);
    res.status(500).json({ error: err.message || "Export gagal" });
  }
});

// ─── POST /purchases/import ────────────────────────────────────────────────────
router.post("/purchases/import", async (req, res): Promise<void> => {
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
      res.json({ success: 0, failed: 0, skipped: 0, total: 0, details: [] }); return;
    }

    const allProducts = await db.select({ id: productsTable.id, name: productsTable.name, barcode: productsTable.barcode }).from(productsTable);
    const allSuppliers = await db.select({ id: suppliersTable.id, name: suppliersTable.name }).from(suppliersTable);

    const findProduct = (name: string) => {
      const n = name?.trim().toLowerCase();
      return allProducts.find(p => p.name.toLowerCase() === n);
    };
    const findSupplier = (name: string) => {
      const n = name?.trim().toLowerCase();
      return allSuppliers.find(s => s.name.toLowerCase() === n);
    };

    // Group rows by invoice number
    const invoiceMap = new Map<string, any[]>();
    for (const row of rawRows) {
      const inv = String(row["No Invoice"] || "").trim();
      if (!inv) continue;
      if (!invoiceMap.has(inv)) invoiceMap.set(inv, []);
      invoiceMap.get(inv)!.push(row);
    }

    const results: { invoice: string; status: "ok" | "skip" | "error"; message: string }[] = [];
    let successCount = 0;

    for (const [invoiceNumber, rows] of invoiceMap) {
      try {
        const existing = await db.select({ id: purchasesTable.id }).from(purchasesTable)
          .where(sql`${purchasesTable.invoiceNumber} = ${invoiceNumber}`);
        if (existing.length > 0) {
          results.push({ invoice: invoiceNumber, status: "skip", message: "Invoice sudah ada, dilewati" });
          continue;
        }

        const firstRow = rows[0];
        const supplierName = String(firstRow["Supplier"] || "").trim();
        const paymentType = String(firstRow["Metode Bayar"] || "tunai").trim().toLowerCase();
        const notes = String(firstRow["Catatan"] || "").trim();
        const tanggalStr = String(firstRow["Tanggal"] || "").trim();

        // Parse tanggal
        let createdAt: Date | undefined;
        if (tanggalStr) {
          const parts = tanggalStr.includes("/") ? tanggalStr.split("/") : tanggalStr.split("-");
          if (parts.length === 3) {
            createdAt = tanggalStr.includes("/")
              ? new Date(`${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`)
              : new Date(tanggalStr);
          }
        }

        if (!supplierName) {
          results.push({ invoice: invoiceNumber, status: "error", message: "Kolom Supplier kosong" });
          continue;
        }
        const supplier = findSupplier(supplierName);
        if (!supplier) {
          results.push({ invoice: invoiceNumber, status: "error", message: `Supplier "${supplierName}" tidak ditemukan` });
          continue;
        }

        // Parse items
        const items: { productId: number; rolls: number; meters: number; pricePerMeter: number; subtotal: number }[] = [];
        const itemErrors: string[] = [];

        for (const row of rows) {
          const prodName = String(row["Produk / Barang"] || "").trim();
          if (!prodName) continue;
          const prod = findProduct(prodName);
          if (!prod) { itemErrors.push(`Produk "${prodName}" tidak ditemukan`); continue; }

          const rolls = parseFloat(String(row["Roll"]).replace(",", ".")) || 0;
          const meters = parseFloat(String(row["Meter/Yard"]).replace(",", ".")) || 0;
          const pricePerMeter = parseFloat(String(row["Harga / Meter"]).replace(",", ".")) || 0;
          const subtotal = parseFloat(String(row["Subtotal"]).replace(",", ".")) || Math.round(meters * pricePerMeter);
          items.push({ productId: prod.id, rolls, meters, pricePerMeter, subtotal });
        }

        if (itemErrors.length > 0) {
          results.push({ invoice: invoiceNumber, status: "error", message: itemErrors.join("; ") }); continue;
        }
        if (items.length === 0) {
          results.push({ invoice: invoiceNumber, status: "skip", message: "Tidak ada item barang valid" }); continue;
        }

        const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
        const isKredit = paymentType === "kredit" || paymentType === "tempo";
        const paidAmount = isKredit ? 0 : totalAmount;
        const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

        const [purchase] = await db.insert(purchasesTable).values({
          invoiceNumber,
          supplierId: supplier.id,
          paymentType,
          totalAmount: totalAmount.toString(),
          paidAmount: paidAmount.toString(),
          status,
          notes: notes || null,
          ...(createdAt && !isNaN(createdAt.getTime()) ? { createdAt } : {}),
        } as any).returning();

        for (const item of items) {
          const avgLength = item.rolls > 0 ? item.meters / item.rolls : 0;
          const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
          const baseBarcode = prod?.barcode || `PRD-${item.productId}`;
          let insertedRollId: number | null = null;

          for (let i = 0; i < item.rolls; i++) {
            const barcodeToSave = `${baseBarcode}-R${Date.now()}-${i}`;
            const [roll] = await db.insert(productRollsTable).values({
              productId: item.productId, barcode: barcodeToSave,
              originalLength: avgLength.toString(), currentLength: avgLength.toString(), status: "available",
            }).returning();
            if (i === 0) insertedRollId = roll.id;
          }

          await db.insert(purchaseItemsTable).values({
            purchaseId: purchase.id, productId: item.productId,
            rollId: insertedRollId, rolls: item.rolls.toString(),
            meters: item.meters.toString(), pricePerMeter: item.pricePerMeter.toString(),
            subtotal: item.subtotal.toString(),
          } as any);

          // Sync stock
          const rolls = await db.select().from(productRollsTable)
            .where(and(eq(productRollsTable.productId, item.productId), eq(productRollsTable.status, "available")));
          const newRollStock = rolls.length;
          const newMeterStock = rolls.reduce((s, r) => s + parseFloat(r.currentLength), 0);
          await db.execute(sql`UPDATE ${productsTable} SET roll_stock=${newRollStock}, meter_stock=${newMeterStock}, updated_at=NOW() WHERE id=${item.productId}`);

          await db.insert(stockMutationsTable).values({
            productId: item.productId, type: "masuk",
            rolls: item.rolls.toString(), meters: item.meters.toString(),
            description: `Import Pembelian ${invoiceNumber}`, reference: invoiceNumber,
          });
        }

        if (status !== "lunas") {
          await db.insert(payablesTable).values({
            purchaseId: purchase.id, supplierId: supplier.id,
            totalAmount: totalAmount.toString(), paidAmount: paidAmount.toString(),
            status: status === "partial" ? "partial" : "unpaid",
          });
        }

        successCount++;
        results.push({ invoice: invoiceNumber, status: "ok", message: `${items.length} item berhasil diimport` });
      } catch (err: any) {
        results.push({ invoice: invoiceNumber, status: "error", message: err.message || "Error tidak diketahui" });
      }
    }

    broadcastRefresh();
    res.json({
      success: successCount,
      failed: results.filter(r => r.status === "error").length,
      skipped: results.filter(r => r.status === "skip").length,
      total: invoiceMap.size,
      details: results,
    });
  } catch (err: any) {
    console.error("Import purchases error:", err);
    res.status(500).json({ error: err.message || "Import gagal" });
  }
});


router.get("/purchases", async (req, res) => {
  const { supplierId, startDate, endDate } = req.query;
  const conditions: any[] = [];
  if (supplierId) conditions.push(eq(purchasesTable.supplierId, parseInt(supplierId as string)));
  if (startDate) conditions.push(gte(purchasesTable.createdAt, new Date(startDate as string)));
  if (endDate) conditions.push(lte(purchasesTable.createdAt, new Date(endDate as string)));

  const purchases = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(purchasesTable.createdAt));

  res.json(purchases.map(p => ({
    ...p,
    totalAmount: numStr(p.totalAmount),
    paidAmount: numStr(p.paidAmount),
    remainingAmount: numStr(p.totalAmount) - numStr(p.paidAmount),
    dueDate: p.dueDate?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/purchases", async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { supplierId, paymentType, dueDate, notes, items } = parsed.data;
  const totalAmount = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);
  const paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
  const status = paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

  const invoiceNumber = parsed.data.invoiceNumber || `PO-${Date.now()}`;

  const [purchase] = await db.insert(purchasesTable).values({
    invoiceNumber,
    supplierId,
    paymentType,
    totalAmount: totalAmount.toString(),
    paidAmount: paidAmount.toString(),
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
    notes: notes ?? null,
  }).returning();

  for (const item of items) {
    const rollCount = Number(item.rolls) || 0;
    const totalMeters = Number(item.meters) || 0;
    
    // Auto-generate rolls if roll count > 0
    let insertedRollId: number | null = null;
    
    if (rollCount > 0) {
      const avgLength = totalMeters / rollCount;
      const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      const baseBarcode = prod?.barcode || `PRD-${item.productId}`;
      
      for (let i = 0; i < rollCount; i++) {
        // Only use the user-provided barcode for the first roll if specified, otherwise generate
        const barcodeToSave = (item.barcode && i === 0) ? item.barcode : `${baseBarcode}-R${Date.now()}-${i}`;
        
        // @ts-ignore - rollLengths exists on our updated schema
        const lengthToUse = (item.rollLengths && item.rollLengths[i]) ? item.rollLengths[i] : avgLength;
        
        const [roll] = await db.insert(productRollsTable).values({
          productId: item.productId,
          barcode: barcodeToSave,
          originalLength: lengthToUse.toString(),
          currentLength: lengthToUse.toString(),
          status: "available",
        }).returning();
        
        if (i === 0) insertedRollId = roll.id;
      }
    }

    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      productId: item.productId,
      rollId: insertedRollId,
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      pricePerMeter: item.pricePerMeter.toString(),
      subtotal: item.subtotal.toString(),
      // Simpan panjang tiap roll sebagai JSON agar bisa dipulihkan saat restore
      rollLengthsJson: (item.rollLengths && item.rollLengths.length > 0)
        ? JSON.stringify(item.rollLengths.map((l: any) => parseFloat(String(l).replace(',', '.')) || 0))
        : null,
    } as any);
    
    // Sync the product's meter_stock and roll_stock based on the productRollsTable
    const rolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, item.productId), eq(productRollsTable.status, "available")));
    const calculatedRollStock = rolls.length;
    const calculatedMeterStock = rolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);

    await db.execute(sql`
      UPDATE ${productsTable} 
      SET roll_stock = ${calculatedRollStock}, meter_stock = ${calculatedMeterStock}, updated_at = NOW()
      WHERE id = ${item.productId}
    `);
    
    await db.insert(stockMutationsTable).values({
      productId: item.productId,
      type: "masuk",
      rolls: item.rolls.toString(),
      meters: item.meters.toString(),
      description: `Pembelian ${invoiceNumber}`,
      reference: invoiceNumber,
    });
  }

  if (status !== "lunas") {
    await db.insert(payablesTable).values({
      purchaseId: purchase.id,
      supplierId,
      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      status: status === "partial" ? "partial" : "unpaid",
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  broadcastRefresh();
  res.status(201).json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    supplierName: null,
  });
});

// ────────── GET by invoice number (for restore cancelled purchase) ──────────
// MUST be registered BEFORE /purchases/:id to avoid Express matching "by-invoice" as an id
router.get("/purchases/by-invoice", async (req, res): Promise<void> => {
  const invoiceNumber = req.query.invoice as string;
  const [purchase] = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(eq(purchasesTable.invoiceNumber, invoiceNumber));

  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      productId: purchaseItemsTable.productId,
      productName: productsTable.name,
      categoryId: productsTable.categoryId,
      rollId: purchaseItemsTable.rollId,
      rollLengthsJson: purchaseItemsTable.rollLengthsJson,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
      primaryUnit: productsTable.primaryUnit,
      secondaryUnit: productsTable.secondaryUnit,
      barcode: productsTable.barcode,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .where(eq(purchaseItemsTable.purchaseId, purchase.id));

  const itemsWithRolls = await Promise.all(items.map(async (i) => {
    const rollCount = Number(i.rolls) || 0;
    let rollLengths: number[] = [];

    if (rollCount > 0) {
      // Priority 1: gunakan rollLengthsJson yang tersimpan saat pembelian dibuat
      if (i.rollLengthsJson) {
        try {
          const parsed = JSON.parse(i.rollLengthsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rollLengths = parsed.map(Number);
          }
        } catch {}
      }

      // Priority 2: coba ambil dari productRollsTable jika rollId masih ada
      if (rollLengths.length === 0 && i.rollId) {
        const rollIds = Array.from({ length: rollCount }, (_, idx) => (i.rollId as number) + idx);
        const rolls = await db
          .select({ id: productRollsTable.id, length: productRollsTable.originalLength })
          .from(productRollsTable)
          .where(inArray(productRollsTable.id, rollIds));
        if (rolls.length > 0) {
          rollLengths = rolls.map(r => parseFloat(r.length));
        }
      }

      // Priority 3: fallback ke rata-rata
      if (rollLengths.length === 0) {
        const avg = Number(i.meters) / rollCount;
        rollLengths = Array.from({ length: rollCount }, () => parseFloat(avg.toFixed(3)));
      }
    }
    return { ...i, rollLengths };
  }));

  res.json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    items: itemsWithRolls.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
      rollLengths: i.rollLengths,
    })),
  });
});

router.get("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [purchase] = await db
    .select({
      id: purchasesTable.id,
      invoiceNumber: purchasesTable.invoiceNumber,
      supplierId: purchasesTable.supplierId,
      supplierName: suppliersTable.name,
      paymentType: purchasesTable.paymentType,
      totalAmount: purchasesTable.totalAmount,
      paidAmount: purchasesTable.paidAmount,
      status: purchasesTable.status,
      dueDate: purchasesTable.dueDate,
      notes: purchasesTable.notes,
      createdAt: purchasesTable.createdAt,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(eq(purchasesTable.id, id));

  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      productId: purchaseItemsTable.productId,
      productName: productsTable.name,
      categoryId: productsTable.categoryId,
      rollId: purchaseItemsTable.rollId,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .where(eq(purchaseItemsTable.purchaseId, id));

  const itemsWithRolls = await Promise.all(items.map(async (i) => {
    const rollCount = Number(i.rolls) || 0;
    let rollLengths: number[] = [];
    if (rollCount > 0 && i.rollId) {
      const rollIds = Array.from({ length: rollCount }, (_, idx) => (i.rollId as number) + idx);
      const rolls = await db.select({ length: productRollsTable.originalLength }).from(productRollsTable).where(inArray(productRollsTable.id, rollIds));
      rollLengths = rolls.map(r => parseFloat(r.length));
    }
    return { ...i, rollLengths };
  }));

  res.json({
    ...purchase,
    totalAmount: numStr(purchase.totalAmount),
    paidAmount: numStr(purchase.paidAmount),
    remainingAmount: numStr(purchase.totalAmount) - numStr(purchase.paidAmount),
    dueDate: purchase.dueDate?.toISOString() ?? null,
    createdAt: purchase.createdAt.toISOString(),
    items: itemsWithRolls.map(i => ({
      ...i,
      rollId: i.rollId,
      rolls: numStr(i.rolls),
      meters: numStr(i.meters),
      pricePerMeter: numStr(i.pricePerMeter),
      subtotal: numStr(i.subtotal),
      rollLengths: i.rollLengths,
    })),
  });

});

router.delete("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [purchase] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, id));
  if (!purchase) { res.status(404).json({ error: "Not found" }); return; }

  try {
    // Get items into memory first (kept for stock rollback & mutations)
    const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, id));

    for (const item of items) {
      const rollCount = Number(item.rolls) || 0;
      if (rollCount > 0 && item.rollId) {
        // Delete rolls created for this purchase item using barcode pattern (PO invoice number)
        // Rolls created by this purchase have IDs starting from item.rollId (first roll inserted)
        const rollIds = Array.from({ length: rollCount }, (_, i) => (item.rollId as number) + i);
        
        // Only delete rolls that still belong to this product (safety check)
        const rollsToDelete = await db.select()
          .from(productRollsTable)
          .where(
            and(
              eq(productRollsTable.productId, item.productId),
              inArray(productRollsTable.id, rollIds)
            )
          );

        if (rollsToDelete.length > 0) {
          const rollIdsToDelete = rollsToDelete.map(r => r.id);
          // Unlink from sale_items to avoid FK constraint
          await db.update(saleItemsTable).set({ rollId: null }).where(inArray(saleItemsTable.rollId, rollIdsToDelete));
          // Unlink from purchase_items to avoid FK constraint (soft delete keeps purchase_items)
          await db.update(purchaseItemsTable).set({ rollId: null }).where(inArray(purchaseItemsTable.rollId, rollIdsToDelete));
          await db.delete(productRollsTable).where(inArray(productRollsTable.id, rollIdsToDelete));
        }
      }

      // Record stock mutation
      await db.insert(stockMutationsTable).values({
        productId: item.productId,
        type: "keluar",
        rolls: item.rolls.toString(),
        meters: item.meters.toString(),
        description: `Batal Pembelian ${purchase.invoiceNumber}`,
        reference: purchase.invoiceNumber,
      });

      // Sync product stock
      const rolls = await db.select().from(productRollsTable).where(and(eq(productRollsTable.productId, item.productId), eq(productRollsTable.status, "available")));
      const calculatedRollStock = rolls.length;
      const calculatedMeterStock = rolls.reduce((sum, r) => sum + parseFloat(r.currentLength), 0);

      await db.execute(sql`
        UPDATE ${productsTable} 
        SET roll_stock = ${calculatedRollStock}, meter_stock = ${calculatedMeterStock}, updated_at = NOW()
        WHERE id = ${item.productId}
      `);
    }

    // Find and delete payments linked to payables of this purchase
    const relatedPayables = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, id));
    if (relatedPayables.length > 0) {
      for (const payable of relatedPayables) {
        await db.delete(paymentsTable).where(eq(paymentsTable.payableId, payable.id));
      }
      await db.delete(payablesTable).where(eq(payablesTable.purchaseId, id));
    }

    // SOFT DELETE: mark purchase as cancelled instead of hard deleting
    // This preserves purchase_items so detail roll can be restored later
    await db.update(purchasesTable).set({ status: "cancelled" } as any).where(eq(purchasesTable.id, id));

    broadcastRefresh();
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting purchase:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
