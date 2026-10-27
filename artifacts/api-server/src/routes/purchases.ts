import { Router } from "express";
import { db } from "@workspace/db";
import { purchasesTable, purchaseItemsTable, suppliersTable, productsTable, categoriesTable, payablesTable, paymentsTable, stockMutationsTable, productRollsTable, saleItemsTable } from "@workspace/db";
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
          categoryName: categoriesTable.name,
          barcode: productsTable.barcode,
          primaryUnit: productsTable.primaryUnit,
          rolls: purchaseItemsTable.rolls,
          meters: purchaseItemsTable.meters,
          pricePerMeter: purchaseItemsTable.pricePerMeter,
          subtotal: purchaseItemsTable.subtotal,
          rollLengthsJson: purchaseItemsTable.rollLengthsJson,
        })
        .from(purchaseItemsTable)
        .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(inArray(purchaseItemsTable.purchaseId, purchaseIds));
    }

    const itemsByPurchaseId = new Map<number, any[]>();
    for (const item of itemsData) {
      if (!itemsByPurchaseId.has(item.purchaseId)) itemsByPurchaseId.set(item.purchaseId, []);
      itemsByPurchaseId.get(item.purchaseId)!.push(item);
    }

    // Calculate max rolls for dynamic columns
    let maxRolls = 0;
    for (const item of itemsData) {
      if (item.rollLengthsJson) {
        const rolls = JSON.parse(item.rollLengthsJson) as number[];
        if (rolls.length > maxRolls) maxRolls = rolls.length;
      }
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
        const row: any = {
          "No": rowNo++,
          "Tanggal": tanggal,
          "No Invoice": p.invoiceNumber,
          "Supplier": p.supplierName || "",
          "Barcode": "",
          "Kategori": "",
          "Produk / Barang": "",
          "Satuan": "METER",
          "Roll": 0,
          "Meter/Yard": 0,
          "Harga / Satuan": 0,
          "Subtotal": 0,
          "Total Nota": totalAmt,
          "Sudah Dibayar": paidAmt,
          "Sisa Bayar": remaining > 0 ? remaining : 0,
          "Metode Bayar": p.paymentType,
          "Status": p.status,
          "Catatan": p.notes || "",
        };
        for (let i = 1; i <= maxRolls; i++) row[`Roll ${i}`] = "";
        rows.push(row);
      } else {
        items.forEach((item, idx) => {
          const row: any = {
            "No": idx === 0 ? rowNo++ : "",
            "Tanggal": idx === 0 ? tanggal : "",
            "No Invoice": idx === 0 ? p.invoiceNumber : "",
            "Supplier": idx === 0 ? (p.supplierName || "") : "",
            "Barcode": item.barcode || "",
            "Kategori": item.categoryName || "",
            "Produk / Barang": item.productName || "",
            "Satuan": item.primaryUnit || "METER",
            "Roll": parseFloat(item.rolls) || 0,
            "Meter/Yard": parseFloat(item.meters) || 0,
            "Harga / Satuan": parseFloat(item.pricePerMeter) || 0,
            "Subtotal": parseFloat(item.subtotal) || 0,
            "Total Nota": idx === 0 ? totalAmt : "",
            "Sudah Dibayar": idx === 0 ? paidAmt : "",
            "Sisa Bayar": idx === 0 ? (remaining > 0 ? remaining : 0) : "",
            "Metode Bayar": idx === 0 ? p.paymentType : "",
            "Status": idx === 0 ? p.status : "",
            "Catatan": idx === 0 ? (p.notes || "") : "",
          };
          
          let rollLengths: number[] = [];
          if (item.rollLengthsJson) {
            rollLengths = JSON.parse(item.rollLengthsJson) as number[];
          }
          for (let i = 1; i <= maxRolls; i++) {
            row[`Roll ${i}`] = rollLengths[i - 1] !== undefined ? rollLengths[i - 1] : "";
          }
          
          rows.push(row);
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 },  // No
      { wch: 12 }, // Tanggal
      { wch: 22 }, // No Invoice
      { wch: 22 }, // Supplier
      { wch: 18 }, // Barcode
      { wch: 22 }, // Kategori
      { wch: 26 }, // Produk / Barang
      { wch: 10 }, // Satuan
      { wch: 8 },  // Roll
      { wch: 12 }, // Meter/Yard
      { wch: 16 }, // Harga / Satuan
      { wch: 16 }, // Subtotal
      { wch: 16 }, // Total Nota
      { wch: 16 }, // Sudah Dibayar
      { wch: 16 }, // Sisa Bayar
      { wch: 14 }, // Metode Bayar
      { wch: 12 }, // Status
      { wch: 24 }, // Catatan
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

// ─── POST /purchases/preview-import ───────────────────────────────────────────
router.post("/purchases/preview-import", async (req, res): Promise<void> => {
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

    let ws = wb.Sheets[wb.SheetNames[0]];
    for (const name of wb.SheetNames) {
      if (name.toLowerCase().includes("pembelian")) {
        ws = wb.Sheets[name];
        break;
      }
    }

    let rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (rawRows.length > 0 && !Object.keys(rawRows[0]).some(k => k.toLowerCase().includes("invoice"))) {
      for (const name of wb.SheetNames) {
        const tempWs = wb.Sheets[name];
        const tempRows: any[] = XLSX.utils.sheet_to_json(tempWs, { defval: "" });
        if (tempRows.length > 0 && Object.keys(tempRows[0]).some(k => k.toLowerCase().includes("invoice"))) {
          ws = tempWs;
          rawRows = tempRows;
          break;
        }
      }
    }

    if (rawRows.length === 0) {
      res.json({
        summary: {
          totalRows: 0,
          totalInvoices: 0,
          newInvoices: 0,
          existingInvoices: 0,
          newProducts: 0,
          existingProducts: 0,
          unknownCategories: 0,
          zeroPriceItems: 0,
          totalMeters: 0,
          totalRolls: 0,
          totalEstimatedAmount: 0
        },
        rows: []
      });
      return;
    }

    const allProducts = await db.select({
      id: productsTable.id,
      name: productsTable.name,
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      categoryId: productsTable.categoryId,
      costPricePerMeter: productsTable.costPricePerMeter,
      pricePerMeter: productsTable.pricePerMeter,
    }).from(productsTable);
    const allSuppliers = await db.select({ id: suppliersTable.id, name: suppliersTable.name }).from(suppliersTable);
    const allCategories = await db.select().from(categoriesTable);
    const existingPurchases = await db.select({ invoiceNumber: purchasesTable.invoiceNumber, supplierId: purchasesTable.supplierId }).from(purchasesTable);

    function cleanStr(s: string): string {
      return (s || "")
        .toLowerCase()
        .replace(/[_\-\.\,\/\(\)\[\]\+]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function levenshteinDistance(a: string, b: string): number {
      if (a === b) return 0;
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix: number[][] = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    function isSimilarName(nameA: string, nameB: string): boolean {
      const a = cleanStr(nameA);
      const b = cleanStr(nameB);
      if (!a || !b) return false;
      if (a === b) return true;
      const aNoSpace = a.replace(/\s/g, "");
      const bNoSpace = b.replace(/\s/g, "");
      if (aNoSpace === bNoSpace) return true;
      const aWords = a.split(" ").sort().join(" ");
      const bWords = b.split(" ").sort().join(" ");
      if (aWords === bWords) return true;
      const maxLen = Math.max(a.length, b.length);
      const dist = levenshteinDistance(a, b);
      if (maxLen > 7 && dist <= 2) return true;
      if (maxLen >= 5 && dist <= 1) return true;
      return false;
    }

    const findProduct = (name: string, barcode?: string, targetCategoryId?: number | null) => {
      const bc = barcode?.trim();
      if (bc) {
        const byBc = allProducts.find(p => p.barcode && p.barcode.toLowerCase() === bc.toLowerCase());
        if (byBc) return byBc;
      }
      const rawName = name?.trim();
      if (!rawName) return undefined;
      const nLower = rawName.toLowerCase();
      const exact = allProducts.find(p => p.name.toLowerCase() === nLower);
      if (exact) return exact;
      const cleanInput = cleanStr(rawName);
      const cleanMatch = allProducts.find(p => cleanStr(p.name) === cleanInput);
      if (cleanMatch) return cleanMatch;
      if (targetCategoryId) {
        const catProducts = allProducts.filter(p => p.categoryId === targetCategoryId);
        const fuzzyInCat = catProducts.find(p => isSimilarName(p.name, rawName));
        if (fuzzyInCat) return fuzzyInCat;
      }
      const fuzzyGlobal = allProducts.find(p => isSimilarName(p.name, rawName));
      if (fuzzyGlobal) return fuzzyGlobal;
      return undefined;
    };

    const findSupplier = (name: string) => {
      const n = name?.trim();
      if (!n) return undefined;
      const exact = allSuppliers.find(s => s.name.toLowerCase() === n.toLowerCase());
      if (exact) return exact;
      return allSuppliers.find(s => cleanStr(s.name) === cleanStr(n) || isSimilarName(s.name, n));
    };

    const findCategory = (name: string): { category: any | null; status: "exact" | "fuzzy" | "not_found" } => {
      const n = name?.trim();
      if (!n) return { category: null, status: "not_found" };
      const exact = allCategories.find(c => c.name.toLowerCase() === n.toLowerCase());
      if (exact) return { category: exact, status: "exact" };
      const fuzzy = allCategories.find(c => cleanStr(c.name) === cleanStr(n) || isSimilarName(c.name, n));
      if (fuzzy) return { category: fuzzy, status: "fuzzy" };
      return { category: null, status: "not_found" };
    };

    const getVal = (row: any, ...keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
          return row[k];
        }
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const found = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
        if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== "") {
          return row[found];
        }
      }
      return "";
    };

    function parseExcelDate(val: any, inv: string): string {
      if (!val && !inv) return "-";
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      if (typeof val === "number" || (!isNaN(Number(val)) && !String(val).includes("/") && !String(val).includes("-"))) {
        const num = Number(val);
        if (num > 30000 && num < 60000) {
          const utcDays = num - 25569;
          const utcValue = utcDays * 86400;
          const d = new Date(utcValue * 1000);
          return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        }
      }
      const str = String(val || "").trim();
      if (str) return str;
      const match = String(inv || "").match(/(\d{4})(\d{2})(\d{2})/);
      if (match) return `${match[3]}/${match[2]}/${match[1]}`;
      return "-";
    }

    const previewRows: any[] = [];
    let currentInvoice = "";
    let currentSupplier = "";
    let currentDate = "";

    const seenInvoices = new Set<string>();
    let totalInvoices = 0;
    let existingInvoicesCount = 0;
    let newInvoicesCount = 0;
    let newProductsCount = 0;
    let existingProductsCount = 0;
    let unknownCategoriesCount = 0;
    let zeroPriceItemsCount = 0;
    let totalMetersSum = 0;
    let totalRollsSum = 0;
    let totalEstimatedAmountSum = 0;

    let rowIndex = 0;
    for (const row of rawRows) {
      rowIndex++;
      const invFromRow = String(getVal(row, "No Invoice", "No. Invoice", "Nomor Invoice", "Invoice", "No Nota", "No Faktur") || "").trim();
      const supFromRow = String(getVal(row, "Supplier", "Nama Supplier", "Vendor") || "").trim();
      const dateFromRow = getVal(row, "Tanggal", "Date", "Tgl") || row["Tanggal"];

      if (invFromRow) currentInvoice = invFromRow;
      if (supFromRow) currentSupplier = supFromRow;
      if (dateFromRow) currentDate = parseExcelDate(dateFromRow, currentInvoice);

      const prodName = String(getVal(row, "Produk / Barang", "Nama Barang", "Produk", "Nama Produk", "Barang", "Item", "Nama") || "").trim();
      if (!prodName && !invFromRow) continue; // Skip baris benar-benar kosong

      const catName = String(getVal(row, "Kategori", "Category", "Jenis") || "").trim();
      const catCheck = catName ? findCategory(catName) : { category: null, status: "not_found" as const };

      const rawBarcode = String(getVal(row, "Barcode", "Kode Barang", "Kode", "SKU") || "").trim();
      const prod = findProduct(prodName, rawBarcode, catCheck.category?.id);

      const rawUnit = String(getVal(row, "Satuan", "Unit", "Satuan Barang", "Unit 1") || "").trim().toLowerCase();
      let detectedUnit = "METER";
      if (rawUnit.includes("yard") || rawUnit.includes("yd") || rawUnit.includes("yds") || rawUnit.startsWith("yar")) {
        detectedUnit = "YARD";
      } else if (rawUnit.includes("meter") || rawUnit.includes("mtr") || rawUnit === "m") {
        detectedUnit = "METER";
      } else if (row["Yard"] !== undefined || row["Stok (Yard)"] !== undefined || row["Harga / Yard"] !== undefined) {
        detectedUnit = "YARD";
      } else if (prod?.primaryUnit) {
        detectedUnit = prod.primaryUnit;
      } else if (catCheck.category?.primaryUnit) {
        detectedUnit = catCheck.category.primaryUnit;
      }

      let rollsCount = parseFloat(String(getVal(row, "Roll", "Jumlah Roll", "Stok (Roll)", "Stok Roll", "Qty Roll") || "0").replace(",", ".")) || 0;
      const rollLengths: number[] = [];
      for (const key of Object.keys(row)) {
        const kLower = key.toLowerCase().trim();
        if (kLower.startsWith("roll ") || kLower.startsWith("roll #") || kLower.startsWith("roll-")) {
          const numStr = kLower.replace(/^roll\s*[#\-]?\s*/i, "").trim();
          const rollIndex = parseInt(numStr, 10);
          if (!isNaN(rollIndex) && rollIndex > 0) {
            const val = parseFloat(String(row[key]).replace(",", "."));
            if (!isNaN(val) && val > 0) rollLengths[rollIndex - 1] = val;
          }
        }
      }
      const cleanRollLengths = rollLengths.filter(r => r !== undefined);
      if (rollsCount === 0 && cleanRollLengths.length > 0) rollsCount = cleanRollLengths.length;

      let meters = parseFloat(String(getVal(row, "Meter/Yard", "Qty (YARD)", "Qty (METER)", "Qty (Yard)", "Qty (Meter)", "Yard", "Meter", "Qty", "Jumlah", "Panjang", "Total Panjang", "Stok Meter", "Stok Yard") || "0").replace(",", ".")) || 0;
      let metersAutoCalculated = false;
      if (meters === 0 && cleanRollLengths.length > 0) {
        meters = parseFloat(cleanRollLengths.reduce((a, b) => a + b, 0).toFixed(3));
        metersAutoCalculated = true;
      }

      let pricePerMeter = parseFloat(String(getVal(row, "Harga / Satuan", "Harga / Meter", "Harga / Yard", "Harga Satuan", "Harga Beli", "Harga / Qty", "Harga") || "0").replace(",", ".")) || 0;
      let priceFromFallback = false;
      if (!pricePerMeter || pricePerMeter === 0) {
        if (prod?.costPricePerMeter && parseFloat(String(prod.costPricePerMeter)) > 0) {
          pricePerMeter = parseFloat(String(prod.costPricePerMeter));
          priceFromFallback = true;
        } else if (catCheck.category?.costPricePerMeter && parseFloat(String(catCheck.category.costPricePerMeter)) > 0) {
          pricePerMeter = parseFloat(String(catCheck.category.costPricePerMeter));
          priceFromFallback = true;
        } else if (catCheck.category?.pricePerMeter && parseFloat(String(catCheck.category.pricePerMeter)) > 0) {
          pricePerMeter = parseFloat(String(catCheck.category.pricePerMeter));
          priceFromFallback = true;
        }
      }

      const rawSubtotal = parseFloat(String(getVal(row, "Subtotal", "Total", "Jumlah Harga") || "0").replace(",", ".")) || 0;
      const subtotal = rawSubtotal > 0 ? rawSubtotal : Math.round(meters * pricePerMeter);

      const supplierObj = findSupplier(currentSupplier);
      const supplierIsNew = !supplierObj;

      let invoiceExists = false;
      if (currentInvoice && supplierObj) {
        invoiceExists = existingPurchases.some(ep => ep.invoiceNumber === currentInvoice && ep.supplierId === supplierObj.id);
      }

      if (currentInvoice && !seenInvoices.has(currentInvoice)) {
        seenInvoices.add(currentInvoice);
        totalInvoices++;
        if (invoiceExists) existingInvoicesCount++;
        else newInvoicesCount++;
      }

      if (prod) existingProductsCount++;
      else if (prodName) newProductsCount++;

      if (catName && catCheck.status === "not_found") unknownCategoriesCount++;
      if (pricePerMeter === 0) zeroPriceItemsCount++;

      totalMetersSum += meters;
      totalRollsSum += rollsCount;
      totalEstimatedAmountSum += subtotal;

      const warnings: string[] = [];
      const errors: string[] = [];

      if (!prodName) {
        errors.push("Nama barang tidak ada / kosong");
      }
      if (!currentSupplier) {
        errors.push("Supplier tidak ada / kosong");
      }
      if (invoiceExists) {
        warnings.push(`Invoice ${currentInvoice} sudah ada di sistem (akan dilewati agar stok tidak dobel)`);
      }
      if (catName && catCheck.status === "not_found") {
        warnings.push(`Kategori "${catName}" tidak ada di Master Kategori (akan dibuat otomatis dgn harga Rp 0)`);
      }
      if (pricePerMeter === 0) {
        warnings.push("Harga Beli Rp 0 / belum diisi");
      } else if (priceFromFallback) {
        warnings.push(`Harga diambil otomatis dari ${prod?.costPricePerMeter ? "Master Barang" : "Master Kategori"} (Rp ${pricePerMeter.toLocaleString("id-ID")})`);
      }
      if (metersAutoCalculated) {
        warnings.push(`Panjang (${meters.toLocaleString("id-ID")} ${detectedUnit}) dihitung otomatis dari penjumlahan roll`);
      }
      if (!prod && prodName) {
        warnings.push("Barang baru (akan otomatis didaftarkan ke Master Barang)");
      }

      let rowStatus: "ready" | "warning" | "skip" | "error" = "ready";
      if (errors.length > 0) rowStatus = "error";
      else if (invoiceExists) rowStatus = "skip";
      else if (warnings.length > 0) rowStatus = "warning";

      previewRows.push({
        rowNumber: rowIndex,
        invoiceNumber: currentInvoice || "-",
        supplierName: currentSupplier || "-",
        supplierIsNew,
        date: currentDate || "-",
        productName: prodName || "(Tanpa Nama)",
        productExists: !!prod,
        matchedProductName: prod ? prod.name : undefined,
        barcode: rawBarcode || (prod?.barcode ?? ""),
        categoryName: catName || "-",
        categoryStatus: catCheck.status,
        matchedCategoryName: catCheck.category?.name,
        unit: detectedUnit,
        rolls: rollsCount,
        meters,
        pricePerMeter,
        subtotal,
        invoiceExists,
        status: rowStatus,
        keterangan: [...errors, ...warnings]
      });
    }

    res.json({
      summary: {
        totalRows: previewRows.length,
        totalInvoices,
        newInvoices: newInvoicesCount,
        existingInvoices: existingInvoicesCount,
        newProducts: newProductsCount,
        existingProducts: existingProductsCount,
        unknownCategories: unknownCategoriesCount,
        zeroPriceItems: zeroPriceItemsCount,
        totalMeters: Math.round(totalMetersSum * 100) / 100,
        totalRolls: Math.round(totalRollsSum * 100) / 100,
        totalEstimatedAmount: totalEstimatedAmountSum,
      },
      rows: previewRows
    });
  } catch (err: any) {
    console.error("Preview import error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses preview file Excel" });
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
    
    // Cari sheet yang tepat (prioritaskan yang namanya mengandung "Pembelian")
    let ws = wb.Sheets[wb.SheetNames[0]];
    for (const name of wb.SheetNames) {
      if (name.toLowerCase().includes("pembelian")) {
        ws = wb.Sheets[name];
        break;
      }
    }
    
    let rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // Jika tidak ada kolom "No Invoice" di sheet ini, coba cari di sheet lain
    if (rawRows.length > 0 && !Object.keys(rawRows[0]).some(k => k.toLowerCase().includes("invoice"))) {
      for (const name of wb.SheetNames) {
        const tempWs = wb.Sheets[name];
        const tempRows: any[] = XLSX.utils.sheet_to_json(tempWs, { defval: "" });
        if (tempRows.length > 0 && Object.keys(tempRows[0]).some(k => k.toLowerCase().includes("invoice"))) {
          ws = tempWs;
          rawRows = tempRows;
          break;
        }
      }
    }

    if (rawRows.length === 0) {
      res.json({ success: 0, failed: 0, skipped: 0, total: 0, details: [] }); return;
    }

    const allProducts = await db.select({
      id: productsTable.id,
      name: productsTable.name,
      barcode: productsTable.barcode,
      primaryUnit: productsTable.primaryUnit,
      categoryId: productsTable.categoryId,
      costPricePerMeter: productsTable.costPricePerMeter,
      pricePerMeter: productsTable.pricePerMeter,
    }).from(productsTable);
    const allSuppliers = await db.select({ id: suppliersTable.id, name: suppliersTable.name }).from(suppliersTable);
    const allCategories = await db.select().from(categoriesTable);

    function cleanStr(s: string): string {
      return (s || "")
        .toLowerCase()
        .replace(/[_\-\.\,\/\(\)\[\]\+]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function levenshteinDistance(a: string, b: string): number {
      if (a === b) return 0;
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix: number[][] = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    function isSimilarName(nameA: string, nameB: string): boolean {
      const a = cleanStr(nameA);
      const b = cleanStr(nameB);
      if (!a || !b) return false;
      if (a === b) return true;
      const aNoSpace = a.replace(/\s/g, "");
      const bNoSpace = b.replace(/\s/g, "");
      if (aNoSpace === bNoSpace) return true;
      const aWords = a.split(" ").sort().join(" ");
      const bWords = b.split(" ").sort().join(" ");
      if (aWords === bWords) return true;
      const maxLen = Math.max(a.length, b.length);
      const dist = levenshteinDistance(a, b);
      if (maxLen > 7 && dist <= 2) return true;
      if (maxLen >= 5 && dist <= 1) return true;
      return false;
    }

    const findProduct = (name: string, barcode?: string, targetCategoryId?: number | null) => {
      const bc = barcode?.trim();
      if (bc) {
        const byBc = allProducts.find(p => p.barcode && p.barcode.toLowerCase() === bc.toLowerCase());
        if (byBc) return byBc;
      }
      const rawName = name?.trim();
      if (!rawName) return undefined;

      // 1. Exact match (case-insensitive)
      const nLower = rawName.toLowerCase();
      const exact = allProducts.find(p => p.name.toLowerCase() === nLower);
      if (exact) return exact;

      // 2. Normalized match (abaikan tanda baca & spasi)
      const cleanInput = cleanStr(rawName);
      const cleanMatch = allProducts.find(p => cleanStr(p.name) === cleanInput);
      if (cleanMatch) return cleanMatch;

      // 3. Typo-tolerant match dalam kategori yang sama
      if (targetCategoryId) {
        const catProducts = allProducts.filter(p => p.categoryId === targetCategoryId);
        const fuzzyInCat = catProducts.find(p => isSimilarName(p.name, rawName));
        if (fuzzyInCat) return fuzzyInCat;
      }

      // 4. Global typo-tolerant match
      const fuzzyGlobal = allProducts.find(p => isSimilarName(p.name, rawName));
      if (fuzzyGlobal) return fuzzyGlobal;

      return undefined;
    };

    const findSupplier = (name: string) => {
      const n = name?.trim();
      if (!n) return undefined;
      const exact = allSuppliers.find(s => s.name.toLowerCase() === n.toLowerCase());
      if (exact) return exact;
      return allSuppliers.find(s => cleanStr(s.name) === cleanStr(n) || isSimilarName(s.name, n));
    };

    const findCategory = (name: string) => {
      const n = name?.trim();
      if (!n) return undefined;
      const exact = allCategories.find(c => c.name.toLowerCase() === n.toLowerCase());
      if (exact) return exact;
      return allCategories.find(c => cleanStr(c.name) === cleanStr(n) || isSimilarName(c.name, n));
    };

    // Group rows by invoice number + supplier (carry over if blank)
    const invoiceMap = new Map<string, any[]>();
    let currentInvKey = "";
    
    for (const row of rawRows) {
      const inv = String(row["No Invoice"] || "").trim();
      const sup = String(row["Supplier"] || "").trim();
      
      if (inv) {
        currentInvKey = `${inv}___${sup}`;
        // Store original inv in the row if we want to use it later, but we can also just rely on the first row
        row["_ParsedInvoice"] = inv;
      }
      
      if (!currentInvKey) continue;
      
      // Jika baris ini memiliki invoice kosong, salin Supplier dan Tanggal dari currentInvKey agar tidak hilang
      if (!inv) {
        if (!row["Supplier"]) {
           const parentRows = invoiceMap.get(currentInvKey);
           if (parentRows && parentRows.length > 0) row["Supplier"] = parentRows[0]["Supplier"];
        }
        if (!row["Tanggal"]) {
           const parentRows = invoiceMap.get(currentInvKey);
           if (parentRows && parentRows.length > 0) row["Tanggal"] = parentRows[0]["Tanggal"];
        }
      }
      
      if (!invoiceMap.has(currentInvKey)) invoiceMap.set(currentInvKey, []);
      invoiceMap.get(currentInvKey)!.push(row);
    }

    // Helper tanggal serbaguna: dukung Serial Excel Date (misal 46284), String (DD/MM/YYYY & YYYY-MM-DD), serta Invoice number fallback
    function parseExcelDate(val: any, inv: string): Date | undefined {
      if (!val && !inv) return undefined;
      if (val instanceof Date) return val;
      if (typeof val === "number" || (!isNaN(Number(val)) && !String(val).includes("/") && !String(val).includes("-"))) {
        const num = Number(val);
        if (num > 30000 && num < 60000) {
          const utcDays = num - 25569;
          const utcValue = utcDays * 86400;
          const dateInfo = new Date(utcValue * 1000);
          return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate());
        }
      }
      const str = String(val || "").trim();
      if (str) {
        const parts = str.includes("/") ? str.split("/") : str.split("-");
        if (parts.length === 3) {
          if (str.includes("/")) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            return new Date(y, m, d);
          } else {
            return new Date(str);
          }
        }
      }
      // Fallback: ekstrak dari nomor faktur format INV-IN/YYYYMMDD/...
      const match = String(inv || "").match(/(\d{4})(\d{2})(\d{2})/);
      if (match) {
        const y = parseInt(match[1], 10);
        const m = parseInt(match[2], 10) - 1;
        const d = parseInt(match[3], 10);
        return new Date(y, m, d);
      }
      return undefined;
    }

    const getVal = (row: any, ...keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
          return row[k];
        }
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const found = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
        if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== "") {
          return row[found];
        }
      }
      return "";
    };

    const results: { invoice: string; status: "ok" | "skip" | "error"; message: string }[] = [];
    let successCount = 0;

    for (const [invKey, rows] of invoiceMap) {
      const firstRow = rows[0];
      const invoiceNumber = firstRow["_ParsedInvoice"] || String(getVal(firstRow, "No Invoice", "No. Invoice", "Nomor Invoice", "Invoice", "No Nota", "No Faktur") || "").trim();
      try {
        // ── Parse common data from Excel rows ──
        const supplierName = String(getVal(firstRow, "Supplier", "Nama Supplier", "Vendor") || "").trim();
        const tanggalVal = getVal(firstRow, "Tanggal", "Date", "Tgl") || firstRow["Tanggal"];
        const createdAt = parseExcelDate(tanggalVal, invoiceNumber);

        let paymentType = String(getVal(firstRow, "Metode Bayar", "Metode Pembayaran", "Payment Method", "Cara Bayar") || "").trim().toLowerCase();
        let statusHint = String(getVal(firstRow, "Status", "Status Bayar") || "").trim().toLowerCase();
        let notes = String(getVal(firstRow, "Catatan", "Notes", "Keterangan") || "").trim();

        // Deteksi jika kolom bergeser (misal row di-copy dari sheet dengan kolom Roll lebih sedikit)
        const rowKeys = Object.keys(firstRow);
        const methodKey = rowKeys.find(k => ["kredit", "tunai", "tempo"].includes(String(firstRow[k]).toLowerCase().trim()));
        if ((!paymentType || !["tunai", "kredit", "tempo"].includes(paymentType)) && methodKey) {
          paymentType = String(firstRow[methodKey]).trim().toLowerCase();
          const mIdx = rowKeys.indexOf(methodKey);
          if (mIdx + 1 < rowKeys.length) statusHint = String(firstRow[rowKeys[mIdx + 1]] || "").trim().toLowerCase();
          if (mIdx + 2 < rowKeys.length) notes = String(firstRow[rowKeys[mIdx + 2]] || "").trim();
        }
        if (!paymentType) paymentType = "kredit";

        if (!supplierName) {
          results.push({ invoice: invoiceNumber, status: "error", message: "Kolom Supplier kosong" }); continue;
        }

        let supplier = findSupplier(supplierName);
        if (!supplier) {
          // Otomatis buat supplier baru jika belum ada di database
          const [newSupp] = await db.insert(suppliersTable).values({
            name: supplierName
          }).returning();
          supplier = newSupp;
          allSuppliers.push(newSupp);
        }

        const existingList = await db.select({ id: purchasesTable.id }).from(purchasesTable)
          .where(and(
             eq(purchasesTable.invoiceNumber, invoiceNumber),
             eq(purchasesTable.supplierId, supplier.id)
          ));

        // Parse items
        const items: { productId: number; rolls: number; meters: number; pricePerMeter: number; subtotal: number; rollLengths: number[] }[] = [];
        const itemErrors: string[] = [];
        for (const row of rows) {
          const prodName = String(getVal(row, "Produk / Barang", "Nama Barang", "Produk", "Nama Produk", "Barang", "Item", "Nama") || "").trim();
          if (!prodName) continue;

          // Deteksi kategori terlebih dahulu agar bisa dipakai untuk pencarian produk & fallback harga
          const catName = String(getVal(row, "Kategori", "Category", "Jenis") || "").trim();
          let cat = catName ? findCategory(catName) : null;

          const rawBarcode = String(getVal(row, "Barcode", "Kode Barang", "Kode", "SKU") || "").trim();
          let prod = findProduct(prodName, rawBarcode, cat?.id);

          // Deteksi satuan METER vs YARD
          const rawUnit = String(getVal(row, "Satuan", "Unit", "Satuan Barang", "Unit 1") || "").trim().toLowerCase();
          let detectedUnit = "METER";
          if (rawUnit.includes("yard") || rawUnit.includes("yd") || rawUnit.includes("yds") || rawUnit.startsWith("yar")) {
            detectedUnit = "YARD";
          } else if (rawUnit.includes("meter") || rawUnit.includes("mtr") || rawUnit === "m") {
            detectedUnit = "METER";
          } else if (row["Yard"] !== undefined || row["Stok (Yard)"] !== undefined || row["Harga / Yard"] !== undefined) {
            detectedUnit = "YARD";
          } else if (prod?.primaryUnit) {
            detectedUnit = prod.primaryUnit;
          } else if (cat?.primaryUnit) {
            detectedUnit = cat.primaryUnit;
          }

          if (!cat && catName) {
            const [newCat] = await db.insert(categoriesTable).values({ 
              name: catName,
              primaryUnit: detectedUnit || "METER",
              secondaryUnit: "ROLL",
            }).returning();
            allCategories.push(newCat);
            cat = newCat;
          }

          let rollsCount = parseFloat(String(getVal(row, "Roll", "Jumlah Roll", "Stok (Roll)", "Stok Roll", "Qty Roll") || "0").replace(",", ".")) || 0;

          // Parse roll lengths: cek Roll 1, Roll 2, dst.
          const rollLengths: number[] = [];
          for (const key of Object.keys(row)) {
            const kLower = key.toLowerCase().trim();
            if (kLower.startsWith("roll ") || kLower.startsWith("roll #") || kLower.startsWith("roll-")) {
              const numStr = kLower.replace(/^roll\s*[#\-]?\s*/i, "").trim();
              const rollIndex = parseInt(numStr, 10);
              if (!isNaN(rollIndex) && rollIndex > 0) {
                const val = parseFloat(String(row[key]).replace(",", "."));
                if (!isNaN(val) && val > 0) rollLengths[rollIndex - 1] = val;
              }
            }
          }
          const cleanRollLengths = rollLengths.filter(r => r !== undefined);

          if (rollsCount === 0 && cleanRollLengths.length > 0) {
            rollsCount = cleanRollLengths.length;
          }

          let meters = parseFloat(String(getVal(row, "Meter/Yard", "Qty (YARD)", "Qty (METER)", "Qty (Yard)", "Qty (Meter)", "Yard", "Meter", "Qty", "Jumlah", "Panjang", "Total Panjang", "Stok Meter", "Stok Yard") || "0").replace(",", ".")) || 0;

          // 1. JIKA KOLOM METER/YARD KOSONG: Hitung otomatis dari akumulasi panjang roll (Roll 1 + Roll 2 + ...)
          if (meters === 0 && cleanRollLengths.length > 0) {
            meters = parseFloat(cleanRollLengths.reduce((a, b) => a + b, 0).toFixed(3));
          }

          let pricePerMeter = parseFloat(String(getVal(row, "Harga / Satuan", "Harga / Meter", "Harga / Yard", "Harga Satuan", "Harga Beli", "Harga / Qty", "Harga") || "0").replace(",", ".")) || 0;

          // 2. JIKA KOLOM HARGA / SATUAN KOSONG: Ambil otomatis dari master barang atau master kategori
          if (!pricePerMeter || pricePerMeter === 0) {
            if (prod?.costPricePerMeter && parseFloat(String(prod.costPricePerMeter)) > 0) {
              pricePerMeter = parseFloat(String(prod.costPricePerMeter));
            } else if (cat?.costPricePerMeter && parseFloat(String(cat.costPricePerMeter)) > 0) {
              pricePerMeter = parseFloat(String(cat.costPricePerMeter));
            } else if (cat?.pricePerMeter && parseFloat(String(cat.pricePerMeter)) > 0) {
              pricePerMeter = parseFloat(String(cat.pricePerMeter));
            }
          }

          // 3. JIKA SUBTOTAL KOSONG: Hitung otomatis (Meter/Yard x Harga/Satuan)
          const rawSubtotal = parseFloat(String(getVal(row, "Subtotal", "Total", "Jumlah Harga") || "0").replace(",", ".")) || 0;
          const subtotal = rawSubtotal > 0 ? rawSubtotal : Math.round(meters * pricePerMeter);

          if (!prod) {
            // Otomatis daftarkan produk baru ke master barang jika belum pernah ada
            let categoryId = cat?.id;
            if (!categoryId) {
              if (allCategories.length > 0) {
                cat = allCategories[0];
                categoryId = cat.id;
              } else {
                const [newCat] = await db.insert(categoriesTable).values({ 
                  name: "Kain",
                  primaryUnit: detectedUnit || "METER",
                  secondaryUnit: "ROLL",
                  costPricePerMeter: pricePerMeter > 0 ? pricePerMeter.toString() : "0",
                  pricePerMeter: pricePerMeter > 0 ? pricePerMeter.toString() : "0",
                }).returning();
                allCategories.push(newCat);
                cat = newCat;
                categoryId = newCat.id;
              }
            }

            const barcode = rawBarcode || `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const costPriceStr = pricePerMeter > 0 ? pricePerMeter.toString() : (cat?.costPricePerMeter || "0");

            const [newProd] = await db.insert(productsTable).values({
              name: prodName,
              categoryId: categoryId!,
              barcode,
              primaryUnit: detectedUnit,
              secondaryUnit: (cat?.secondaryUnit) || "ROLL",
              costPricePerMeter: costPriceStr,
              pricePerMeter: costPriceStr,
              rollStock: "0",
              meterStock: "0",
              minStock: "0",
            }).returning();

            prod = {
              id: newProd.id,
              name: newProd.name,
              barcode: newProd.barcode,
              primaryUnit: newProd.primaryUnit,
              categoryId: newProd.categoryId,
              costPricePerMeter: newProd.costPricePerMeter,
              pricePerMeter: newProd.pricePerMeter,
            };
            allProducts.push(prod);
          } else if (pricePerMeter > 0 && parseFloat(String(prod.costPricePerMeter || "0")) === 0) {
            // Update harga beli di database produk jika sebelumnya masih 0
            await db.update(productsTable)
              .set({
                costPricePerMeter: pricePerMeter.toString(),
                primaryUnit: detectedUnit !== "METER" ? detectedUnit : prod.primaryUnit,
                updatedAt: new Date()
              })
              .where(eq(productsTable.id, prod.id));
            prod.costPricePerMeter = pricePerMeter.toString();
          }

          items.push({
            productId: prod.id,
            rolls: rollsCount,
            meters,
            pricePerMeter,
            subtotal,
            rollLengths: cleanRollLengths
          });
        }
        if (itemErrors.length > 0) { results.push({ invoice: invoiceNumber, status: "error", message: itemErrors.join("; ") }); continue; }
        if (items.length === 0) { results.push({ invoice: invoiceNumber, status: "skip", message: "Tidak ada item barang valid" }); continue; }

        const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
        const rawPaid = getVal(firstRow, "Sudah Dibayar", "Dibayar", "Bayar", "Paid", "Paid Amount");
        const isKredit = paymentType === "kredit" || paymentType === "tempo";
        
        let paidAmount = 0;
        if (rawPaid !== "" && !isNaN(parseFloat(rawPaid.replace(',', '.')))) {
          paidAmount = parseFloat(rawPaid.replace(',', '.')) || 0;
        } else {
          paidAmount = isKredit ? 0 : totalAmount;
        }

        const status = statusHint === "lunas" || paidAmount >= totalAmount ? "lunas" : paidAmount > 0 ? "partial" : "tempo";

        let purchaseId: number;

        if (existingList.length > 0) {
          const [existingP] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, existingList[0].id));
          if (existingP && parseFloat(existingP.totalAmount as string) === 0 && totalAmount > 0) {
            // Perbaiki data faktur lama yang sempat tersimpan dengan total 0
            await db.update(purchasesTable).set({
              totalAmount: totalAmount.toString(),
              paidAmount: paidAmount.toString(),
              status,
              paymentType,
              notes: notes || null,
              ...(createdAt && !isNaN(createdAt.getTime()) ? { createdAt } : {}),
              updatedAt: new Date()
            }).where(eq(purchasesTable.id, existingP.id));

            if (status !== "lunas") {
              const existingPayable = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, existingP.id));
              if (existingPayable.length === 0) {
                await db.insert(payablesTable).values({
                  purchaseId: existingP.id, supplierId: supplier.id,
                  totalAmount: totalAmount.toString(), paidAmount: paidAmount.toString(),
                  status: status === "partial" ? "partial" : "unpaid",
                });
              } else {
                await db.update(payablesTable).set({
                  totalAmount: totalAmount.toString(), paidAmount: paidAmount.toString(),
                  status: status === "partial" ? "partial" : "unpaid",
                }).where(eq(payablesTable.purchaseId, existingP.id));
              }
            }

            results.push({ invoice: invoiceNumber, status: "ok", message: "Faktur diperbarui dengan total & tanggal yang valid" });
            successCount++;
            continue;
          }

          // SKIP invoice yang sudah ada dan valid agar riwayat stok tidak rusak
          results.push({ invoice: invoiceNumber, status: "skip", message: "Invoice sudah ada, dilewati agar riwayat stok tidak rusak" });
          continue;
        } else {
          // ── INSERT: new invoice ──
          const [newPurchase] = await db.insert(purchasesTable).values({
            invoiceNumber, supplierId: supplier.id, paymentType,
            totalAmount: totalAmount.toString(), paidAmount: paidAmount.toString(),
            status, notes: notes || null,
            ...(createdAt && !isNaN(createdAt.getTime()) ? { createdAt } : {}),
          } as any).returning();
          purchaseId = newPurchase.id;
        }

        // ── Insert items + rolls (same for both insert and upsert) ──
        for (const item of items) {
          const avgLength = item.rolls > 0 ? item.meters / item.rolls : 0;
          const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
          const baseBarcode = prod?.barcode || `PRD-${item.productId}`;
          let insertedRollId: number | null = null;
          
          const rollLengthsToUse = item.rollLengths || [];
          const ts = Date.now();

          for (let i = 0; i < item.rolls; i++) {
            const barcodeToSave = `${baseBarcode}-R${ts}-${i}-${Math.floor(Math.random() * 9999)}`;
            const lengthToUse = rollLengthsToUse[i] !== undefined ? rollLengthsToUse[i] : avgLength;
            const [roll] = await db.insert(productRollsTable).values({
              productId: item.productId, barcode: barcodeToSave,
              originalLength: lengthToUse.toString(), currentLength: lengthToUse.toString(), status: "available",
            }).returning();
            if (i === 0) insertedRollId = roll.id;
          }

          await db.insert(purchaseItemsTable).values({
            purchaseId: purchaseId, productId: item.productId,
            rollId: insertedRollId, rolls: item.rolls.toString(),
            meters: item.meters.toString(), pricePerMeter: item.pricePerMeter.toString(),
            subtotal: item.subtotal.toString(),
            rollLengthsJson: item.rollLengths && item.rollLengths.length > 0 ? JSON.stringify(item.rollLengths) : null,
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
            purchaseId: purchaseId, supplierId: supplier.id,
            totalAmount: totalAmount.toString(), paidAmount: paidAmount.toString(),
            status: status === "partial" ? "partial" : "unpaid",
          });
        }

        successCount++;
        results.push({ invoice: invoiceNumber, status: "ok", message: `${items.length} item berhasil diproses` });
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

  // ── Cek duplikat nomor nota ──
  if (parsed.data.invoiceNumber) {
    const [dup] = await db.select({ id: purchasesTable.id })
      .from(purchasesTable)
      .where(eq(purchasesTable.invoiceNumber, invoiceNumber));
    if (dup) {
      res.status(409).json({ error: `Nomor nota "${invoiceNumber}" sudah ada. Gunakan nomor nota yang berbeda.` });
      return;
    }
  }

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
        // Auto-generate barcode unik untuk setiap roll (hindari constraint violation)
        const barcodeToSave = `${baseBarcode}-R${Date.now()}-${i}-${Math.floor(Math.random() * 9999)}`;
        
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
      categoryName: categoriesTable.name,
      rollId: purchaseItemsTable.rollId,
      rolls: purchaseItemsTable.rolls,
      meters: purchaseItemsTable.meters,
      pricePerMeter: purchaseItemsTable.pricePerMeter,
      subtotal: purchaseItemsTable.subtotal,
      rollLengthsJson: purchaseItemsTable.rollLengthsJson,
    })
    .from(purchaseItemsTable)
    .leftJoin(productsTable, eq(purchaseItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(purchaseItemsTable.purchaseId, id));

  const itemsWithRolls = await Promise.all(items.map(async (i) => {
    const rollCount = Number(i.rolls) || 0;
    let rollLengths: number[] = [];
    
    // Prioritaskan dari snapshot JSON (karena ini tetap ada meski roll dihapus/cancelled)
    if (i.rollLengthsJson) {
      try {
        rollLengths = JSON.parse(i.rollLengthsJson);
      } catch (e) {}
    } 
    // Fallback query ke productRollsTable untuk data lama yang belum punya JSON
    else if (rollCount > 0 && i.rollId) {
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
