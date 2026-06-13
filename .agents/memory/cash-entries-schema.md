---
name: Cash entries schema quirks
description: Schema details for the cash_entries table that differ from what was planned
---

The `cash_entries` table has these columns: `id`, `type`, `amount`, `description`, `reference`, `created_at`.

**No `category` column** — the frontend BukuKas page uses `reference` instead.

**Type values** are `"income"` and `"expense"` (English), NOT `"masuk"/"keluar"` (Indonesian). The cashbook balance query must filter on `type = 'income'` and `type = 'expense'`.

**Why:** The DB schema was defined with English enum values but some route code initially used Indonesian equivalents — this caused the balance to always show 0.
