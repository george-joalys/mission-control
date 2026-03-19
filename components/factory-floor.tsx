"use client";

import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   Factory Floor — Real pixel agent heads per pipeline zone
   Each zone shows the actual agent heads of active agents working tasks
   Live data from /api/factory, refreshed every 5 seconds
   ═══════════════════════════════════════════════════════════════════════ */

interface FactoryTask {
  agent_id: string;
  [key: string]: unknown;
}

interface FactoryStages {
  backlog: FactoryTask[];
  spec: FactoryTask[];
  inProgress: FactoryTask[];
  qa: FactoryTask[];
  review: FactoryTask[];
  shipped: FactoryTask[];
  archive: FactoryTask[];
}

interface FactoryData {
  stages: FactoryStages;
  stats: {
    shippedToday: number;
    inProgress: number;
    backlog: number;
    blocked: number;
    total: number;
  };
}

/* ─── Agent ID → Color Mapping ────────────────────────────────────── */

const AGENT_COLORS: Record<string, string> = {
  george: "#3b82f6",
  main: "#3b82f6",
  rex: "#f97316",
  coder: "#f97316",
  builder: "#6b7280",
  tester: "#eab308",
  reviewer: "#a855f7",
  leo: "#22c55e",
  content: "#22c55e",
  iris: "#ec4899",
  analyst: "#ec4899",
  atlas: "#8b5cf6",
  librarian: "#8b5cf6",
};

const DEFAULT_AGENT_COLOR = "#6b7280";

function getAgentColor(agentId: string): string {
  const id = agentId.toLowerCase().trim();
  if (AGENT_COLORS[id]) return AGENT_COLORS[id];
  // Check if the agent_id contains a known key (e.g. "george/main" → match "george")
  for (const [key, color] of Object.entries(AGENT_COLORS)) {
    if (id.includes(key)) return color;
  }
  return DEFAULT_AGENT_COLOR;
}

/* ─── Zone Definitions ────────────────────────────────────────────── */

const ZONES = [
  { key: "spec" as const, label: "SPEC", stageKey: "spec" as keyof FactoryStages, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
  { key: "build" as const, label: "BUILD", stageKey: "inProgress" as keyof FactoryStages, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)" },
  { key: "qa" as const, label: "QA", stageKey: "qa" as keyof FactoryStages, color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
  { key: "review" as const, label: "REVIEW", stageKey: "review" as keyof FactoryStages, color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)" },
  { key: "ship" as const, label: "SHIP", stageKey: "shipped" as keyof FactoryStages, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  { key: "archive" as const, label: "ARCHIVE", stageKey: "archive" as keyof FactoryStages, color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.25)" },
] as const;

/* ─── Agent Head Component ────────────────────────────────────────── */

function AgentHead({ agentId, index }: { agentId: string; index: number }) {
  const color = getAgentColor(agentId);
  const delay = index * 0.15;

  return (
    <div
      className="agent-head-wrapper"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Nametag above the head */}
      <div className="agent-nametag">{agentId}</div>
      {/* 40x40 pixel head */}
      <div className="agent-head" style={{ background: color }}>
        {/* Left eye — 4px black square */}
        <div className="agent-eye agent-eye-l" />
        {/* Right eye — 4px black square */}
        <div className="agent-eye agent-eye-r" />
      </div>
    </div>
  );
}

/* ─── Ghost Head (empty zone placeholder) ─────────────────────────── */

function GhostHead() {
  return (
    <div className="agent-head-wrapper ghost-head">
      <div className="agent-nametag" style={{ opacity: 0.3 }}>---</div>
      <div className="agent-head" style={{ background: "#6b7280", opacity: 0.3 }}>
        <div className="agent-eye agent-eye-l" />
        <div className="agent-eye agent-eye-r" />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

export function FactoryFloor() {
  const [data, setData] = useState<FactoryData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/factory");
        if (res.ok) setData(await res.json());
      } catch {
        /* silently retry on next interval */
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Factory Floor</h2>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ZONES.map((zone) => {
          const tasks = (data?.stages[zone.stageKey] ?? []) as FactoryTask[];
          const count = tasks.length;
          return (
            <div
              key={zone.key}
              className="relative rounded-lg border overflow-hidden transition-all"
              style={{
                borderColor: zone.border,
                background: zone.bg,
                minHeight: 160,
              }}
            >
              {/* Zone header */}
              <div
                className="flex items-center justify-between px-3 py-1.5"
                style={{ borderBottom: `1px solid ${zone.border}` }}
              >
                <span
                  className="text-[10px] font-bold tracking-widest font-mono"
                  style={{ color: zone.color }}
                >
                  {zone.label}
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: zone.border, color: zone.color }}
                >
                  {count}
                </span>
              </div>

              {/* Agent heads area */}
              <div className="flex flex-wrap items-end justify-center gap-2 p-2 min-h-[110px]">
                {count === 0 ? (
                  <GhostHead />
                ) : (
                  tasks.map((task, i) => (
                    <AgentHead
                      key={`${task.agent_id}-${i}`}
                      agentId={task.agent_id}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      {data?.stats && (
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground px-1">
          <span>Total: <strong className="text-foreground">{data.stats.total}</strong></span>
          <span>Active: <strong className="text-blue-400">{data.stats.inProgress}</strong></span>
          <span>Shipped: <strong className="text-emerald-400">{data.stats.shippedToday}</strong></span>
          <span>Blocked: <strong className="text-red-400">{data.stats.blocked}</strong></span>
        </div>
      )}

      {/* CSS Keyframes for all animations */}
      <style jsx>{`
        /* ── Agent Head Wrapper (bobbing animation) ──────── */
        .agent-head-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          image-rendering: pixelated;
          animation: agentBob 1.2s ease-in-out infinite;
        }

        @keyframes agentBob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        /* ── Ghost head — no bobbing ─────────────────────── */
        .ghost-head {
          animation: none;
        }

        /* ── Nametag above the head ──────────────────────── */
        .agent-nametag {
          font-family: monospace;
          font-size: 8px;
          font-weight: 700;
          color: #d1d5db;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1;
          margin-bottom: 3px;
          white-space: nowrap;
          max-width: 56px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        /* ── 40x40 Pixel Head ────────────────────────────── */
        .agent-head {
          width: 40px;
          height: 40px;
          position: relative;
          image-rendering: pixelated;
          border-radius: 2px;
        }

        /* ── Eyes — 4px black squares ────────────────────── */
        .agent-eye {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #000;
          top: 16px;
        }
        .agent-eye-l {
          left: 10px;
        }
        .agent-eye-r {
          right: 10px;
        }
      `}</style>
    </div>
  );
}
