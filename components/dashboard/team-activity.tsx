import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/db/schema";
import type { DashboardTask } from "@/lib/db/queries/tasks";
import { STATUS_HEX } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { cn } from "@/lib/utils";

type Group = { id: string; name: string; tasks: DashboardTask[] };

function groupByAssignee(list: DashboardTask[]): Group[] {
  const map = new Map<string, Group>();
  for (const t of list) {
    if (!t.assignee) continue;
    let g = map.get(t.assignee.id);
    if (!g) {
      g = { id: t.assignee.id, name: t.assignee.name, tasks: [] };
      map.set(t.assignee.id, g);
    }
    g.tasks.push(t);
  }
  return [...map.values()];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamActivity({ tasks }: { tasks: DashboardTask[] }) {
  const groups = groupByAssignee(tasks);

  return (
    <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold tracking-tight">
          What others are working on
        </h2>
        <span className="text-xs text-muted-foreground">
          {groups.length === 0
            ? "0 teammates active"
            : `${groups.length} teammate${groups.length === 1 ? "" : "s"} · ${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">
          No teammates have active tasks right now.
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {groups.map((g) => (
            <PersonCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </section>
  );
}

function PersonCard({ group }: { group: Group }) {
  return (
    <article className="rounded-lg border border-border bg-secondary/30 p-3 flex flex-col gap-2.5">
      <header className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
          {initials(group.name) || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{group.name}</div>
          <div className="text-xs text-muted-foreground">
            {group.tasks.length} active
          </div>
        </div>
      </header>
      <ul className="flex flex-col gap-1.5">
        {group.tasks.slice(0, 5).map((t) => (
          <TeamTaskRow key={t.id} task={t} />
        ))}
      </ul>
      {group.tasks.length > 5 ? (
        <span className="text-xs text-muted-foreground pl-1">
          +{group.tasks.length - 5} more
        </span>
      ) : null}
    </article>
  );
}

function TeamTaskRow({ task }: { task: DashboardTask }) {
  const overdue =
    task.dueDate &&
    task.dueDate.getTime() < Date.now() &&
    task.status !== "resolved" &&
    task.status !== "closed";

  return (
    <li className="rounded-md bg-background/40 border border-border/60 p-2 flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium leading-tight line-clamp-2">
            {task.title}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: task.project.color }}
            />
            <span className="truncate">{task.project.name}</span>
          </div>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: STATUS_HEX[task.status as TaskStatus] }}
          />
          <span className="text-muted-foreground">
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-muted-foreground",
            overdue && "text-rose-400",
          )}
        >
          <CalendarDays className="h-2.5 w-2.5" />
          {task.dueDate ? format(task.dueDate, "MMM d") : "—"}
        </span>
      </div>
    </li>
  );
}
