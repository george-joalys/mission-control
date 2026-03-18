"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOG_MESSAGES = [
  { agent: "George", message: "Reviewing task queue..." },
  { agent: "George", message: "Dispatching SEO brief..." },
  { agent: "George", message: "Hey, write this article!" },
  { agent: "SEO Agent", message: "On it boss! 📝" },
  { agent: "SEO Agent", message: "Researching keywords..." },
  { agent: "George", message: "Checking agent health..." },
  { agent: "SEO Agent", message: "Draft ready for review!" },
  { agent: "George", message: "Nice work! Next task..." },
  { agent: "George", message: "Optimizing prompts..." },
  { agent: "SEO Agent", message: "Analyzing competitors..." },
];

function PixelDesk({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      {/* Desk surface */}
      <div
        className="relative"
        style={{
          width,
          height: 12,
          backgroundColor: "#5c3d2e",
          borderRadius: 2,
          imageRendering: "pixelated",
          boxShadow: "0 2px 0 #4a2f22, 0 4px 0 #3d2519",
        }}
      />
      {/* Desk legs */}
      <div className="flex justify-between" style={{ width, paddingInline: 8 }}>
        <div style={{ width: 6, height: 20, backgroundColor: "#4a2f22" }} />
        <div style={{ width: 6, height: 20, backgroundColor: "#4a2f22" }} />
      </div>
    </div>
  );
}

function PixelMonitor({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* Screen */}
      <div
        style={{
          width: 32,
          height: 24,
          backgroundColor: "#1a1a2e",
          border: "3px solid #333",
          borderRadius: 2,
          imageRendering: "pixelated",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Screen glow */}
        <div
          className="animate-pulse"
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)",
            opacity: 0.3,
          }}
        />
        {/* Scan lines */}
        {[0, 4, 8, 12, 16].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </div>
      {/* Stand */}
      <div className="flex justify-center">
        <div style={{ width: 6, height: 6, backgroundColor: "#333" }} />
      </div>
      <div className="flex justify-center">
        <div style={{ width: 16, height: 3, backgroundColor: "#333", borderRadius: 1 }} />
      </div>
    </div>
  );
}

function PixelPlant({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute text-lg" style={{ left: x, top: y, imageRendering: "pixelated", filter: "contrast(1.2)" }}>
      <motion.div
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🌱
      </motion.div>
    </div>
  );
}

function SpeechBubble({ message, side }: { message: string; side: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.9 }}
      className="absolute px-3 py-1.5 rounded-lg border border-border bg-card text-xs max-w-[180px] shadow-lg"
      style={{
        bottom: "100%",
        [side === "left" ? "left" : "right"]: 0,
        marginBottom: 8,
        imageRendering: "auto",
      }}
    >
      {message}
      {/* Bubble tail */}
      <div
        className="absolute border-border"
        style={{
          bottom: -6,
          [side === "left" ? "left" : "right"]: 16,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid hsl(var(--card))",
        }}
      />
    </motion.div>
  );
}

