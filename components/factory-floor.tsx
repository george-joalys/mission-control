"use client";

import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   Factory Floor — Animated pixel-art workers per pipeline zone
   Each zone shows N workers = number of active tasks in that status
   Live data from /api/factory, refreshed every 5 seconds
   ═══════════════════════════════════════════════════════════════════════ */

interface FactoryStages {
  backlog: unknown[];
  spec: unknown[];
  inProgress: unknown[];
  qa: unknown[];
  review: unknown[];
  shipped: unknown[];
  archive: unknown[];
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

const ZONES = [
  { key: "spec" as const, label: "SPEC", stageKey: "spec" as keyof FactoryStages, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
  { key: "build" as const, label: "BUILD", stageKey: "inProgress" as keyof FactoryStages, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)" },
  { key: "qa" as const, label: "QA", stageKey: "qa" as keyof FactoryStages, color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
  { key: "review" as const, label: "REVIEW", stageKey: "review" as keyof FactoryStages, color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)" },
  { key: "ship" as const, label: "SHIP", stageKey: "shipped" as keyof FactoryStages, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  { key: "archive" as const, label: "ARCHIVE", stageKey: "archive" as keyof FactoryStages, color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.25)" },
] as const;

/* ─── Pixel Worker Components (16×16 scale, CSS animated) ─────────── */

function SpecWorker({ index }: { index: number }) {
  const delay = `${index * 0.2}s`;
  return (
    <div className="ff-worker" style={{ animationDelay: delay }}>
      {/* Head */}
      <div className="ff-head" style={{ background: "#22c55e" }}>
        <div className="ff-eye ff-eye-l" />
        <div className="ff-eye ff-eye-r" />
      </div>
      {/* Body */}
      <div className="ff-body" style={{ background: "#16a34a" }}>
        {/* Writing arm */}
        <div className="ff-spec-arm" style={{ animationDelay: delay }} />
        {/* Pencil */}
        <div className="ff-spec-pencil" style={{ animationDelay: delay }} />
      </div>
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#15803d" }} />
        <div className="ff-leg" style={{ background: "#15803d" }} />
      </div>
    </div>
  );
}

function BuildWorker({ index }: { index: number }) {
  const delay = `${index * 0.15}s`;
  return (
    <div className="ff-worker ff-build-bob" style={{ animationDelay: delay }}>
      {/* Hard hat */}
      <div className="ff-hardhat" />
      {/* Head */}
      <div className="ff-head" style={{ background: "#3b82f6" }}>
        <div className="ff-eye ff-eye-l" />
        <div className="ff-eye ff-eye-r" />
      </div>
      {/* Body */}
      <div className="ff-body" style={{ background: "#2563eb" }}>
        <div className="ff-belt" />
      </div>
      {/* Arms with pickaxe */}
      <div className="ff-build-arms" style={{ animationDelay: delay }}>
        <div className="ff-pickaxe" />
      </div>
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#1d4ed8" }} />
        <div className="ff-leg" style={{ background: "#1d4ed8" }} />
      </div>
    </div>
  );
}

function QaWorker({ index }: { index: number }) {
  const delay = `${index * 0.25}s`;
  return (
    <div className="ff-worker" style={{ animationDelay: delay }}>
      {/* Head */}
      <div className="ff-head" style={{ background: "#eab308" }}>
        <div className="ff-eye ff-eye-l" />
        <div className="ff-eye ff-eye-r" />
        {/* Glasses */}
        <div className="ff-glasses" />
      </div>
      {/* Body */}
      <div className="ff-body" style={{ background: "#ca8a04" }}>
        <div className="ff-clipboard" />
      </div>
      {/* Magnifying glass rotating */}
      <div className="ff-qa-loupe" style={{ animationDelay: delay }} />
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#a16207" }} />
        <div className="ff-leg" style={{ background: "#a16207" }} />
      </div>
    </div>
  );
}

function ReviewWorker({ index }: { index: number }) {
  const delay = `${index * 0.3}s`;
  return (
    <div className="ff-worker" style={{ animationDelay: delay }}>
      {/* Head */}
      <div className="ff-head" style={{ background: "#a855f7" }}>
        {/* Eyes that read left/right */}
        <div className="ff-review-eyes" style={{ animationDelay: delay }}>
          <div className="ff-review-pupil" />
          <div className="ff-review-pupil" />
        </div>
        {/* Monocle */}
        <div className="ff-monocle" />
      </div>
      {/* Body with book */}
      <div className="ff-body" style={{ background: "#9333ea" }}>
        <div className="ff-book" />
      </div>
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#7e22ce" }} />
        <div className="ff-leg" style={{ background: "#7e22ce" }} />
      </div>
    </div>
  );
}

function ShipWorker({ index }: { index: number }) {
  const delay = `${index * 0.18}s`;
  return (
    <div className="ff-worker ff-ship-bounce" style={{ animationDelay: delay }}>
      {/* Head */}
      <div className="ff-head ff-ship-head" style={{ background: "#f59e0b" }}>
        <div className="ff-eye ff-eye-l" />
        <div className="ff-eye ff-eye-r" />
        {/* Victory smile */}
        <div className="ff-smile" />
        {/* Star crown */}
        <div className="ff-star" />
      </div>
      {/* Body golden */}
      <div className="ff-body" style={{ background: "#d97706" }}>
        <div className="ff-trophy" />
      </div>
      {/* Arms raised */}
      <div className="ff-ship-arms" style={{ animationDelay: delay }} />
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#b45309" }} />
        <div className="ff-leg" style={{ background: "#b45309" }} />
      </div>
    </div>
  );
}

function ArchiveWorker({ index }: { index: number }) {
  const delay = `${index * 0.4}s`;
  return (
    <div className="ff-worker" style={{ animationDelay: delay }}>
      {/* Head */}
      <div className="ff-head" style={{ background: "#6b7280" }}>
        {/* Closed eyes */}
        <div className="ff-sleep-eye ff-sleep-eye-l" />
        <div className="ff-sleep-eye ff-sleep-eye-r" />
      </div>
      {/* Zzz */}
      <div className="ff-zzz" style={{ animationDelay: delay }}>
        <span>z</span>
        <span>Z</span>
        <span>Z</span>
      </div>
      {/* Body */}
      <div className="ff-body" style={{ background: "#4b5563" }} />
      {/* Legs */}
      <div className="ff-legs">
        <div className="ff-leg" style={{ background: "#374151" }} />
        <div className="ff-leg" style={{ background: "#374151" }} />
      </div>
    </div>
  );
}

const WORKER_COMPONENTS: Record<string, React.FC<{ index: number }>> = {
  spec: SpecWorker,
  build: BuildWorker,
  qa: QaWorker,
  review: ReviewWorker,
  ship: ShipWorker,
  archive: ArchiveWorker,
};

/* ─── Main Component ─────────────────────────────────────────────── */

export function FactoryFloor() {
  const [data, setData] = useState<FactoryData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/factory");
        if (res.ok) setData(await res.json());
      } catch {}
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
          const count = data?.stages[zone.stageKey]?.length ?? 0;
          const WorkerComponent = WORKER_COMPONENTS[zone.key];
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

              {/* Workers area */}
              <div className="flex flex-wrap items-end justify-center gap-1 p-2 min-h-[110px]">
                {count === 0 ? (
                  <span className="text-[9px] text-gray-500 font-mono italic">
                    empty
                  </span>
                ) : (
                  Array.from({ length: count }).map((_, i) => (
                    <WorkerComponent key={i} index={i} />
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
        /* ── Base worker ─────────────────────────────────── */
        .ff-worker {
          display: flex;
          flex-direction: column;
          align-items: center;
          image-rendering: pixelated;
          position: relative;
          width: 20px;
        }

        /* ── Head (16×16 pixel block) ────────────────────── */
        .ff-head {
          width: 14px;
          height: 14px;
          position: relative;
          image-rendering: pixelated;
          border-radius: 1px;
        }

        /* ── Eyes ─────────────────────────────────────────── */
        .ff-eye {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #000;
          top: 5px;
        }
        .ff-eye-l { left: 3px; }
        .ff-eye-r { right: 3px; }

        /* ── Body ─────────────────────────────────────────── */
        .ff-body {
          width: 12px;
          height: 10px;
          margin-top: 1px;
          position: relative;
          border-radius: 1px;
        }

        /* ── Legs ─────────────────────────────────────────── */
        .ff-legs {
          display: flex;
          gap: 1px;
          margin-top: 1px;
        }
        .ff-leg {
          width: 5px;
          height: 6px;
          border-radius: 0 0 1px 1px;
        }

        /* ════════════════════════════════════════════════════
           SPEC — Writing animation (right arm back & forth)
           ════════════════════════════════════════════════════ */
        .ff-spec-arm {
          position: absolute;
          width: 3px;
          height: 8px;
          background: #15803d;
          right: -4px;
          top: 1px;
          transform-origin: top center;
          animation: specWrite 0.8s ease-in-out infinite alternate;
        }
        .ff-spec-pencil {
          position: absolute;
          width: 1px;
          height: 5px;
          background: #fbbf24;
          right: -5px;
          top: 7px;
          animation: specWrite 0.8s ease-in-out infinite alternate;
        }
        @keyframes specWrite {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }

        /* ════════════════════════════════════════════════════
           BUILD — Pickaxe mining (bob up/down + arms strike)
           ════════════════════════════════════════════════════ */
        .ff-build-bob {
          animation: buildBob 0.6s ease-in-out infinite;
        }
        @keyframes buildBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .ff-hardhat {
          width: 16px;
          height: 3px;
          background: #f59e0b;
          border-radius: 1px 1px 0 0;
        }
        .ff-belt {
          position: absolute;
          width: 12px;
          height: 1px;
          background: #f59e0b;
          bottom: 3px;
        }
        .ff-build-arms {
          position: absolute;
          right: -6px;
          top: 16px;
          width: 3px;
          height: 10px;
          background: #1d4ed8;
          transform-origin: top center;
          animation: mineSwing 0.6s ease-in-out infinite;
        }
        .ff-pickaxe {
          position: absolute;
          bottom: -2px;
          left: -3px;
          width: 7px;
          height: 2px;
          background: #9ca3af;
        }
        .ff-pickaxe::after {
          content: '';
          position: absolute;
          top: -4px;
          right: 0;
          width: 2px;
          height: 5px;
          background: #78350f;
        }
        @keyframes mineSwing {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(20deg); }
        }

        /* ════════════════════════════════════════════════════
           QA — Magnifying glass rotating
           ════════════════════════════════════════════════════ */
        .ff-glasses {
          position: absolute;
          top: 4px;
          left: 2px;
          width: 10px;
          height: 4px;
          border: 1px solid #000;
          border-radius: 1px;
        }
        .ff-clipboard {
          position: absolute;
          width: 6px;
          height: 7px;
          background: #fef3c7;
          border: 1px solid #92400e;
          top: 1px;
          left: 3px;
        }
        .ff-qa-loupe {
          position: absolute;
          right: -4px;
          top: 8px;
          width: 8px;
          height: 8px;
          border: 2px solid #fff;
          border-radius: 50%;
          animation: loupeRotate 2s linear infinite;
          transform-origin: center center;
        }
        .ff-qa-loupe::after {
          content: '';
          position: absolute;
          bottom: -3px;
          right: -1px;
          width: 1px;
          height: 4px;
          background: #fff;
          transform: rotate(45deg);
        }
        @keyframes loupeRotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(15deg) scale(1.05); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-15deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }

        /* ════════════════════════════════════════════════════
           REVIEW — Eyes moving left/right (reading)
           ════════════════════════════════════════════════════ */
        .ff-review-eyes {
          position: absolute;
          top: 4px;
          left: 2px;
          width: 10px;
          height: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1px;
        }
        .ff-review-pupil {
          width: 3px;
          height: 3px;
          background: #fff;
          border-radius: 50%;
          position: relative;
        }
        .ff-review-pupil::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: #000;
          border-radius: 50%;
          top: 0;
          animation: readEyes 2s ease-in-out infinite;
        }
        @keyframes readEyes {
          0%, 100% { left: 0; }
          25% { left: 1px; }
          50% { left: 0; }
          75% { left: -1px; }
        }
        .ff-monocle {
          position: absolute;
          width: 5px;
          height: 5px;
          border: 1px solid #fbbf24;
          border-radius: 50%;
          top: 3px;
          right: 2px;
        }
        .ff-monocle::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 4px;
          background: #fbbf24;
          bottom: -4px;
          right: 1px;
        }
        .ff-book {
          position: absolute;
          width: 8px;
          height: 6px;
          background: #7c3aed;
          border: 1px solid #4c1d95;
          top: 2px;
          left: 2px;
          border-radius: 0 1px 1px 0;
        }
        .ff-book::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 6px;
          background: #4c1d95;
          left: 3px;
          top: 0;
        }

        /* ════════════════════════════════════════════════════
           SHIP — Arms raised victory, golden bounce
           ════════════════════════════════════════════════════ */
        .ff-ship-bounce {
          animation: shipBounce 0.8s ease-in-out infinite;
        }
        @keyframes shipBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        .ff-ship-head {
          box-shadow: 0 0 6px rgba(245,158,11,0.5);
        }
        .ff-smile {
          position: absolute;
          width: 6px;
          height: 2px;
          border-bottom: 2px solid #000;
          border-radius: 0 0 3px 3px;
          bottom: 2px;
          left: 4px;
        }
        .ff-star {
          position: absolute;
          top: -5px;
          left: 4px;
          font-size: 6px;
          line-height: 1;
          color: #fbbf24;
          text-shadow: 0 0 3px #fbbf24;
        }
        .ff-star::after {
          content: '★';
        }
        .ff-trophy {
          position: absolute;
          width: 4px;
          height: 5px;
          background: #fbbf24;
          top: 2px;
          left: 4px;
          border-radius: 1px;
        }
        .ff-trophy::before {
          content: '';
          position: absolute;
          width: 6px;
          height: 2px;
          background: #fbbf24;
          top: -1px;
          left: -1px;
          border-radius: 1px 1px 0 0;
        }
        .ff-ship-arms {
          position: absolute;
          top: 16px;
          left: 0;
          width: 20px;
          height: 3px;
          display: flex;
          justify-content: space-between;
        }
        .ff-ship-arms::before,
        .ff-ship-arms::after {
          content: '';
          width: 3px;
          height: 8px;
          background: #b45309;
          animation: armsUp 0.8s ease-in-out infinite;
        }
        .ff-ship-arms::before {
          transform-origin: bottom center;
        }
        .ff-ship-arms::after {
          transform-origin: bottom center;
          animation-delay: 0.1s;
        }
        @keyframes armsUp {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(-60deg); }
        }

        /* ════════════════════════════════════════════════════
           ARCHIVE — Sleeping Zzz
           ════════════════════════════════════════════════════ */
        .ff-sleep-eye {
          position: absolute;
          width: 3px;
          height: 1px;
          background: #000;
          top: 6px;
        }
        .ff-sleep-eye-l { left: 3px; }
        .ff-sleep-eye-r { right: 3px; }
        .ff-zzz {
          position: absolute;
          top: -2px;
          right: -2px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          animation: zzzFloat 2s ease-in-out infinite;
        }
        .ff-zzz span {
          font-family: monospace;
          font-weight: bold;
          color: #9ca3af;
          line-height: 1;
        }
        .ff-zzz span:nth-child(1) {
          font-size: 5px;
          opacity: 0.4;
          animation: zzzFade 2s ease-in-out infinite;
        }
        .ff-zzz span:nth-child(2) {
          font-size: 7px;
          opacity: 0.6;
          animation: zzzFade 2s ease-in-out 0.3s infinite;
        }
        .ff-zzz span:nth-child(3) {
          font-size: 9px;
          opacity: 0.9;
          animation: zzzFade 2s ease-in-out 0.6s infinite;
        }
        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes zzzFade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
