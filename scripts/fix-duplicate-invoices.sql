-- ============================================================
-- Migration: Bersihkan duplikat invoice_number & tambah UNIQUE
-- ============================================================

-- Step 1: Hapus payables yang terkait duplikat (simpan ID terkecil)
DELETE FROM payables
WHERE purchase_id IN (
  SELECT id FROM purchases
  WHERE id NOT IN (
    SELECT MIN(id) FROM purchases GROUP BY invoice_number
  )
);

-- Step 2: Hapus purchase_items yang terkait duplikat
DELETE FROM purchase_items
WHERE purchase_id IN (
  SELECT id FROM purchases
  WHERE id NOT IN (
    SELECT MIN(id) FROM purchases GROUP BY invoice_number
  )
);

-- Step 3: Hapus baris purchases duplikat (simpan yang paling lama)
DELETE FROM purchases
WHERE id NOT IN (
  SELECT MIN(id) FROM purchases GROUP BY invoice_number
);

-- Step 4: Tambah UNIQUE constraint
ALTER TABLE purchases
  ADD CONSTRAINT purchases_invoice_number_unique UNIQUE (invoice_number);

-- Step 5: Verifikasi
SELECT invoice_number, COUNT(*) as jumlah
FROM purchases
GROUP BY invoice_number
HAVING COUNT(*) > 1;
