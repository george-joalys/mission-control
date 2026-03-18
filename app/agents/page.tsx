"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "@/components/agent-card";
import { createClient } from "@/lib/supabase";

interface AgentRow {
  id: string;
  name: string;
  role: string;
  model: string;
  status: string;
  last_action: string;
  session_tokens: number;
  updated_at: string;
}

const agentMeta: Record<string, { avatar: string; color: string; type: string }> = {
  george: { avatar: "🤖", color: "#6366f1", type: "main" },
  "seo-agent": { avatar: "✍️", color: "#10b981", type: "sub" },
};

const fallback = { avatar: "🤖", color: "#8b5cf6", type: "sub" };

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("agents")
      .select("*")
      .order("status")
      .then(({ data }) => {
        if (data) setAgents(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your AI agents in real-time</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-[260px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your AI agents in real-time</p>
        </div>
        <p className="text-muted-foreground text-sm">No agents found. Run the sync script to populate data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your AI agents in real-time</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => {
          const meta = agentMeta[agent.id] || fallback;
          return (
            <AgentCard
              key={agent.id}
              agent={{
                id: agent.id,
                name: agent.name || agent.id,
                role: agent.role || "Agent",
                status: (agent.status as "active" | "idle" | "error") || "idle",
                model: agent.model || "unknown",
                type: meta.type,
                lastAction: agent.last_action || "—",
                tokenCount: agent.session_tokens || 0,
                avatar: meta.avatar,
                color: meta.color,
                uptime: "—",
                tasksCompleted: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
