"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

interface AgentNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  parent: string | null;
  status: "active" | "idle" | "error";
  lastAction: string;
  model: string;
}

/* ------------------------------------------------------------------ */
/*  Static hierarchy (fallback)                                        */
/* ------------------------------------------------------------------ */

const agentHierarchy: Omit<AgentNode, "status" | "lastAction" | "model">[] = [
  { id: "george", name: "George", role: "CEO / Orchestrateur Principal", avatar: "\u{1F451}", color: "#6366f1", parent: null },
  { id: "rex", name: "Rex", role: "Software Factory Orchestrator", avatar: "\u{1F996}", color: "#10b981", parent: "george" },
  { id: "leo", name: "L\u00e9o", role: "Content Strategist", avatar: "\u{1F981}", color: "#f59e0b", parent: "rex" },
  { id: "iris", name: "Iris", role: "SEO Specialist", avatar: "\u{1F33A}", color: "#ec4899", parent: "leo" },
  { id: "atlas", name: "Atlas", role: "Data Analyst", avatar: "\u{1F5FA}\uFE0F", color: "#8b5cf6", parent: "iris" },
  { id: "scout", name: "Scout", role: "Research Agent", avatar: "\u{1F52D}", color: "#06b6d4", parent: "atlas" },
  { id: "hugo", name: "Hugo", role: "Quality Assurance", avatar: "\u{1F6E1}\uFE0F", color: "#ef4444", parent: "scout" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mergeWithDb(dbAgents: AgentRow[]): AgentNode[] {
  const dbMap = new Map(dbAgents.map((a) => [a.id, a]));

  return agentHierarchy.map((h) => {
    const db = dbMap.get(h.id);
    return {
      ...h,
      name: db?.name ?? h.name,
      role: db?.role ?? h.role,
      status: ((db?.status as "active" | "idle" | "error") ?? "idle"),
      lastAction: db?.last_action ?? "\u2014",
      model: db?.model ?? "claude-sonnet-4-20250514",
    };
  });
}

/* ------------------------------------------------------------------ */
/*  OrgNode component                                                  */
/* ------------------------------------------------------------------ */

function OrgNode({
  agent,
  depth,
  isLast,
}: {
  agent: AgentNode;
  depth: number;
  isLast: boolean;
}) {
  const statusCfg = {
    active: {
      label: "Active",
      dot: "bg-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pulse: true,
    },
    idle: {
      label: "Idle",
      dot: "bg-amber-400",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      pulse: false,
    },
    error: {
      label: "Error",
      dot: "bg-red-400",
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
      pulse: false,
    },
  };

  const s = statusCfg[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.1, duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      {/* Connector lines */}
      {depth > 0 && (
        <>
          {/* Vertical line from parent */}
          <div
            className="absolute top-0 border-l-2 border-border"
            style={{ left: -20, height: "50%" }}
          />
          {/* Horizontal line to this node */}
          <div
            className="absolute border-t-2 border-border"
            style={{ left: -20, top: "50%", width: 20 }}
          />
          {/* Vertical continuation line (if not last) */}
          {!isLast && (
            <div
              className="absolute border-l-2 border-border"
              style={{ left: -20, top: "50%", bottom: 0 }}
            />
          )}
        </>
      )}

      <Card
        className="group relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-white/20 hover:scale-[1.01] cursor-default"
        style={{ borderColor: `${agent.color}30` }}
      >
        {/* Top accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ backgroundColor: agent.color }}
        />

        <CardContent className="flex items-center gap-4 pt-5 pb-4">
          {/* Avatar */}
          <div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${agent.color}20`, boxShadow: `0 0 20px ${agent.color}15` }}
          >
            {agent.avatar}
            {/* Status dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card ring-2 ring-card">
              <span
                className={`h-2 w-2 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`}
              />
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
              <Badge variant="outline" className={`${s.badge} text-[10px] h-4`}>
                {s.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{agent.role}</p>
          </div>

          {/* Depth indicator */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: agent.color }}
            >
              L{depth}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {agent.model.split("-").slice(0, 2).join("-")}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("agents")
      .select("*")
      .then(({ data }) => {
        const dbAgents = (data ?? []) as AgentRow[];
        setAgents(mergeWithDb(dbAgents));
        setLoading(false);
      });
  }, []);

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cha&icirc;ne de commande &mdash; Organigramme hi&eacute;rarchique
          </p>
        </div>
        <div className="space-y-4 pl-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl border border-border bg-card animate-pulse"
              style={{ marginLeft: i * 24 }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---- Build ordered list from hierarchy ---- */
  const ordered: { agent: AgentNode; depth: number; isLast: boolean }[] = [];

  function walk(parentId: string | null, depth: number) {
    const children = agents.filter((a) => a.parent === parentId);
    children.forEach((child, idx) => {
      ordered.push({
        agent: child,
        depth,
        isLast: idx === children.length - 1,
      });
      walk(child.id, depth + 1);
    });
  }
  walk(null, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cha&icirc;ne de commande &mdash; Organigramme hi&eacute;rarchique
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Idle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Error
        </span>
        <span className="ml-auto text-[10px] font-mono">
          {agents.length} agents &middot; {agents.filter((a) => a.status === "active").length} active
        </span>
      </div>

      {/* Org chart tree */}
      <div className="relative space-y-3">
        {ordered.map(({ agent, depth, isLast }) => (
          <div
            key={agent.id}
            className="relative"
            style={{ marginLeft: depth * 40 }}
          >
            {/* Long vertical line connecting siblings */}
            {depth > 0 && (
              <div
                className="absolute border-l-2 border-border"
                style={{
                  left: -20,
                  top: -12,
                  height: "calc(50% + 12px)",
                }}
              />
            )}
            {/* Horizontal connector */}
            {depth > 0 && (
              <div
                className="absolute border-t-2 border-border"
                style={{
                  left: -20,
                  top: "50%",
                  width: 20,
                }}
              />
            )}

            <OrgNode agent={agent} depth={depth} isLast={isLast} />
          </div>
        ))}
      </div>
    </div>
  );
}
