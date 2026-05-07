import "server-only";
import { and, count, eq, gte, inArray, isNotNull, isNull, lt, sql } from "drizzle-orm";
import {
  endOfDay,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
  format,
} from "date-fns";
import { db } from "@/lib/db/client";
import { tasks, type TaskStatus } from "@/lib/db/schema";
import { ACTIVE_STATUSES, DONE_STATUSES } from "./tasks";

export type Kpis = {
  unassigned: number;
  myActive: number;
  ourActive: number;
  myClosed: number;
  ourClosed: number;
};

export async function getKpis(userId: string): Promise<Kpis> {
  const [unassigned, myActive, ourActive, myClosed, ourClosed] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(tasks)
        .where(
          and(isNull(tasks.assigneeId), inArray(tasks.status, ACTIVE_STATUSES)),
        ),
      db
        .select({ n: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.assigneeId, userId),
            inArray(tasks.status, ACTIVE_STATUSES),
          ),
        ),
      db
        .select({ n: count() })
        .from(tasks)
        .where(inArray(tasks.status, ACTIVE_STATUSES)),
      db
        .select({ n: count() })
        .from(tasks)
        .where(
          and(eq(tasks.assigneeId, userId), inArray(tasks.status, DONE_STATUSES)),
        ),
      db
        .select({ n: count() })
        .from(tasks)
        .where(inArray(tasks.status, DONE_STATUSES)),
    ]);
  return {
    unassigned: unassigned[0]?.n ?? 0,
    myActive: myActive[0]?.n ?? 0,
    ourActive: ourActive[0]?.n ?? 0,
    myClosed: myClosed[0]?.n ?? 0,
    ourClosed: ourClosed[0]?.n ?? 0,
  };
}

export type MyFocus = { active: number; dueToday: number; overdue: number };

export async function getMyFocus(userId: string): Promise<MyFocus> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [active, dueToday, overdue] = await Promise.all([
    db
      .select({ n: count() })
      .from(tasks)
      .where(
        and(eq(tasks.assigneeId, userId), inArray(tasks.status, ACTIVE_STATUSES)),
      ),
    db
      .select({ n: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, userId),
          inArray(tasks.status, ACTIVE_STATUSES),
          gte(tasks.dueDate, todayStart),
          lt(tasks.dueDate, todayEnd),
        ),
      ),
    db
      .select({ n: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, userId),
          inArray(tasks.status, ACTIVE_STATUSES),
          lt(tasks.dueDate, todayStart),
        ),
      ),
  ]);
  return {
    active: active[0]?.n ?? 0,
    dueToday: dueToday[0]?.n ?? 0,
    overdue: overdue[0]?.n ?? 0,
  };
}

export type WorkloadSlice = { status: TaskStatus; n: number };

export async function getMyWorkload(userId: string): Promise<WorkloadSlice[]> {
  const rows = await db
    .select({ status: tasks.status, n: count() })
    .from(tasks)
    .where(eq(tasks.assigneeId, userId))
    .groupBy(tasks.status);
  return rows.map((r) => ({ status: r.status as TaskStatus, n: r.n }));
}

export type DailyPoint = { day: string; completed: number };

// Last 7 days, including today, zero-filled.
export async function getMyDailyCompleted(userId: string): Promise<DailyPoint[]> {
  const since = startOfDay(subDays(new Date(), 6));
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${tasks.completedAt}), 'YYYY-MM-DD')`,
      n: count(),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.assigneeId, userId),
        isNotNull(tasks.completedAt),
        gte(tasks.completedAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${tasks.completedAt})`);

  const byDay = new Map(rows.map((r) => [r.day, r.n]));
  const out: DailyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "yyyy-MM-dd");
    out.push({ day: format(d, "EEE"), completed: byDay.get(key) ?? 0 });
  }
  return out;
}

export type WeeklyPoint = { week: string; created: number; closed: number };

// Last 5 weeks (Mon start), zero-filled.
export async function getWeeklyTrend(): Promise<WeeklyPoint[]> {
  const since = startOfWeek(subWeeks(new Date(), 4), { weekStartsOn: 1 });

  const [createdRows, closedRows] = await Promise.all([
    db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${tasks.createdAt}), 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(tasks)
      .where(gte(tasks.createdAt, since))
      .groupBy(sql`date_trunc('week', ${tasks.createdAt})`),
    db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${tasks.completedAt}), 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(tasks)
      .where(and(isNotNull(tasks.completedAt), gte(tasks.completedAt, since)))
      .groupBy(sql`date_trunc('week', ${tasks.completedAt})`),
  ]);

  const createdMap = new Map(createdRows.map((r) => [r.week, r.n]));
  const closedMap = new Map(closedRows.map((r) => [r.week, r.n]));
  const out: WeeklyPoint[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const key = format(d, "yyyy-MM-dd");
    out.push({
      week: format(d, "MMM d"),
      created: createdMap.get(key) ?? 0,
      closed: closedMap.get(key) ?? 0,
    });
  }
  return out;
}
