"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
  type TaskStatus,
} from "@/lib/db/schema";
import { updateStatusAction } from "@/app/(app)/inbox/actions";
import { STATUS_DOT } from "./status-badge";
import { cn } from "@/lib/utils";

export function StatusSelect({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(next) => {
        if (next === status) return;
        startTransition(async () => {
          await updateStatusAction({ taskId, status: next as TaskStatus });
        });
      }}
    >
      <SelectTrigger size="sm" className="h-7 text-xs gap-1.5">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[s])} />
              {TASK_STATUS_LABELS[s]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
