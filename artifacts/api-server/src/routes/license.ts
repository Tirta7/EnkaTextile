import { Router, Request, Response } from "express";
import { db, licenseCacheTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import machineIdPkg from "node-machine-id";
import path from "path";
import fs from "fs";
import { checkLicense, verifyLicenseKey } from "../lib/vocml-client.js";

const { machineId } = machineIdPkg;

const router = Router();

let cachedMachineId: string | null = null;

export const getMachineId = async (): Promise<string> => {
  if (cachedMachineId) return cachedMachineId;

  // 1. Cek Environment Variable (jika diset oleh docker.env / .env)
  const envMid = (process.env.MACHINE_ID || process.env.VOCML_MACHINE_ID || "").trim();
  if (envMid) {
    cachedMachineId = envMid.toUpperCase();
    try {
      const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, "system_machine_id")).limit(1);
      if (existing.length === 0) {
        await db.insert(settingsTable).values({
          key: "system_machine_id",
          value: cachedMachineId,
          description: "Permanent Hardware Machine ID for VOCML License",
        });
      }
    } catch (_) {}
    return cachedMachineId;
  }

  // 2. Cek apakah sudah tersimpan di Database (Settings Table)
  // Catatan: Volume PostgreSQL vocpos_db_data bersifat permanen dan TIDAK PERNAH terhapus saat update Docker/aplikasi!
  try {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, "system_machine_id")).limit(1);
    if (existing.length > 0 && existing[0].value?.trim()) {
      cachedMachineId = existing[0].value.trim().toUpperCase();
      return cachedMachineId;
    }
  } catch (_) {}

  // 3. Cek file persistensi di disk (.machine-id)
  const idFilePath = path.resolve(process.cwd(), ".machine-id");
  try {
    if (fs.existsSync(idFilePath)) {
      const fileContent = fs.readFileSync(idFilePath, "utf8").trim();
      if (fileContent) {
        cachedMachineId = fileContent.toUpperCase();
        try {
          await db.insert(settingsTable).values({
            key: "system_machine_id",
            value: cachedMachineId,
            description: "Permanent Hardware Machine ID for VOCML License",
          });
        } catch (_) {}
        return cachedMachineId;
      }
    }
  } catch (_) {}

  // 4. Cek apakah ada machine_id dari token aktif sebelumnya di license-cache.json
  const cacheFile = path.resolve(process.cwd(), "license-cache.json");
  try {
    if (fs.existsSync(cacheFile)) {
      const raw = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      if (raw?.token) {
        const parts = raw.token.split(".");
        if (parts[0]) {
          const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
          if (payload?.machine_id) {
            cachedMachineId = String(payload.machine_id).trim().toUpperCase();
            try {
              await db.insert(settingsTable).values({
                key: "system_machine_id",
                value: cachedMachineId,
                description: "Permanent Hardware Machine ID for VOCML License",
              });
            } catch (_) {}
            try {
              fs.writeFileSync(idFilePath, cachedMachineId, "utf8");
            } catch (_) {}
            return cachedMachineId;
          }
        }
      }
    }
  } catch (_) {}

  // 5. Jika benar-benar baru pertama kali dipasang, generate dari hardware
  let generated = "";
  try {
    const id = await machineId();
    const short = id.substring(0, 12).toUpperCase();
    generated = `VOC-${short.substring(0, 4)}-${short.substring(4, 8)}-${short.substring(8, 12)}`;
  } catch (err) {
    const randomHex = Math.random().toString(36).substring(2, 14).toUpperCase();
    generated = `VOC-${randomHex.substring(0, 4)}-${randomHex.substring(4, 8)}-${randomHex.substring(8, 12)}`;
  }

  cachedMachineId = generated;

  // Kunci dan simpan Machine ID ini secara PERMANEN di Database dan File Disk
  try {
    await db.insert(settingsTable).values({
      key: "system_machine_id",
      value: cachedMachineId,
      description: "Permanent Hardware Machine ID for VOCML License",
    });
  } catch (_) {}

  try {
    fs.writeFileSync(idFilePath, cachedMachineId, "utf8");
  } catch (_) {}

  return cachedMachineId;
};

router.get("/machine-id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = await getMachineId();
    res.json({ machineId: id });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate machine ID" });
  }
});

