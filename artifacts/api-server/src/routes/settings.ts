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

router.get("/logo", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable).where(eq(settingsTable.key, "app_logo"));
    const appLogo = settings[0]?.value;
    
    if (appLogo && appLogo.startsWith("data:image/")) {
      // Extract content type and base64 data
      const matches = appLogo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const type = matches[1];
        const data = Buffer.from(matches[2], "base64");
        res.setHeader("Content-Type", type);
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(data);
        return;
      }
    }
    
    // Fallback if no logo or invalid
    res.redirect("/favicon.svg");
  } catch (error) {
    res.status(500).end();
  }
});

router.get("/logo.svg", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable).where(eq(settingsTable.key, "app_logo"));
    const appLogo = settings[0]?.value;
    
    if (appLogo && appLogo.startsWith("data:image/")) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="${appLogo}" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>`;
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(svg);
      return;
    }
    
    res.redirect("/favicon.svg");
  } catch (error) {
    res.status(500).end();
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
    const logoUrl = appLogo !== "/favicon.svg" ? "/api/settings/logo.svg" : "/favicon.svg";
    const logoType = "image/svg+xml";
    
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    
    res.json({
      "name": appName,
      "short_name": appName,
      "description": "Virtual Operational Control - Sistem POS/ERP",
      "start_url": "/pos/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#0f172a",
      "icons": [
        {
          "src": logoUrl,
          "sizes": "192x192",
          "type": logoType,
          "purpose": "any maskable"
        },
        {
          "src": logoUrl,
          "sizes": "512x512",
          "type": logoType,
          "purpose": "any maskable"
        },
        {
          "src": logoUrl,
          "sizes": "any",
          "type": logoType
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
