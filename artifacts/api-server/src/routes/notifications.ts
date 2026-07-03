import { Router, type Request, type Response } from "express";
import { pushService } from "../lib/push";

const router = Router();

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

export default router;
