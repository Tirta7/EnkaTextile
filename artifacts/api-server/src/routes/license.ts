import { Router, Request, Response } from "express";
import { db, licenseCacheTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import machineIdPkg from "node-machine-id";
import path from "path";
import { checkLicense, verifyLicenseKey } from "../lib/vocml-client.js";

const { machineId } = machineIdPkg;

const router = Router();

const getMachineId = async () => {
  const id = await machineId();
  const short = id.substring(0, 12).toUpperCase();
  return `VOC-${short.substring(0,4)}-${short.substring(4,8)}-${short.substring(8,12)}`;
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
