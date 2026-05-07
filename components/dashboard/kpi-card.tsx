import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: number;
  sublabel: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-1">
      <span className="text-sm text-muted-foreground font-medium">
        {label}
      </span>
      <span
        className={cn(
          "text-5xl font-semibold tracking-tight tabular-nums",
          accent && "text-primary",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </div>
  );
}
