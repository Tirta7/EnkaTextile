import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

// POST /api/upload/product-image
// Upload gambar produk dan simpan ke /uploads/products/
router.post("/upload/product-image", async (req, res): Promise<void> => {
  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "Content-Type harus multipart/form-data" });
      return;
    }

    // Parsing multipart manually (menggunakan busboy)
    const busboy = (await import("busboy")).default;
    const bb = busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } });

    const uploadsDir = path.resolve(process.cwd(), "uploads", "products");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    let savedUrl: string | null = null;
    let errorOccurred = false;

    bb.on("file", (_fieldname, file, info) => {
      const { mimeType } = info;
      if (!mimeType.startsWith("image/")) {
        file.resume();
        errorOccurred = true;
        return;
      }

      const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      savedUrl = `/uploads/products/${filename}`;

      const writeStream = fs.createWriteStream(filePath);
      file.pipe(writeStream);

      writeStream.on("error", () => { errorOccurred = true; });
    });

    bb.on("finish", () => {
      if (errorOccurred || !savedUrl) {
        res.status(400).json({ error: "Upload gagal atau format file tidak valid" });
        return;
      }
      res.json({ url: savedUrl });
    });

    bb.on("error", () => {
      res.status(500).json({ error: "Upload error" });
    });

    req.pipe(bb);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});

export default router;
