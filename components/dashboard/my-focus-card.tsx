import { cn } from "@/lib/utils";
import type { MyFocus } from "@/lib/db/queries/dashboard";

export function MyFocusCard({ focus }: { focus: MyFocus }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-semibold tracking-tight">My Focus</h3>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        <Row label="Active" value={focus.active} />
        <Row label="Due Today" value={focus.dueToday} />
        <Row
          label="Overdue"
          value={focus.overdue}
          valueClassName={focus.overdue > 0 ? "text-rose-400" : undefined}
        />
      </ul>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tabular-nums", valueClassName)}>
        {value}
      </span>
    </li>
  );
}
