"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostChart } from "@/components/cost-chart";
import { Coins, Hash, TrendingUp, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface CostRow {
  id: string;
  agent_id: string;
  date: string;
  tokens: number;
  cost_usd: number;
}

export default function CostsPage() {
  const [costs, setCosts] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("costs")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) setCosts(data);
        setLoading(false);
      });
  }, []);

  const totalTokens = costs.reduce((sum, c) => sum + (c.tokens || 0), 0);
  const totalCost = costs.reduce((sum, c) => sum + Number(c.cost_usd || 0), 0);

  // Find top agent
  const agentTokens: Record<string, number> = {};
  for (const c of costs) {
    agentTokens[c.agent_id] = (agentTokens[c.agent_id] || 0) + (c.tokens || 0);
  }
  const topAgent = Object.entries(agentTokens).sort((a, b) => b[1] - a[1])[0];
  const uniqueDays = new Set(costs.map((c) => c.date)).size || 1;

  const agentNames: Record<string, string> = { george: "George", "seo-agent": "SEO Agent" };

  // Build chart data grouped by date
  const chartData: Record<string, Record<string, number>> = {};
  for (const c of costs) {
    const day = new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!chartData[day]) chartData[day] = {};
    const name = agentNames[c.agent_id] || c.agent_id;
    chartData[day][name] = (chartData[day][name] || 0) + c.tokens;
  }
  const chartRows = Object.entries(chartData).map(([day, agents]) => ({ day, ...agents }));

  const cards = [
    {
      title: `Total Tokens (${uniqueDays}d)`,
      value: totalTokens.toLocaleString(),
      icon: Hash,
      description: "Across all agents",
      color: "#6366f1",
    },
    {
      title: `Estimated Cost (${uniqueDays}d)`,
      value: `$${totalCost.toFixed(2)}`,
      icon: Coins,
      description: "@ $3/1M tokens",
      color: "#10b981",
    },
    {
      title: "Top Agent",
      value: topAgent ? (agentNames[topAgent[0]] || topAgent[0]) : "—",
      icon: Bot,
      description: topAgent ? `${topAgent[1].toLocaleString()} tokens` : "—",
      color: "#f59e0b",
    },
    {
      title: "Daily Average",
      value: Math.round(totalTokens / uniqueDays).toLocaleString(),
      icon: TrendingUp,
      description: "tokens/day",
      color: "#ec4899",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
          <p className="text-sm text-muted-foreground mt-1">Token usage and cost tracking</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[100px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
        <p className="text-sm text-muted-foreground mt-1">Token usage and cost tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Token Usage — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No cost data. Run the sync script to populate data.</p>
          ) : (
            <CostChart data={chartRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
