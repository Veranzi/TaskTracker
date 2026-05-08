"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER, type TaskStatus } from "@/lib/db/schema";
import type { WorkloadSlice } from "@/lib/db/queries/dashboard";
import { STATUS_HEX } from "./status-badge";

export function WorkloadDonut({ slices }: { slices: WorkloadSlice[] }) {
  const total = slices.reduce((acc, s) => acc + s.n, 0);
  const data =
    total === 0
      ? [{ status: "open" as TaskStatus, n: 1, _empty: true }]
      : slices.map((s) => ({ ...s, _empty: false }));

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col">
      <h3 className="font-semibold tracking-tight">Workload by status</h3>
      <div className="relative mt-2 h-[180px]">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="n"
              nameKey="status"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d._empty ? "var(--muted)" : STATUS_HEX[d.status as TaskStatus]}
                />
              ))}
            </Pie>
            {total > 0 ? (
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  value as number,
                  TASK_STATUS_LABELS[name as TaskStatus] ?? String(name),
                ]}
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-semibold tabular-nums">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            tasks
          </span>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {TASK_STATUS_ORDER.map((s) => {
          const count = slices.find((x) => x.status === s)?.n ?? 0;
          return (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_HEX[s] }}
              />
              <span className="text-muted-foreground truncate">
                {TASK_STATUS_LABELS[s]}
              </span>
              <span className="ml-auto tabular-nums">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
