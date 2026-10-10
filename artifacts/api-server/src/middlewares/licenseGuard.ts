import type { Request, Response, NextFunction } from "express";
import { db, licenseCacheTable } from "@workspace/db";

export const licenseGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Daftar path yang TIDAK perlu dicek lisensinya (login, status lisensi, dll)
    const publicPaths = ["/auth", "/license", "/healthz", "/settings", "/uploads"];
    if (publicPaths.some(p => req.path.startsWith(p) || req.path === p)) {
      next();
      return;
    }

    // Cek status lisensi dari cache database (yang diupdate secara real-time oleh worker/polling)
    const existing = await db.select().from(licenseCacheTable).limit(1);
    
    // Jika tidak ada data lisensi sama sekali atau lisensi tidak valid (expired/terkunci)
    if (existing.length === 0 || !existing[0].isValid) {
      res.status(403).json({ 
        error: "FORBIDDEN: Lisensi aplikasi tidak valid, terkunci, atau telah berakhir. Akses ke sistem ditolak." 
      });
      return;
    }

    // Lisensi valid, lanjutkan ke API endpoint tujuan
    next();
  } catch (err) {
    console.error("[LicenseGuard] Error verifying license:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal saat memverifikasi lisensi." });
  }
};
