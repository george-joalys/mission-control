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

const AGENTS = [
  { id: "spec", label: "SPEC", name: "Spec", color: "#22c55e", bodyColor: "#16a34a", delay: "0s" },
  { id: "build", label: "BUILD", name: "Builder", color: "#3b82f6", bodyColor: "#2563eb", delay: "0.3s" },
  { id: "qa", label: "QA", name: "Tester", color: "#eab308", bodyColor: "#ca8a04", delay: "0.6s" },
  { id: "review", label: "REVIEW", name: "Reviewer", color: "#a855f7", bodyColor: "#9333ea", delay: "0.9s" },
  { id: "ship", label: "SHIP", name: "Rex", color: "#374151", bodyColor: "#1f2937", delay: "0.15s", isRex: true },
  { id: "archive", label: "ARCHIVE", name: "Shipper", color: "#06b6d4", bodyColor: "#0891b2", delay: "0.45s" },
] as const;

function PixelSpec({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.5s ease-in-out ${delay} infinite` }}>
      {/* Thinking cap */}
      <div style={{ width: 20, height: 2, borderTop: "2px solid #16a34a", background: "#15803d" }} />
      {/* Head */}
      <div style={{ width: 20, height: 20, background: "#22c55e", position: "relative", imageRendering: "pixelated" as const }}>
        <div style={{ position: "absolute", width: 3, height: 3, background: "#fff", top: 7, left: 5 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, left: 5 }} />
        <div style={{ position: "absolute", width: 3, height: 3, background: "#fff", top: 7, right: 5 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, right: 5 }} />
        <div style={{ position: "absolute", width: 6, height: 1, background: "#000", bottom: 5, left: 7 }} />
      </div>
      {/* Body */}
      <div style={{ width: 16, height: 10, background: "#16a34a", marginTop: 1 }} />
      <span style={{ fontSize: 8, color: "#22c55e", marginTop: 2, fontFamily: "monospace" }}>SPEC</span>
    </div>
  );
}

function PixelBuilder({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.5s ease-in-out ${delay} infinite` }}>
      {/* Head */}
      <div style={{ width: 20, height: 20, background: "#3b82f6", position: "relative", imageRendering: "pixelated" as const }}>
        <div style={{ position: "absolute", width: 3, height: 2, background: "#fff", top: 7, left: 5 }} />
        <div style={{ position: "absolute", width: 2, height: 1, background: "#000", top: 8, left: 5 }} />
        <div style={{ position: "absolute", width: 3, height: 2, background: "#fff", top: 7, right: 5 }} />
        <div style={{ position: "absolute", width: 2, height: 1, background: "#000", top: 8, right: 5 }} />
        <div style={{ position: "absolute", width: 4, height: 1, background: "#000", bottom: 5, left: 8 }} />
        {/* Wrench */}
        <div style={{ position: "absolute", width: 2, height: 6, background: "#eab308", top: 6, right: -3, borderRadius: 1 }} />
        <div style={{ position: "absolute", width: 4, height: 2, background: "#eab308", top: 5, right: -4 }} />
      </div>
      {/* Body with tool belt */}
      <div style={{ width: 16, height: 10, background: "#2563eb", marginTop: 1, position: "relative" }}>
        <div style={{ position: "absolute", width: 16, height: 1, background: "#eab308", top: 6 }} />
      </div>
      <span style={{ fontSize: 8, color: "#3b82f6", marginTop: 2, fontFamily: "monospace" }}>BUILDER</span>
    </div>
  );
}

function PixelTester({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.5s ease-in-out ${delay} infinite` }}>
      {/* Head */}
      <div style={{ width: 20, height: 20, background: "#eab308", position: "relative", imageRendering: "pixelated" as const }}>
        {/* Glasses frame */}
        <div style={{ position: "absolute", width: 5, height: 4, border: "1px solid #000", top: 6, left: 3, background: "transparent" }} />
        <div style={{ position: "absolute", width: 5, height: 4, border: "1px solid #000", top: 6, right: 3, background: "transparent" }} />
        <div style={{ position: "absolute", width: 2, height: 1, background: "#000", top: 7, left: 8 }} />
        {/* Eyes behind glasses */}
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, left: 4 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, right: 4 }} />
        <div style={{ position: "absolute", width: 4, height: 1, background: "#000", bottom: 5, left: 8 }} />
        {/* Magnifying glass */}
        <div style={{ position: "absolute", width: 5, height: 5, border: "1px solid #fff", borderRadius: "50%", top: 2, right: -4 }} />
        <div style={{ position: "absolute", width: 1, height: 3, background: "#fff", top: 7, right: -2, transform: "rotate(45deg)" }} />
      </div>
      {/* Body with clipboard */}
      <div style={{ width: 16, height: 10, background: "#ca8a04", marginTop: 1, position: "relative" }}>
        <div style={{ position: "absolute", width: 6, height: 7, background: "#fef3c7", top: 1, left: 5, border: "1px solid #92400e" }} />
        <div style={{ position: "absolute", width: 4, height: 1, background: "#92400e", top: 3, left: 6 }} />
        <div style={{ position: "absolute", width: 4, height: 1, background: "#92400e", top: 5, left: 6 }} />
      </div>
      <span style={{ fontSize: 8, color: "#eab308", marginTop: 2, fontFamily: "monospace" }}>TESTER</span>
    </div>
  );
}

function PixelReviewer({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.5s ease-in-out ${delay} infinite` }}>
      {/* Head */}
      <div style={{ width: 20, height: 20, background: "#a855f7", position: "relative", imageRendering: "pixelated" as const }}>
        {/* Bigger wise eyes */}
        <div style={{ position: "absolute", width: 3, height: 3, background: "#fff", top: 6, left: 4 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, left: 5 }} />
        <div style={{ position: "absolute", width: 3, height: 3, background: "#fff", top: 6, right: 4 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, right: 5 }} />
        {/* Monocle */}
        <div style={{ position: "absolute", width: 5, height: 5, border: "1px solid #fbbf24", borderRadius: "50%", top: 5, right: 2 }} />
        <div style={{ position: "absolute", width: 1, height: 4, background: "#fbbf24", top: 10, right: 4 }} />
        <div style={{ position: "absolute", width: 4, height: 1, background: "#000", bottom: 5, left: 8 }} />
      </div>
      {/* Body (robe-like with wider bottom) */}
      <div style={{ width: 16, height: 10, background: "#9333ea", marginTop: 1, position: "relative" }}>
        <div style={{ position: "absolute", width: 18, height: 4, background: "#7e22ce", bottom: 0, left: -1 }} />
      </div>
      <span style={{ fontSize: 8, color: "#a855f7", marginTop: 2, fontFamily: "monospace" }}>REVIEWER</span>
    </div>
  );
}