function Agent({
  emoji,
  name,
  x,
  y,
  color,
  message,
  isWalking,
  walkTarget,
}: {
  emoji: string;
  name: string;
  x: number;
  y: number;
  color: string;
  message: string | null;
  isWalking: boolean;
  walkTarget?: { x: number; y: number };
}) {
  return (
    <motion.div
      className="absolute"
      animate={
        isWalking && walkTarget
          ? { x: [0, walkTarget.x - x, 0], y: [0, walkTarget.y - y, 0] }
          : { y: [0, -3, 0] }
      }
      transition={
        isWalking
          ? { duration: 2, ease: "easeInOut" }
          : { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
      style={{ left: x, top: y }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {message && (
            <SpeechBubble
              key={message}
              message={message}
              side={x < 300 ? "left" : "right"}
            />
          )}
        </AnimatePresence>
        {/* Agent body */}
        <div
          className="flex flex-col items-center"
          style={{ imageRendering: "pixelated" }}
        >
          <div
            className="text-2xl"
            style={{
              filter: "contrast(1.3)",
              textShadow: `0 0 10px ${color}40`,
            }}
          >
            {emoji}
          </div>
          <div
            className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5"
            style={{
              backgroundColor: `${color}30`,
              color: color,
              fontFamily: "monospace",
            }}
          >
            {name}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PixelOffice() {
  const [logIndex, setLogIndex] = useState(0);
  const [georgeMsg, setGeorgeMsg] = useState<string | null>(null);
  const [seoMsg, setSeoMsg] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        const next = (prev + 1) % LOG_MESSAGES.length;
        const log = LOG_MESSAGES[next];

        if (log.agent === "George") {
          setGeorgeMsg(log.message);
          setSeoMsg(null);
          if (log.message.includes("Hey")) {
            setIsDispatching(true);
            setTimeout(() => setIsDispatching(false), 2000);
          }
        } else {
          setSeoMsg(log.message);
          setGeorgeMsg(null);
        }

        return next;
      });
    }, 3000);

    // Set initial message
    setGeorgeMsg(LOG_MESSAGES[0].message);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full rounded-xl border border-border overflow-hidden"
      style={{
        height: 400,
        background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        imageRendering: "pixelated",
      }}
    >
      {/* Floor grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Ceiling lights */}
      {[120, 320, 520].map((x) => (
        <div key={x}>
          <div
            className="absolute"
            style={{
              left: x,
              top: 0,
              width: 40,
              height: 4,
              backgroundColor: "#fbbf24",
              opacity: 0.8,
              borderRadius: "0 0 2px 2px",
              boxShadow: "0 0 30px rgba(251,191,36,0.2)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: x - 20,
              top: 0,
              width: 80,
              height: 120,
              background: "radial-gradient(ellipse at top, rgba(251,191,36,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </div>
      ))}

      {/* Window */}
      <div
        className="absolute"
        style={{
          left: 40,
          top: 30,
          width: 80,
          height: 60,
          border: "3px solid #333",
          borderRadius: 2,
          background: "linear-gradient(180deg, #1e3a5f 0%, #2d5986 100%)",
          overflow: "hidden",
        }}
      >
        {/* Stars */}
        {[
          { x: 10, y: 10 }, { x: 35, y: 15 }, { x: 60, y: 8 },
          { x: 20, y: 35 }, { x: 50, y: 28 }, { x: 70, y: 40 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
            style={{
              left: star.x,
              top: star.y,
              width: 2,
              height: 2,
              backgroundColor: "#fff",
              borderRadius: 1,
            }}
          />
        ))}
      </div>

      {/* Wall clock */}
      <div
        className="absolute flex items-center justify-center text-xs"
        style={{
          left: 280,
          top: 25,
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "2px solid #444",
          backgroundColor: "#222",
          color: "#6366f1",
          fontFamily: "monospace",
          fontSize: 8,
        }}
      >
        <CurrentTime />
      </div>

      {/* Whiteboard */}
      <div
        className="absolute"
        style={{
          left: 370,
          top: 25,
          width: 100,
          height: 60,
          backgroundColor: "#e8e8e0",
          border: "3px solid #555",
          borderRadius: 2,
          padding: 4,
        }}
      >
        <div style={{ fontSize: 6, color: "#333", fontFamily: "monospace", lineHeight: 1.4 }}>
          <div style={{ color: "#6366f1" }}>TODO:</div>
          <div>- SEO article ✓</div>
          <div>- Keywords ✓</div>
          <div style={{ color: "#ef4444" }}>- Blog post</div>
        </div>
      </div>

      {/* George's desk area */}
      <PixelDesk x={100} y={220} width={120} />
      <PixelMonitor x={140} y={188} />

      {/* SEO Agent's desk area */}
      <PixelDesk x={400} y={220} width={100} />
      <PixelMonitor x={430} y={188} />

      {/* Plants */}
      <PixelPlant x={250} y={200} />
      <PixelPlant x={550} y={190} />
      <PixelPlant x={30} y={210} />

      {/* Coffee mug on George's desk */}
      <div
        className="absolute text-sm"
        style={{ left: 170, top: 205, fontSize: 10 }}
      >
        ☕
      </div>

      {/* Agents */}
      <Agent
        emoji="🤖"
        name="George"
        x={145}
        y={250}
        color="#6366f1"
        message={georgeMsg}
        isWalking={isDispatching}
        walkTarget={{ x: 400, y: 250 }}
      />

      <Agent
        emoji="✍️"
        name="SEO Agent"
        x={430}
        y={250}
        color="#10b981"
        message={seoMsg}
        isWalking={false}
      />

      {/* Floor rug */}
      <div
        className="absolute"
        style={{
          left: 220,
          top: 300,
          width: 200,
          height: 40,
          backgroundColor: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: 4,
        }}
      />

      {/* Status bar at bottom */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "monospace",
          fontSize: 10,
        }}
      >
        <span className="text-muted-foreground">
          🏢 Mission Control HQ — Night Shift
        </span>
        <span className="text-emerald-400">● 2 agents online</span>
      </div>
    </div>
  );
}

function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time}</span>;
}
