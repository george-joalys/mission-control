"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import commsData from "@/data/comms.json";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  queued: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export function CommTimeline() {
  return (
    <div className="relative space-y-0">
      {/* Vertical connector line */}
      <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />

      {commsData.map((comm, i) => (
        <div key={comm.id} className="relative flex gap-4 py-4">
          {/* Timeline dot */}
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
              {comm.fromAvatar}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{comm.from}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{comm.to}</span>
                <span className="text-lg">{comm.toAvatar}</span>
              </div>
              <Badge variant="outline" className={statusColors[comm.status]}>
                {comm.status}
              </Badge>
            </div>
            <p className="text-sm text-foreground/90 mb-2">{comm.task}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {new Date(comm.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {comm.duration && <span>Duration: {comm.duration}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
