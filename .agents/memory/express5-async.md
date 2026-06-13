---
name: Express 5 async handler return types
description: How to avoid TS7030 "not all code paths return a value" in Express 5 async route handlers
---

Express 5 async route handlers get TS7030 errors when some code paths call `return res.json(...)` (which returns `Response`) while others just call `res.json(...)` (returns `void`).

**Rule:** Either use `{ res.status(404).json(...); return; }` pattern (no return value), or annotate the handler as `async (req, res): Promise<void> => { ... }`.

**Why:** TypeScript infers the return type as `Response | void` and complains that not all paths return the same type. The explicit `Promise<void>` annotation or the pattern of always using the two-statement form fixes this.

**How to apply:** For any GET handler that can 404, use:
```ts
router.get("/items/:id", async (req, res): Promise<void> => {
  const [item] = await db.select()...;
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});
```
