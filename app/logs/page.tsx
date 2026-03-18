"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, Trash2 } from "lucide-react";

type LogEntry = {
  id: number;
  timestamp: string;
  agent: string;
  type: "action" | "info" | "warning" | "success" | "dispatch";
  message: string;
};

const agents = ["George", "SEO Agent"];
const types: LogEntry["type"][] = ["action", "info", "warning", "success", "dispatch"];

const mockMessages: Record<string, string[]> = {
  George: [
    "Reviewing task queue for pending items",
    "Dispatching SEO brief to sub-agent",
    "System health check: all systems nominal",
    "Optimizing prompt templates for efficiency",
    "Analyzing task completion metrics",
    "Scheduling backup of agent configurations",
    "Evaluating agent performance scores",
    "Updating routing rules for task dispatch",
  ],
  "SEO Agent": [
    "Generating keyword report for 'ai tools 2026'",
    "Writing article draft: 2,400 words complete",
    "Analyzing competitor backlink profiles",
    "Optimizing meta descriptions batch #12",
    "Content audit: 34 pages reviewed",
    "Updating sitemap with new articles",
    "Running readability analysis on drafts",
    "Fetching search volume data from API",
  ],
};

const typeStyles: Record<string, string> = {
  action: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  info: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dispatch: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const agentColors: Record<string, string> = {
  George: "#6366f1",
  "SEO Agent": "#10b981",
};

function generateLog(id: number): LogEntry {
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const messages = mockMessages[agent];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    id,
    timestamp: new Date().toISOString(),
    agent,
    type,
    message: messages[Math.floor(Math.random() * messages.length)],
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    // Initial batch
    const initial = Array.from({ length: 5 }, () => {
      idRef.current++;
      return generateLog(idRef.current);
    });
    setLogs(initial);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      idRef.current++;
      setLogs((prev) => [...prev.slice(-200), generateLog(idRef.current)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const filtered = logs.filter(
    (l) =>
      (filterAgent === "all" || l.agent === filterAgent) &&
      (filterType === "all" || l.type === filterType)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time agent activity stream
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="all">All Agents</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Pause className="h-3.5 w-3.5 mr-1" />
            )}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLogs([])}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <div
          ref={logRef}
          className="h-[600px] overflow-y-auto font-mono text-sm p-4 space-y-1"
        >
          {filtered.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-muted/30 transition-colors"
            >
              <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                })}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 shrink-0"
                style={{
                  borderColor: `${agentColors[log.agent]}50`,
                  color: agentColors[log.agent],
                }}
              >
                {log.agent}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyles[log.type]}`}
              >
                {log.type}
              </Badge>
              <span className="text-foreground/90">{log.message}</span>
            </div>
          ))}

          {!paused && (
            <div className="flex items-center gap-2 py-1.5 px-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs">Streaming...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
