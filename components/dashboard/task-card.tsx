import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import type { DashboardTask } from "@/lib/db/queries/tasks";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  action,
  showStatus = true,
}: {
  task: DashboardTask;
  action?: React.ReactNode;
  showStatus?: boolean;
}) {
  const overdue =
    task.dueDate &&
    task.dueDate.getTime() < Date.now() &&
    task.status !== "resolved" &&
    task.status !== "closed";

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3.5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-snug">{task.title}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: task.project.color }}
            />
            <span className="truncate">{task.project.name}</span>
            {showStatus ? (
              <>
                <span className="text-border">·</span>
                <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0" />
              </>
            ) : null}
          </div>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className={cn(
            "flex items-center gap-1 text-muted-foreground",
            overdue && "text-rose-400",
          )}
        >
          <CalendarDays className="h-3 w-3" />
          {task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "No due date"}
        </span>
        {action}
      </div>
    </div>
  );
}
