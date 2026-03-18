"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface Comm {
  id: string;
  from_agent: string;
  to_agent: string;
  message: string;
  task_description: string;
  status: string;
  duration_ms: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  queued: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const agentAvatars: Record<string, string> = {
  george: "🤖",
  "seo-agent": "✍️",
};

const agentNames: Record<string, string> = {
  george: "George",
  "seo-agent": "SEO Agent",
};

function formatDuration(ms: number | null) {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export function CommTimeline({ comms }: { comms: Comm[] }) {
  return (
    <div className="relative space-y-0">
      <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />

      {comms.map((comm) => {
        const fromAvatar = agentAvatars[comm.from_agent] || "🤖";
        const toAvatar = agentAvatars[comm.to_agent] || "🤖";
        const fromName = agentNames[comm.from_agent] || comm.from_agent;
        const toName = agentNames[comm.to_agent] || comm.to_agent;

        return (
          <div key={comm.id} className="relative flex gap-4 py-4">
            <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm ${
                  comm.status === "completed"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : comm.status === "in-progress"
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-amber-500/50 bg-amber-500/10"
                }`}
              >
                {fromAvatar}
              </div>
            </div>

            <div className="flex-1 rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{fromName}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{toName}</span>
                  <span className="text-lg">{toAvatar}</span>
                </div>
                <Badge variant="outline" className={statusColors[comm.status] || statusColors.completed}>
                  {comm.status}
                </Badge>
              </div>
              <p className="text-sm text-foreground/90 mb-2">{comm.message}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {new Date(comm.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {comm.duration_ms != null && (
                  <span>Duration: {formatDuration(comm.duration_ms)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
