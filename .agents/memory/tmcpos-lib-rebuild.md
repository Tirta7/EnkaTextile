---
name: TMCpos lib rebuild order
description: Required build order after schema/lib changes to avoid false TypeScript errors
---

After any change to `lib/db` (schema), `lib/api-zod`, or `lib/api-client-react`, the lib declarations must be rebuilt before running typecheck on leaf packages.

**Rule:** Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` after any lib change.

**Why:** The api-server imports from `@workspace/db` and `@workspace/api-zod`. If lib `.d.ts` files are stale, TypeScript reports "Module has no exported member" errors that look like real import errors but are just stale declarations.

**How to apply:**
1. Change schema in `lib/db/src/schema/index.ts`
2. Run `pnpm --filter @workspace/db run push` to apply to DB
3. Run `pnpm run typecheck:libs` to rebuild declarations
4. Then run `pnpm --filter @workspace/api-server run typecheck`
