"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostChart } from "@/components/cost-chart";
import { Coins, Hash, TrendingUp, Bot, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface CostRow {
  id: string;
  agent_id: string;
  date: string;
  tokens: number;
  cost_usd: number;
}

const agentNames: Record<string, string> = {
  george: "George",
  rex: "Rex",
  leo: "Leo",
  iris: "Iris",
  atlas: "Atlas",
  scout: "Scout",
  hugo: "Hugo",
  "seo-agent": "SEO Agent",
};

export default function CostsPage() {
  const [costs, setCosts] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCosts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("costs")
      .select("*")
      .order("date", { ascending: true });
    if (data) {
      setCosts(data);
      setLastSynced(new Date());
    }
    setLoading(false);
  }, []);

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCosts();
    setRefreshing(false);
  }, [fetchCosts]);

  // Initial fetch + Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    fetchCosts();

    // Realtime subscription
    const channel = supabase
      .channel("costs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "costs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCosts((prev) =>
              [...prev, payload.new as CostRow].sort((a, b) =>
                a.date.localeCompare(b.date)
              )
            );
          } else if (payload.eventType === "UPDATE") {
            setCosts((prev) =>
              prev.map((c) =>
                c.id === (payload.new as CostRow).id
                  ? (payload.new as CostRow)
                  : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCosts((prev) =>
              prev.filter((c) => c.id !== (payload.old as CostRow).id)
            );
          }
          setLastSynced(new Date());
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCosts]);

  // Update "seconds ago" counter
  useEffect(() => {
    if (!lastSynced) return;
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastSynced.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  const totalTokens = costs.reduce((sum, c) => sum + (c.tokens || 0), 0);
  const totalCost = costs.reduce(
    (sum, c) => sum + Number(c.cost_usd || 0),
    0
  );

  // Find top agent
  const agentTokens: Record<string, number> = {};
  for (const c of costs) {
    agentTokens[c.agent_id] = (agentTokens[c.agent_id] || 0) + (c.tokens || 0);
  }
  const topAgent = Object.entries(agentTokens).sort((a, b) => b[1] - a[1])[0];
  const uniqueDays = new Set(costs.map((c) => c.date)).size || 1;

  // Build chart data grouped by date
  const chartData: Record<string, Record<string, number>> = {};
  for (const c of costs) {
    const day = new Date(c.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!chartData[day]) chartData[day] = {};
    const name = agentNames[c.agent_id] || c.agent_id;
    chartData[day][name] = (chartData[day][name] || 0) + c.tokens;
  }
  const chartRows = Object.entries(chartData).map(([day, agents]) => ({
    day,
    ...agents,
  }));

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
      value: topAgent
        ? agentNames[topAgent[0]] || topAgent[0]
        : "\u2014",
      icon: Bot,
      description: topAgent ? `${topAgent[1].toLocaleString()} tokens` : "\u2014",
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
          <p className="text-sm text-muted-foreground mt-1">
            Token usage and cost tracking
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[100px] rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
        <div className="h-[400px] rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  const formatSecondsAgo = (s: number): string => {
    if (s < 5) return "just now";
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with LIVE badge and refresh */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time data from Supabase
          </p>
          {lastSynced && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Last synced: {formatSecondsAgo(secondsAgo)}
            </p>
          )}
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stat cards with animation */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnimatePresence mode="wait">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
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
                  <motion.div
                    key={card.value}
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold"
                  >
                    {card.value}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Token Usage &mdash; Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No cost data. Run the sync script to populate data.
            </p>
          ) : (
            <motion.div
              key={costs.length}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CostChart data={chartRows} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