router.post("/activate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { licenseKey } = req.body;
    
    if (!licenseKey) {
      res.status(400).json({ error: "License key is required" });
      return;
    }
    
    const publicKeyPem = process.env.VOCML_PUBLIC_KEY || "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEADenKScMcRxd/GFPnwHLg026Y3mKWNmtyUR1KPQgLTFI=\n-----END PUBLIC KEY-----\n";
    if (!publicKeyPem) {
      res.status(500).json({ error: "Kunci Publik VOCML belum diatur di sistem (VOCML_PUBLIC_KEY)." });
      return;
    }

    const mId = await getMachineId();
    const product = process.env.VOCML_PRODUCT || "pos";

    // Verifikasi key secara offline menggunakan SDK
    const verifyResult = verifyLicenseKey(licenseKey, mId, product, publicKeyPem);

    if (!verifyResult.valid) {
      res.status(400).json({ error: verifyResult.reason || "Gagal mengaktifkan lisensi. Key tidak valid." });
      return;
    }

    if (verifyResult.expired) {
      res.status(400).json({ error: "Lisensi sudah kadaluarsa." });
      return;
    }

    // Jika valid, simpan ke database sebagai cache tambahan
    const existing = await db.select().from(licenseCacheTable).limit(1);
    
    // Hitung daysLeft
    const expDate = verifyResult.expiresAt ? new Date(verifyResult.expiresAt) : null;
    const today = new Date();
    const daysLeft = expDate ? Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 0;

    if (existing.length > 0) {
      await db.update(licenseCacheTable).set({
        licenseKey: licenseKey,
        isValid: true,
        expiresAt: expDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        cachedAt: new Date(),
        storeName: existing[0].storeName || "",
      }).where(eq(licenseCacheTable.id, existing[0].id));
    } else {
      await db.insert(licenseCacheTable).values({
        licenseKey: licenseKey,
        isValid: true,
        expiresAt: expDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        storeName: "",
      });
    }

    res.json({
      valid: true,
      expiresAt: verifyResult.expiresAt,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
    });
  } catch (error) {
    console.error("Failed to activate license", error);
    res.status(500).json({ error: "Terjadi kesalahan sistem saat menghubungi server lisensi." });
  }
});

router.get("/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const mId = await getMachineId();
    const serverUrl = process.env.VOCML_SERVER_URL || "https://vocml.vocpos.id";
    const publicKeyPem = process.env.VOCML_PUBLIC_KEY || "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEADenKScMcRxd/GFPnwHLg026Y3mKWNmtyUR1KPQgLTFI=\n-----END PUBLIC KEY-----\n";
    const product = process.env.VOCML_PRODUCT || "pos";
    const cacheFile = path.resolve(process.cwd(), "license-cache.json");

    if (!publicKeyPem) {
      res.status(500).json({ error: "Kunci Publik VOCML belum diatur di sistem." });
      return;
    }

    // Gunakan SDK untuk cek lisensi (online/offline cache otomatis)
    const lic = await checkLicense({
      serverUrl,
      product,
      machineId: mId,
      publicKeyPem,
      cacheFile,
      timeoutMs: 5000
    });

    const isLocked = lic.status === "locked";
    
    let daysLeft = 0;
    let expDate = null;
    
    if (lic.expiresAt) {
      expDate = new Date(lic.expiresAt);
      const today = new Date();
      daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    }

    // Map "pending" dari VOCML ke "not_activated" agar UI frontend mengenalinya dan mengunci layar
    let finalStatus: string = lic.status;
    if (finalStatus === "pending") finalStatus = "not_activated";
    if (finalStatus === "offline" && !lic.allowed) finalStatus = "not_activated";

    const result = {
      status: lic.allowed ? "active" : (finalStatus || "not_activated"),
      isValid: lic.allowed,
      expiresAt: lic.expiresAt || null,
      daysLeft: isLocked ? 0 : Math.max(0, daysLeft),
      storeName: "", // Bisa di-query dari db jika perlu
      reason: lic.reason || null,
    };
    
    // Update DB untuk keperluan info lokalan
    const existing = await db.select().from(licenseCacheTable).limit(1);
    if (existing.length > 0) {
      await db.update(licenseCacheTable).set({
        isValid: lic.allowed,
        expiresAt: expDate,
        daysLeft: isLocked ? -999 : Math.max(0, daysLeft),
        cachedAt: new Date(),
        licenseKey: lic.licenseKey || existing[0].licenseKey,
      }).where(eq(licenseCacheTable.id, existing[0].id));
      result.storeName = existing[0].storeName || "";
    } else {
      await db.insert(licenseCacheTable).values({
        licenseKey: lic.licenseKey || "",
        isValid: lic.allowed,
        expiresAt: expDate,
        daysLeft: isLocked ? -999 : Math.max(0, daysLeft),
        storeName: "",
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Failed to check license status", error);
    res.status(500).json({ error: "Terjadi kesalahan internal" });
  }
});

router.get("/info", async (req: Request, res: Response): Promise<void> => {
  try {
    const cache = await db.select().from(licenseCacheTable).limit(1);
    const mId = await getMachineId();
    
    if (cache.length === 0) {
      res.json({ licenseKey: null, isValid: false, machineId: mId });
      return;
    }
    res.json({ ...cache[0], machineId: mId });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch info" });
  }
});

export default router;
