import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable);
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    if (!result["app_name"]) result["app_name"] = "EnkaTextile";
    
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch settings", error);
    res.status(500).json({ error: "Gagal mengambil pengaturan" });
  }
});

router.get("/manifest.json", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable);
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    const appName = result["app_name"] || "EnkaTextile";
    const appLogo = result["app_logo"] || "/favicon.svg";
    
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    
    res.json({
      "name": appName,
      "short_name": appName,
      "description": "Virtual Operational Control — Sistem POS/ERP Tekstil",
      "app_logo": appLogo,
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "icons": [
        {
          "src": appLogo,
          "sizes": "192x192",
          "type": appLogo.startsWith("data:image/") ? appLogo.substring(5, appLogo.indexOf(";")) : "image/svg+xml"
        },
        {
          "src": appLogo,
          "sizes": "512x512",
          "type": appLogo.startsWith("data:image/") ? appLogo.substring(5, appLogo.indexOf(";")) : "image/svg+xml"
        }
      ]
    });
  } catch (error) {
    console.error("Failed to fetch manifest", error);
    res.status(500).json({ error: "Gagal mengambil pengaturan" });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    const settings: Record<string, string> = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
      if (existing.length > 0) {
        await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, key));
      } else {
        await db.insert(settingsTable).values({ key, value });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to bulk update settings", error);
    res.status(500).json({ error: "Gagal menyimpan pengaturan" });
  }
});

export { router as settingsRouter };
