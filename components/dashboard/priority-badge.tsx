import type { TaskPriority } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const STYLES: Record<TaskPriority, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-sky-500/20 text-sky-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-rose-500/20 text-rose-300",
};

const LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium",
        STYLES[priority],
      )}
    >
      {LABELS[priority]}
    </span>
  );
}
