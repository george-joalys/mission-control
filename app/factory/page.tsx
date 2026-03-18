"use client";

import { useEffect, useState } from "react";

interface FactoryData {
  stages: {
    backlog: string[];
    spec: string[];
    inProgress: string[];
    qa: string[];
    review: string[];
    shipped: string[];
    archive: string[];
  };
  stats: {
    shippedToday: number;
    inProgress: number;
    backlog: number;
    blocked: number;
    avgPipelineTime: string;
  };
}

const ROOMS = [
  { id: "spec", label: "SPEC", agent: "Spec", color: "#22c55e", emoji: "🟢" },
  { id: "build", label: "BUILD", agent: "Builder", color: "#3b82f6", emoji: "🔵" },
  { id: "qa", label: "QA", agent: "Tester", color: "#eab308", emoji: "🟡" },
  { id: "review", label: "REVIEW", agent: "Reviewer", color: "#a855f7", emoji: "🟣" },
  { id: "ship", label: "SHIP", agent: "Rex", color: "#1a1a2e", emoji: "⬛" },
  { id: "archive", label: "ARCHIVE", agent: "Rex", color: "#1a1a2e", emoji: "⬛" },
];

const COLUMNS = ["BACKLOG", "SPEC", "BUILD", "QA", "REVIEW", "SHIP", "ARCHIVE"];
const COLUMN_KEYS = ["backlog", "spec", "inProgress", "qa", "review", "shipped", "archive"] as const;

export default function FactoryPage() {
  const [data, setData] = useState<FactoryData | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/factory");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {}
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen p-6 font-mono text-white uppercase"
      style={{
        backgroundColor: "#0d1117",
        backgroundImage: "radial-gradient(circle, #21262d 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-widest">Rex Dev Factory</h1>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 tracking-wider">● Live Sync</span>
        </div>
      </div>

      {/* Factory Floor */}
      <div className="mb-8">
        <h2 className="text-xs text-gray-500 tracking-widest mb-4">Factory Floor</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="border border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center gap-3 min-h-[120px] relative"
            >
              <span className="text-[10px] text-gray-500 tracking-widest">{room.label}</span>
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center text-lg"
                style={{
                  animation: "bob 2s ease-in-out infinite",
                }}
              >
                {room.emoji}
              </div>
              <span className="text-[9px] text-gray-600">{room.agent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mb-8">
        <h2 className="text-xs text-gray-500 tracking-widest mb-4">Pipeline</h2>
        <div className="grid grid-cols-7 gap-2">
          {COLUMNS.map((col, i) => {
            const key = COLUMN_KEYS[i];
            const tasks = data?.stages[key] ?? [];
            return (
              <div key={col} className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-900/80 px-3 py-2 text-center">
                  <span className="text-[10px] tracking-widest text-gray-400">{col}</span>
                  <span className="ml-2 text-[10px] text-gray-600">{tasks.length}</span>
                </div>
                <div className="p-2 min-h-[100px] space-y-1">
                  {tasks.map((task, j) => (
                    <div
                      key={j}
                      className="bg-gray-800/60 rounded px-2 py-1 text-[9px] text-gray-300 truncate"
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supervision Panel */}
      <div className="mb-8">
        <h2 className="text-xs text-gray-500 tracking-widest mb-4">Supervision</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "ACK Timeout", value: "30 min", desc: "Re-ping si pas d'ACK", color: "#22c55e", icon: "🟢" },
            { label: "Stall Detection", value: "2h", desc: "STALLED + re-ping", color: "#eab308", icon: "🟡" },
            { label: "Escalation", value: "4h", desc: "Telegram alert", color: "#ef4444", icon: "🔴" },
            { label: "Max Retries", value: "2", desc: "[RETRY-1] / [RETRY-2]", color: "#a855f7", icon: "🟣" },
          ].map((rule) => (
            <div
              key={rule.label}
              className="border border-gray-800 rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span>{rule.icon}</span>
                <span className="text-[10px] text-gray-400 tracking-widest">{rule.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: rule.color }}>{rule.value}</div>
              <span className="text-[9px] text-gray-600">{rule.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border border-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-4 text-center">
          {[
            { label: "Shipped Today", value: data?.stats.shippedToday ?? 0 },
            { label: "In Progress", value: data?.stats.inProgress ?? 0 },
            { label: "Backlog", value: data?.stats.backlog ?? 0 },
            { label: "Blocked", value: data?.stats.blocked ?? 0 },
            { label: "Avg Pipeline Time", value: data?.stats.avgPipelineTime ?? "—" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[9px] text-gray-500 tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
