"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostChart } from "@/components/cost-chart";
import { Coins, Hash, TrendingUp, Bot } from "lucide-react";

const costPerMillionTokens = 3;

const summaryData = {
  totalTokens: 291030 + 159750,
  georgeTokens: 291030,
  seoTokens: 159750,
};

const totalCost = (summaryData.totalTokens / 1_000_000) * costPerMillionTokens;
const georgeCost = (summaryData.georgeTokens / 1_000_000) * costPerMillionTokens;

const cards = [
  {
    title: "Total Tokens (7d)",
    value: summaryData.totalTokens.toLocaleString(),
    icon: Hash,
    description: "Across all agents",
    color: "#6366f1",
  },
  {
    title: "Estimated Cost (7d)",
    value: `$${totalCost.toFixed(2)}`,
    icon: Coins,
    description: `@ $${costPerMillionTokens}/1M tokens`,
    color: "#10b981",
  },
  {
    title: "Top Agent",
    value: "George",
    icon: Bot,
    description: `${summaryData.georgeTokens.toLocaleString()} tokens ($${georgeCost.toFixed(2)})`,
    color: "#f59e0b",
  },
  {
    title: "Daily Average",
    value: Math.round(summaryData.totalTokens / 7).toLocaleString(),
    icon: TrendingUp,
    description: "tokens/day",
    color: "#ec4899",
  },
];

export default function CostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Token usage and cost tracking
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon
                className="h-4 w-4"
                style={{ color: card.color }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Token Usage — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <CostChart />
        </CardContent>
      </Card>
    </div>
  );
}
