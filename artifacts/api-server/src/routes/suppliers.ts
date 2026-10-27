import { Router } from "express";
import { db } from "@workspace/db";
import { suppliersTable, payablesTable, paymentsTable, purchasesTable, purchaseItemsTable, productRollsTable, productsTable, stockMutationsTable } from "@workspace/db";
import { eq, ilike, sql, and, inArray } from "drizzle-orm";
import { CreateSupplierBody, UpdateSupplierBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import * as XLSX from "xlsx";

const router = Router();

async function getSupplierDebt(supplierId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<string>`coalesce(sum(${payablesTable.totalAmount} - ${payablesTable.paidAmount}), 0)` })
    .from(payablesTable)
    .where(eq(payablesTable.supplierId, supplierId));
  return parseFloat(result?.total ?? "0");
}

router.get("/suppliers", async (req, res) => {
  const { search } = req.query;
  const suppliers = await db
    .select()
    .from(suppliersTable)
    .where(search ? ilike(suppliersTable.name, `%${search}%`) : undefined)
    .orderBy(suppliersTable.name);

  const result = await Promise.all(suppliers.map(async s => ({
    ...s,
    currentDebt: await getSupplierDebt(s.id),
  })));
  res.json(result);
});

// ─── GET /suppliers/export ──────────────────────────────────────────────────
router.get("/suppliers/export", async (req, res): Promise<void> => {
  try {
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .orderBy(suppliersTable.name);

    const rows: any[] = [];
    let rowNo = 1;

    for (const s of suppliers) {
      const debt = await getSupplierDebt(s.id);
      rows.push({
        "No": rowNo++,
        "Nama Supplier": s.name,
        "Kontak Person": s.contactPerson || "",
        "No. Telepon": s.phone || "",
        "Alamat": s.address || "",
        "Total Hutang": debt,
        "Status": debt > 0 ? "Ada Hutang" : "Lunas",
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 20 },
      { wch: 18 },
      { wch: 35 },
      { wch: 18 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier");
    const filename = `Data_Supplier_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err: any) {
    console.error("Export suppliers error:", err);
    res.status(500).json({ error: err.message || "Export supplier gagal" });
  }
});

// ─── POST /suppliers/preview-import ─────────────────────────────────────────
router.post("/suppliers/preview-import", async (req, res): Promise<void> => {
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
      if (name.toLowerCase().includes("supplier") || name.toLowerCase().includes("pemasok")) {
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
      res.json({
        summary: { totalRows: 0, newSuppliers: 0, existingSuppliers: 0 },
        rows: []
      });
      return;
    }

    const allSuppliers = await db.select().from(suppliersTable);

    const previewRows: any[] = [];
    let newSuppliersCount = 0;
    let existingSuppliersCount = 0;

    let rowIndex = 0;
    for (const row of rawRows) {
      rowIndex++;
      const name = getVal(row, "Nama Supplier", "Nama", "Supplier", "Vendor", "Nama Vendor");
      if (!name) continue;

      const contactPerson = getVal(row, "Kontak Person", "Kontak", "CP", "Contact Person", "PIC") || null;
      const phone = getVal(row, "No. Telepon", "Telepon", "No Telepon", "No HP", "Phone", "Telp", "HP") || null;
      const address = getVal(row, "Alamat", "Address") || null;

      const existing = allSuppliers.find(s => s.name.toLowerCase() === name.toLowerCase());

      if (existing) existingSuppliersCount++;
      else newSuppliersCount++;

      const warnings: string[] = [];
      if (existing) warnings.push(`Supplier sudah ada ("${existing.name}") — data kontak akan diperbarui`);
      else warnings.push("Supplier baru");

      previewRows.push({
        rowNumber: rowIndex,
        name,
        contactPerson,
        phone,
        address,
        isExisting: !!existing,
        status: warnings.length > 0 ? "warning" : "ready",
        keterangan: warnings
      });
    }

    res.json({
      summary: {
        totalRows: previewRows.length,
        newSuppliers: newSuppliersCount,
        existingSuppliers: existingSuppliersCount,
      },
      rows: previewRows
    });
  } catch (err: any) {
    console.error("Preview suppliers import error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses preview file Excel supplier" });
  }
});

// ─── POST /suppliers/import ─────────────────────────────────────────────────
router.post("/suppliers/import", async (req, res): Promise<void> => {
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
      if (name.toLowerCase().includes("supplier") || name.toLowerCase().includes("pemasok")) {
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

    const existingSuppliers = await db.select().from(suppliersTable);
    const supplierMap = new Map<string, typeof existingSuppliers[0]>();
    for (const s of existingSuppliers) {
      supplierMap.set(s.name.trim().toLowerCase(), s);
    }

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowIdx = i + 2;

      const name = getVal(row, "Nama Supplier", "Nama", "Supplier", "Name", "Pemasok");
      if (!name) {
        skippedCount++;
        continue;
      }

      const contactPerson = getVal(row, "Kontak Person", "Kontak", "Contact Person", "PIC", "Contact");
      const phone = getVal(row, "No. Telepon", "No Telepon", "Telepon", "Phone", "No HP", "No. HP", "WhatsApp", "WA", "Telp");
      const address = getVal(row, "Alamat", "Address", "Lokasi");

      try {
        const key = name.toLowerCase();
        const existing = supplierMap.get(key);

        if (existing) {
          await db
            .update(suppliersTable)
            .set({
              contactPerson: contactPerson || existing.contactPerson,
              phone: phone || existing.phone,
              address: address || existing.address,
              updatedAt: new Date(),
            })
            .where(eq(suppliersTable.id, existing.id));
          updatedCount++;
        } else {
          const [newSupp] = await db
            .insert(suppliersTable)
            .values({
              name,
              contactPerson: contactPerson || null,
              phone: phone || null,
              address: address || null,
            })
            .returning();
          supplierMap.set(key, newSupp);
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
    console.error("Import suppliers error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses file import" });
  }
});

router.post("/suppliers", async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [supp] = await db.insert(suppliersTable).values(parsed.data).returning();
  res.status(201).json({ ...supp, currentDebt: 0 });
});

router.get("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [supp] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, id));
  if (!supp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...supp, currentDebt: await getSupplierDebt(id) });
});

router.patch("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [supp] = await db.update(suppliersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(suppliersTable.id, id)).returning();
  if (!supp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...supp, currentDebt: await getSupplierDebt(id) });
});

router.delete("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    // 1. Get all purchases for this supplier
    const purchases = await db.select().from(purchasesTable).where(eq(purchasesTable.supplierId, id));

    for (const purchase of purchases) {
      // 2. Get purchase items
      const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, purchase.id));

      // 3. Sync stock back (remove rolls created by these purchases)
      for (const item of items) {
        const rollCount = Number(item.rolls) || 0;
        if (rollCount > 0 && item.rollId) {
          const rollIds = Array.from({ length: rollCount }, (_, i) => (item.rollId as number) + i);
          const rollsToDelete = await db.select().from(productRollsTable).where(
            and(eq(productRollsTable.productId, item.productId), inArray(productRollsTable.id, rollIds))
          );
          if (rollsToDelete.length > 0) {
            await db.delete(productRollsTable).where(inArray(productRollsTable.id, rollsToDelete.map(r => r.id)));
          }
        }
      }

      // 4. Delete purchase items
      await db.delete(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, purchase.id));

      // 5. Delete payments linked to payables
      const relatedPayables = await db.select().from(payablesTable).where(eq(payablesTable.purchaseId, purchase.id));
      for (const payable of relatedPayables) {
        await db.delete(paymentsTable).where(eq(paymentsTable.payableId, payable.id));
      }
      await db.delete(payablesTable).where(eq(payablesTable.purchaseId, purchase.id));

      // 6. Delete the purchase
      await db.delete(purchasesTable).where(eq(purchasesTable.id, purchase.id));
    }

    // 7. Delete the supplier
    await db.delete(suppliersTable).where(eq(suppliersTable.id, id));

    broadcastRefresh();
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: error.message || "Gagal menghapus supplier." });
  }
});

export default router;
