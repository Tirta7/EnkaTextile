# TMCpos — Textile POS/ERP

A next-generation wholesale textile POS/ERP system for Enka Textile. Covers inventory, sales, purchases, stock mutations, receivables, payables, cash book, and reporting — all in Indonesian.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api` and `/ws`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run before leaf typechecks after schema changes)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 with WebSocket (`ws` package) — `/ws` path for real-time sync
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, TailwindCSS, shadcn/ui, React Query, wouter

## Where things live

- `lib/db/src/schema/index.ts` — Database schema (all tables)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API)
- `lib/api-zod/src/generated/` — Generated Zod schemas
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `artifacts/api-server/src/routes/` — Backend route files
- `artifacts/tmcpos/src/pages/` — Frontend pages
- `artifacts/tmcpos/src/components/layout/` — AppLayout, Sidebar, Header

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → Zod schemas + React Query hooks
- Drizzle `numeric()` columns return strings from DB; always convert to `String(value)` on insert/update
- Express 5 async handlers require explicit `return` or `Promise<void>` type to avoid TS7030 "not all code paths return a value"
- WebSocket at `/ws` path broadcasts `{ type: "refresh" }` after every write operation for real-time sync
- Cash entries use `type: "income" | "expense"` (not "masuk"/"keluar") — balance query filters on these values

## Product

TMCpos is a full POS/ERP for wholesale textile businesses:
- **Dashboard** — real-time KPIs (revenue, transactions, cash balance, receivables, low stock alerts)
- **Kategori** — product category management
- **Barang** — product inventory with dual-unit (roll + meter), lot tracking, rack location, low-stock alerts
- **Pelanggan** — customer management with credit limit tracking
- **Supplier** — supplier management with payables overview
- **Penjualan** — sales transactions (tunai, transfer, cashless, kredit)
- **Pembelian** — purchase orders from suppliers
- **Mutasi Stok** — stock mutations (in/out/adjustment)
- **Piutang** — accounts receivable with payment recording and overdue tracking
- **Hutang** — accounts payable with payment recording
- **Buku Kas** — cash book (income/expense entries)
- **Laporan** — sales summary reports and stock summary reports with CSV export

## User preferences

_Populated as needed._

## Gotchas

- After any `lib/db` schema change, run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- Drizzle `numeric()` columns: always pass `String(num)` for inserts/updates — never raw numbers
- The `cash_entries` table has no `category` column — use `reference` instead
- The `sale_items` table has no `unit` column in DB — unit is handled at application level
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
