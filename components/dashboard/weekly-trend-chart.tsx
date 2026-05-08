"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyPoint } from "@/lib/db/queries/dashboard";

export function WeeklyTrendChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold tracking-tight">Tasks by week</h3>
        <span className="text-xs text-muted-foreground">last 5 weeks</span>
      </div>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              cursor={{ fill: "var(--secondary)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="created" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" fill="#f472b6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
