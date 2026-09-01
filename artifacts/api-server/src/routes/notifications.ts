import { Router, type Request, type Response } from "express";
import { pushService } from "../lib/push";

const router = Router();

// ─── OTP Storage (in-memory, valid 15 menit) ─────────────────────────────────
// Structure: { otp: string, expiresAt: number (unix ms) }
let activeOtp: { otp: string; expiresAt: number } | null = null;

// Structure: { token: string, expiresAt: number }
export const verifiedReturnTokens = new Map<string, number>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanExpiredOtp() {
  const now = Date.now();
  if (activeOtp && now > activeOtp.expiresAt) {
    activeOtp = null;
  }
  for (const [token, expiresAt] of verifiedReturnTokens.entries()) {
    if (now > expiresAt) {
      verifiedReturnTokens.delete(token);
    }
  }
}
// ─────────────────────────────────────────────────────────────────────────────

router.get("/vapid-public-key", (req: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    res.status(500).json({ error: "VAPID_PUBLIC_KEY is not configured" });
    return;
  }
  res.json({ publicKey: key });
});

router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const subscription = req.body;
    await pushService.saveSubscription(userId, subscription);

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

/**
 * POST /api/notifications/request-return-otp
 * Generate OTP 6 digit dan kirim ke semua admin via Web Push.
 * OTP berlaku 15 menit dan bisa dipakai berulang dalam window tersebut.
 */
router.post("/request-return-otp", async (req: Request, res: Response) => {
  try {
    cleanExpiredOtp();

    // Jika sudah ada OTP aktif yang belum expired, gunakan ulang (jangan spam notif)
    const isReuse = activeOtp !== null;
    
    if (!isReuse) {
      // Generate OTP baru
      const otp = generateOtp();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 menit
      activeOtp = { otp, expiresAt };
      console.log(`[NOTIF] OTP Retur: ${otp}`);
    }

    // Hitung sisa waktu dalam menit
    const remainingMs = activeOtp!.expiresAt - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);

    // Kirim push notification ke semua admin
    const sent = await pushService.sendReturnOtpNotification(
      activeOtp!.otp,
      remainingMin,
      isReuse
    );

    if (!sent) {
      res.status(503).json({
        error: "Tidak ada admin yang mengaktifkan notifikasi. Minta owner untuk mengaktifkan notifikasi terlebih dahulu di pengaturan browser.",
        code: "NO_SUBSCRIBERS"
      });
      return;
    }

    res.json({
      otpSent: true,
      expiresInMinutes: remainingMin,
      isReuse,
    });
  } catch (error) {
    console.error("request-return-otp error:", error);
    res.status(500).json({ error: "Gagal mengirim OTP" });
  }
});

/**
 * POST /api/notifications/verify-return-otp
 * Body: { otp: "089564" }
 * Validasi OTP. Tidak menghapus setelah dipakai (berlaku selama 15 menit).
 */
router.post("/verify-return-otp", async (req: Request, res: Response) => {
  try {
    cleanExpiredOtp();

    const { otp } = req.body as { otp: string };

    if (!otp) {
      res.status(400).json({ valid: false, error: "OTP wajib diisi" });
      return;
    }

    if (!activeOtp) {
      res.status(400).json({ valid: false, error: "Tidak ada OTP aktif. Minta ulang kode OTP." });
      return;
    }

    if (activeOtp.otp !== otp.trim()) {
      res.status(400).json({ valid: false, error: "Kode OTP salah" });
      return;
    }

    // OTP valid – tidak dihapus (bisa dipakai berulang dalam 15 menit)
    const remainingMs = activeOtp.expiresAt - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);

    const crypto = require("crypto");
    const token = crypto.randomUUID();
    verifiedReturnTokens.set(token, Date.now() + 15 * 60 * 1000); // 15 menit token expiry

    res.json({ valid: true, expiresInMinutes: remainingMin, token });
  } catch (error) {
    console.error("verify-return-otp error:", error);
    res.status(500).json({ valid: false, error: "Gagal memverifikasi OTP" });
  }
});

export default router;
