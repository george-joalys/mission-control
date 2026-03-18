"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, Trash2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";

type LogEntry = {
  id: string;
  agent_id: string;
  action_type: string;
  message: string;
  created_at: string;
};

const typeStyles: Record<string, string> = {
  action: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  info: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dispatch: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const agentColors: Record<string, string> = {
  george: "#6366f1",
  "seo-agent": "#10b981",
};

const agentNames: Record<string, string> = {
  george: "George",
  "seo-agent": "SEO Agent",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const logRef = useRef<HTMLDivElement>(null);

  const fetchLogs = () => {
    const supabase = createClient();
    supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setLogs(data.reverse());
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-refresh every 10s unless paused
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(fetchLogs, 10_000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const agents = [...new Set(logs.map((l) => l.agent_id))];
  const types = [...new Set(logs.map((l) => l.action_type))];

  const filtered = logs.filter(
    (l) =>
      (filterAgent === "all" || l.agent_id === filterAgent) &&
      (filterType === "all" || l.action_type === filterType)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time agent activity stream</p>
        </div>
        <Card className="p-0">
          <div className="h-[600px] animate-pulse bg-muted/20 rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time agent activity stream</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="all">All Agents</option>
            {agents.map((a) => (
              <option key={a} value={a}>{agentNames[a] || a}</option>
            ))}
          </select>
          <select
            className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setPaused(!paused)}>
            {paused ? <Play className="h-3.5 w-3.5 mr-1" /> : <Pause className="h-3.5 w-3.5 mr-1" />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <div ref={logRef} className="h-[600px] overflow-y-auto font-mono text-sm p-4 space-y-1">
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-xs py-4 text-center">No logs found. Run the sync script to populate data.</p>
          )}
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                {new Date(log.created_at).toLocaleTimeString("en-US", { hour12: false })}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 shrink-0"
                style={{
                  borderColor: `${agentColors[log.agent_id] || "#6366f1"}50`,
                  color: agentColors[log.agent_id] || "#6366f1",
                }}
              >
                {agentNames[log.agent_id] || log.agent_id}
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyles[log.action_type] || typeStyles.info}`}>
                {log.action_type}
              </Badge>
              <span className="text-foreground/90">{log.message}</span>
            </div>
          ))}
          {!paused && filtered.length > 0 && (
            <div className="flex items-center gap-2 py-1.5 px-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs">Auto-refreshing every 10s...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
