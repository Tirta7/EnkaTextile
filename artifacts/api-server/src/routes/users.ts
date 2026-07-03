import { Router, Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak. Hanya Admin yang dapat mengelola karyawan." });
    return;
  }
  next();
};

router.use(requireAdmin);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat pengguna" });
  }
});

const userInputSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(["admin", "kasir"]),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = userInputSchema.parse(req.body);
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, data.username));
    if (existing.length > 0) {
      res.status(400).json({ error: "Username sudah digunakan" }); return;
    }
    const hash = await bcrypt.hash(data.password, 10);
    const [user] = await db.insert(usersTable).values({
      username: data.username,
      passwordHash: hash,
      fullName: data.fullName,
      role: data.role,
    }).returning({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Data tidak valid", details: err.errors }); return;
    }
    res.status(500).json({ error: "Gagal membuat pengguna" });
  }
});

const userUpdateSchema = z.object({
  username: z.string().min(3),
  password: z.string().optional(),
  fullName: z.string().min(2),
  role: z.enum(["admin", "kasir"]),
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const data = userUpdateSchema.parse(req.body);
    
    // Check if updating the last admin
    if (data.role !== "admin") {
      const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
      if (admins.length <= 1 && admins[0]?.id === id) {
        res.status(400).json({ error: "Tidak dapat mengubah role admin terakhir" }); return;
      }
    }

    const updates: any = {
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    };
    if (data.password) {
      updates.passwordHash = await bcrypt.hash(data.password, 10);
    }
    
    const [user] = await db.update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        fullName: usersTable.fullName,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      });
      
    if (!user) {
      res.status(404).json({ error: "Pengguna tidak ditemukan" }); return;
    }
    res.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Data tidak valid", details: err.errors }); return;
    }
    res.status(500).json({ error: "Gagal memperbarui pengguna" });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (id === req.session.userId) {
      res.status(400).json({ error: "Tidak dapat menghapus akun Anda sendiri" }); return;
    }
    const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning({ id: usersTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Pengguna tidak ditemukan" }); return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus pengguna" });
  }
});

export default router;
