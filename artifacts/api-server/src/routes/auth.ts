import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    fullName: string;
    role: string;
  }
}

const router = Router();

async function ensureDefaultAdmin() {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, "admin"));
  if (!existing) {
    const hash = await bcrypt.hash("vocpos2026", 10);
    await db.insert(usersTable).values({
      username: "admin",
      passwordHash: hash,
      fullName: "Administrator",
      role: "admin",
    });
  }
}

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    await ensureDefaultAdmin();
  } catch {}
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username dan password wajib diisi" }); return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "Username atau password salah" }); return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Username atau password salah" }); return;
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.fullName = user.fullName;
  req.session.role = user.role;
  res.json({ id: user.id, username: user.username, fullName: user.fullName, role: user.role });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" }); return;
  }
  res.json({
    id: req.session.userId,
    username: req.session.username,
    fullName: req.session.fullName,
    role: req.session.role,
  });
});

export default router;
