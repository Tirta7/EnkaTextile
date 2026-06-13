---
name: Drizzle numeric columns
description: How to handle numeric() column types in Drizzle ORM inserts and updates
---

Drizzle `numeric()` columns in PostgreSQL require string values on insert/update — never raw JavaScript numbers.

**Rule:** Always convert: `String(value)` or `value.toString()` before passing to `.values()` or `.set()`.

**Why:** Drizzle's TypeScript type for `numeric()` is `string`, not `number`. Passing a JS number causes TS2345 type errors and may cause unexpected behavior.

**How to apply:** In any route that inserts/updates a numeric column (pricePerMeter, rollStock, meterStock, minStock, amount, totalAmount, paidAmount), wrap the value: `pricePerMeter: String(d.pricePerMeter)`.

When reading back from DB, convert to number with `parseFloat(row.columnName ?? "0")` for math operations or API responses.