function PixelRex({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.8s ease-in-out ${delay} infinite` }}>
      {/* Crown / R badge */}
      <div style={{ width: 24, height: 4, background: "#f97316", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <span style={{ fontSize: 4, color: "#fff", fontWeight: "bold", fontFamily: "monospace", lineHeight: 1 }}>R</span>
      </div>
      {/* Head (bigger) */}
      <div style={{ width: 24, height: 24, background: "#374151", position: "relative", imageRendering: "pixelated" as const }}>
        {/* Glowing orange eyes */}
        <div style={{ position: "absolute", width: 3, height: 3, background: "#f97316", top: 8, left: 5, boxShadow: "0 0 4px #f97316", animation: "glow 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 3, height: 3, background: "#f97316", top: 8, right: 5, boxShadow: "0 0 4px #f97316", animation: "glow 2s ease-in-out infinite" }} />
        {/* Stern mouth */}
        <div style={{ position: "absolute", width: 8, height: 1, background: "#9ca3af", bottom: 6, left: 8 }} />
        <div style={{ position: "absolute", width: 1, height: 2, background: "#9ca3af", bottom: 6, left: 8 }} />
        <div style={{ position: "absolute", width: 1, height: 2, background: "#9ca3af", bottom: 6, right: 8 }} />
      </div>
      {/* Body with orange stripe */}
      <div style={{ width: 20, height: 12, background: "#1f2937", marginTop: 1, position: "relative" }}>
        <div style={{ position: "absolute", width: 20, height: 2, background: "#f97316", top: 4 }} />
      </div>
      <span style={{ fontSize: 8, color: "#f97316", marginTop: 2, fontFamily: "monospace", fontWeight: "bold" }}>REX</span>
    </div>
  );
}

function PixelShipper({ delay }: { delay: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `bob 1.5s ease-in-out ${delay} infinite` }}>
      {/* Head */}
      <div style={{ width: 20, height: 20, background: "#06b6d4", position: "relative", imageRendering: "pixelated" as const }}>
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, left: 5 }} />
        <div style={{ position: "absolute", width: 2, height: 2, background: "#000", top: 7, right: 5 }} />
        {/* Happy mouth (smile) */}
        <div style={{ position: "absolute", width: 6, height: 1, background: "#000", bottom: 5, left: 7 }} />
        <div style={{ position: "absolute", width: 1, height: 1, background: "#000", bottom: 6, left: 7 }} />
        <div style={{ position: "absolute", width: 1, height: 1, background: "#000", bottom: 6, right: 7 }} />
      </div>
      {/* Body with package */}
      <div style={{ width: 16, height: 10, background: "#0891b2", marginTop: 1, position: "relative" }}>
        {/* Tiny package */}
        <div style={{ position: "absolute", width: 6, height: 5, background: "#a16207", top: 2, left: 5, border: "1px solid #78350f" }} />
        <div style={{ position: "absolute", width: 1, height: 5, background: "#78350f", top: 2, left: 8 }} />
        <div style={{ position: "absolute", width: 6, height: 1, background: "#78350f", top: 4, left: 5 }} />
      </div>
      <span style={{ fontSize: 8, color: "#06b6d4", marginTop: 2, fontFamily: "monospace" }}>SHIPPER</span>
    </div>
  );
}

const PIXEL_CHARACTERS: Record<string, React.FC<{ delay: string }>> = {
  spec: PixelSpec,
  build: PixelBuilder,
  qa: PixelTester,
  review: PixelReviewer,
  ship: PixelRex,
  archive: PixelShipper,
};

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
          {AGENTS.map((agent) => {
            const Character = PIXEL_CHARACTERS[agent.id];
            return (
              <div
                key={agent.id}
                className="border border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center gap-3 min-h-[120px] relative"
              >
                <span className="text-[10px] text-gray-500 tracking-widest">{agent.label}</span>
                {Character && <Character delay={agent.delay} />}
              </div>
            );
          })}
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
                      <span className="font-bold">{typeof task === 'object' && task !== null ? (task as {id?: string}).id ?? '—' : String(task)}</span>
                      {typeof task === 'object' && task !== null && (task as {title?: string}).title && (
                        <span className="ml-1 text-gray-500">{(task as {title?: string}).title}</span>
                      )}
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes walk {
          0% { transform: translateX(0) scaleX(1); }
          25% { transform: translateX(5px) scaleX(-1); }
          50% { transform: translateX(0) scaleX(1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 4px #f97316; }
          50% { box-shadow: 0 0 8px #f97316, 0 0 12px #f97316; }
        }
      `}</style>
    </div>
  );
}
