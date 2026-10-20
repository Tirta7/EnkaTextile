import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, receivablesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { CreateCustomerBody, UpdateCustomerBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";
import * as XLSX from "xlsx";

const router = Router();

async function getCustomerDebt(customerId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<string>`coalesce(sum(${receivablesTable.totalAmount} - ${receivablesTable.paidAmount}), 0)` })
    .from(receivablesTable)
    .where(eq(receivablesTable.customerId, customerId));
  return parseFloat(result?.total ?? "0");
}

router.get("/customers", async (req, res): Promise<void> => {
  const { search, overLimit } = req.query;
  const customers = await db
    .select()
    .from(customersTable)
    .where(search ? ilike(customersTable.name, `%${search}%`) : undefined)
    .orderBy(customersTable.name);

  const result = await Promise.all(customers.map(async c => {
    const currentDebt = await getCustomerDebt(c.id);
    const creditLimit = parseFloat(c.creditLimit ?? "0");
    return {
      ...c,
      creditLimit,
      currentDebt,
      isOverLimit: currentDebt > creditLimit,
    };
  }));

  if (overLimit === "true") { res.json(result.filter(c => c.isOverLimit)); return; }
  res.json(result);
});

// ─── GET /customers/export ──────────────────────────────────────────────────
router.get("/customers/export", async (req, res): Promise<void> => {
  try {
    const customers = await db
      .select()
      .from(customersTable)
      .orderBy(customersTable.name);

    const rows: any[] = [];
    let rowNo = 1;

    for (const c of customers) {
      const debt = await getCustomerDebt(c.id);
      const limit = parseFloat(c.creditLimit ?? "0");
      rows.push({
        "No": rowNo++,
        "Nama Pelanggan": c.name,
        "No. Telepon": c.phone || "",
        "Alamat": c.address || "",
        "Limit Kredit": limit,
        "Total Hutang": debt,
        "Status": debt > limit ? "Over Limit" : "Normal",
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 18 },
      { wch: 35 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pelanggan");
    const filename = `Data_Pelanggan_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err: any) {
    console.error("Export customers error:", err);
    res.status(500).json({ error: err.message || "Export pelanggan gagal" });
  }
});

// ─── POST /customers/import ─────────────────────────────────────────────────
router.post("/customers/import", async (req, res): Promise<void> => {
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
      if (name.toLowerCase().includes("pelanggan") || name.toLowerCase().includes("customer")) {
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

    const existingCustomers = await db.select().from(customersTable);
    const customerMap = new Map<string, typeof existingCustomers[0]>();
    for (const c of existingCustomers) {
      customerMap.set(c.name.trim().toLowerCase(), c);
    }

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowIdx = i + 2;

      const name = getVal(row, "Nama Pelanggan", "Nama", "Pelanggan", "Customer", "Name");
      if (!name) {
        skippedCount++;
        continue;
      }

      const phone = getVal(row, "No. Telepon", "No Telepon", "Telepon", "Phone", "No HP", "No. HP", "WhatsApp", "WA", "Telp");
      const address = getVal(row, "Alamat", "Address", "Lokasi");
      const creditLimitRaw = getVal(row, "Limit Kredit", "Plafon Kredit", "Credit Limit", "Plafon", "Limit");
      let creditLimit: string | undefined = undefined;
      if (creditLimitRaw) {
        const parsedLimit = parseFloat(creditLimitRaw.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsedLimit)) {
          creditLimit = String(parsedLimit);
        }
      }

      try {
        const key = name.toLowerCase();
        const existing = customerMap.get(key);

        if (existing) {
          await db
            .update(customersTable)
            .set({
              phone: phone || existing.phone,
              address: address || existing.address,
              ...(creditLimit !== undefined ? { creditLimit } : {}),
              updatedAt: new Date(),
            })
            .where(eq(customersTable.id, existing.id));
          updatedCount++;
        } else {
          const [newCust] = await db
            .insert(customersTable)
            .values({
              name,
              phone: phone || null,
              address: address || null,
              creditLimit: creditLimit || "0",
            })
            .returning();
          customerMap.set(key, newCust);
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
    console.error("Import customers error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses file import" });
  }
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const [cust] = await db.insert(customersTable).values({
    ...d,
    creditLimit: d.creditLimit != null ? String(d.creditLimit) : undefined
  }).returning();
  res.status(201).json({ ...cust, creditLimit: parseFloat(cust.creditLimit ?? "0"), currentDebt: 0, isOverLimit: false });
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({ ...cust, creditLimit, currentDebt, isOverLimit: currentDebt > creditLimit });
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: any = { ...d, updatedAt: new Date() };
  if (d.creditLimit != null) updateData.creditLimit = String(d.creditLimit);
  const [cust] = await db.update(customersTable).set(updateData).where(eq(customersTable.id, id)).returning();
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({ ...cust, creditLimit, currentDebt, isOverLimit: currentDebt > creditLimit });
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: "Gagal menghapus pelanggan. Pastikan pelanggan tidak memiliki transaksi terkait." });
  }
});

router.get("/customers/:id/credit-status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!cust) { res.status(404).json({ error: "Not found" }); return; }
  const currentDebt = await getCustomerDebt(id);
  const creditLimit = parseFloat(cust.creditLimit ?? "0");
  res.json({
    customerId: id,
    creditLimit,
    currentDebt,
    available: Math.max(0, creditLimit - currentDebt),
    isOverLimit: currentDebt > creditLimit,
  });
});

export default router;
