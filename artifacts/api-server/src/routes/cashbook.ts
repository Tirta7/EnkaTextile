import { Router } from "express";
import { db } from "@workspace/db";
import { cashEntriesTable } from "@workspace/db";
import { and, gte, lte, sql } from "drizzle-orm";
import { CreateCashEntryBody } from "@workspace/api-zod";
import { broadcastRefresh } from "../lib/websocket";

const router = Router();

function numStr(v: string | null | undefined) { return parseFloat(v ?? "0"); }

router.get("/cashbook", async (req, res) => {
  const { startDate, endDate, type } = req.query;
  const conditions: any[] = [];
  if (startDate) conditions.push(gte(cashEntriesTable.createdAt, new Date(startDate as string)));
  if (endDate) conditions.push(lte(cashEntriesTable.createdAt, new Date(endDate as string)));
  if (type) conditions.push(sql`${cashEntriesTable.type} = ${type}`);

  const entries = await db
    .select()
    .from(cashEntriesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(cashEntriesTable.createdAt);

  res.json(entries.map(e => ({
    ...e,
    amount: numStr(e.amount),
    createdAt: e.createdAt.toISOString(),
  })));
});

router.post("/cashbook", async (req, res) => {
  const parsed = CreateCashEntryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const [entry] = await db.insert(cashEntriesTable).values({
    ...parsed.data,
    amount: parsed.data.amount.toString(),
    reference: parsed.data.reference ?? null,
  }).returning();

  broadcastRefresh();
  res.status(201).json({ ...entry, amount: numStr(entry.amount), createdAt: entry.createdAt.toISOString() });
});

router.get("/cashbook/balance", async (req, res) => {
  const [result] = await db
    .select({
      totalIn: sql<string>`coalesce(sum(case when type = 'income' then amount else 0 end), 0)`,
      totalOut: sql<string>`coalesce(sum(case when type = 'expense' then amount else 0 end), 0)`,
    })
    .from(cashEntriesTable);

  const totalIn = parseFloat(result?.totalIn ?? "0");
  const totalOut = parseFloat(result?.totalOut ?? "0");
  res.json({ balance: totalIn - totalOut, totalIn, totalOut });
});

export default router;
