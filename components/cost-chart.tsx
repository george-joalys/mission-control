"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const agentColors: Record<string, string> = {
  George: "#6366f1",
  Rex: "#f59e0b",
  Leo: "#ec4899",
  Iris: "#8b5cf6",
  Atlas: "#06b6d4",
  Scout: "#f97316",
  Hugo: "#14b8a6",
  "SEO Agent": "#10b981",
};

const colorPalette = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value.toLocaleString()} tokens</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CostChart({ data }: { data: Record<string, unknown>[] }) {
  const agentNames = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== "day")
    : [];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {agentNames.map((name, i) => (
          <Bar key={name} dataKey={name} fill={agentColors[name] || colorPalette[i % colorPalette.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
