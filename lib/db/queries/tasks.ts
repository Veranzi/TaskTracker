import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  tasks,
  users,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/db/schema";

export const ACTIVE_STATUSES = [
  "open",
  "in_progress",
  "waiting_client",
  "follow_up",
] as const satisfies readonly TaskStatus[];

export const DONE_STATUSES = ["resolved", "closed"] as const satisfies readonly TaskStatus[];

export type DashboardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  project: { id: string; name: string; color: string };
  assignee: { id: string; name: string } | null;
};

const baseSelect = {
  id: tasks.id,
  title: tasks.title,
  status: tasks.status,
  priority: tasks.priority,
  dueDate: tasks.dueDate,
  createdAt: tasks.createdAt,
  project: {
    id: projects.id,
    name: projects.name,
    color: projects.color,
  },
  assigneeId: tasks.assigneeId,
  assigneeName: users.name,
};

async function rowsToDashboardTasks(
  rows: Awaited<ReturnType<typeof runBaseQuery>>,
): Promise<DashboardTask[]> {
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    priority: r.priority,
    dueDate: r.dueDate,
    createdAt: r.createdAt,
    project: r.project,
    assignee:
      r.assigneeId && r.assigneeName
        ? { id: r.assigneeId, name: r.assigneeName }
        : null,
  }));
}

function runBaseQuery() {
  return db
    .select(baseSelect)
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id));
}

// Soft cap — well above what an internal team of 5 will reasonably accumulate,
// but prevents runaway queries if someone bulk-imports. The panel scrolls.
const LIST_CAP = 200;

export async function listUnassignedActive(): Promise<DashboardTask[]> {
  const rows = await runBaseQuery()
    .where(and(isNull(tasks.assigneeId), inArray(tasks.status, ACTIVE_STATUSES)))
    .orderBy(asc(tasks.dueDate), desc(tasks.createdAt))
    .limit(LIST_CAP);
  return rowsToDashboardTasks(rows);
}

export async function listMyActive(userId: string): Promise<DashboardTask[]> {
  const rows = await runBaseQuery()
    .where(
      and(eq(tasks.assigneeId, userId), inArray(tasks.status, ACTIVE_STATUSES)),
    )
    .orderBy(asc(tasks.dueDate), desc(tasks.createdAt))
    .limit(LIST_CAP);
  return rowsToDashboardTasks(rows);
}
