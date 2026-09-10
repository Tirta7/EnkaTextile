import { Router, Request, Response } from "express";
import { db, licenseCacheTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import machineIdPkg from "node-machine-id";
const { machineId } = machineIdPkg;

const router = Router();

const GAS_WEBAPP_URL = process.env.GAS_WEBAPP_URL || "";

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
    
    if (!GAS_WEBAPP_URL) {
      res.status(500).json({ error: "GAS_WEBAPP_URL belum diatur di sistem" });
      return;
    }

    const mId = await getMachineId();

    const response = await fetch(GAS_WEBAPP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "activate", licenseKey, machineId: mId }),
    });

    let data: any;
    try {
      data = await response.json();
    } catch(e) {
      res.status(400).json({ error: "Gagal terhubung ke Server Lisensi (Invalid Response)." });
      return;
    }

    if (!data.valid) {
      res.status(400).json({ error: data.error || "Gagal mengaktifkan lisensi. Key tidak valid." });
      return;
    }

    const existing = await db.select().from(licenseCacheTable).limit(1);
    
    if (existing.length > 0) {
      await db.update(licenseCacheTable).set({
        licenseKey: licenseKey,
        isValid: true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        daysLeft: data.daysLeft || 0,
        cachedAt: new Date(),
        storeName: data.storeName || "",
      }).where(eq(licenseCacheTable.id, existing[0].id));
    } else {
      await db.insert(licenseCacheTable).values({
        licenseKey: licenseKey,
        isValid: true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        daysLeft: data.daysLeft || 0,
        storeName: data.storeName || "",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Failed to activate license", error);
    res.status(500).json({ error: "Terjadi kesalahan sistem saat menghubungi server lisensi." });
  }
});

router.get("/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const cache = await db.select().from(licenseCacheTable).limit(1);
    const licenses = await db.select().from(licenseCacheTable).limit(1);
    
    if (licenses.length === 0) {
      res.json({ status: "not_activated", isValid: false });
      return;
    }

    const currentCache = licenses[0];
    const isLocked = currentCache.daysLeft === -999;

    let result = {
      status: isLocked ? "locked" : (currentCache.isValid ? "active" : "expired"),
      isValid: currentCache.isValid,
      expiresAt: currentCache.expiresAt,
      daysLeft: currentCache.daysLeft === -999 ? 0 : currentCache.daysLeft,
      storeName: currentCache.storeName,
    };
    
    // Background sync jika cache sudah lebih dari 30 detik
    const now = new Date().getTime();
    const cachedAt = currentCache.cachedAt ? currentCache.cachedAt.getTime() : 0;
    
    if (GAS_WEBAPP_URL && (now - cachedAt > 30000)) {
      (async () => {
        try {
          const mId = await getMachineId();
          const response = await fetch(GAS_WEBAPP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "validate", licenseKey: currentCache.licenseKey, machineId: mId }),
          });
          
          if (response.ok) {
            const data: any = await response.json();
            
            let isEmergencyLock = false;
            if (!data.valid && data.error === "LOCKED_EMERGENCY") {
              isEmergencyLock = true;
            }

            await db.update(licenseCacheTable).set({
              isValid: data.valid,
              expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
              daysLeft: isEmergencyLock ? -999 : (data.daysLeft || 0),
              cachedAt: new Date(),
              storeName: data.storeName || "",
            }).where(eq(licenseCacheTable.id, currentCache.id));
          }
        } catch (fetchError) {
          // Abaikan error background fetch
        }
      })();
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
