"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { selfAssignAction } from "@/app/(app)/inbox/actions";

export function AssignToMeButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      className="h-7 text-xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await selfAssignAction(taskId);
        })
      }
    >
      {pending ? "Assigning…" : "Assign to me"}
    </Button>
  );
}
