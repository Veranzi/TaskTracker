import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, string> = {
  open: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  in_progress: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  waiting_client: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  follow_up: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  resolved: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  closed: "bg-violet-500/15 text-violet-300 border-violet-500/25",
};

export const STATUS_DOT: Record<TaskStatus, string> = {
  open: "bg-sky-400",
  in_progress: "bg-rose-400",
  waiting_client: "bg-orange-400",
  follow_up: "bg-amber-400",
  resolved: "bg-teal-400",
  closed: "bg-violet-400",
};

export const STATUS_HEX: Record<TaskStatus, string> = {
  open: "#38bdf8",
  in_progress: "#fb7185",
  waiting_client: "#fb923c",
  follow_up: "#fbbf24",
  resolved: "#2dd4bf",
  closed: "#a78bfa",
};

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium border", STATUS_STYLES[status], className)}
    >
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
