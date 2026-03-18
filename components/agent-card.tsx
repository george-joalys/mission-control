"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, Zap, Hash } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error";
  model: string;
  type: string;
  lastAction: string;
  tokenCount: number;
  avatar: string;
  color: string;
  uptime: string;
  tasksCompleted: number;
}

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  idle: { label: "Idle", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  error: { label: "Error", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function AgentCard({ agent }: { agent: Agent }) {
  const status = statusConfig[agent.status];

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-white/20">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: agent.color }}
      />
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: `${agent.color}20` }}
          >
            {agent.avatar}
          </div>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <Badge variant="outline" className={status.className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current inline-block" />
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Last Action</p>
          <p className="text-sm">{agent.lastAction}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{agent.model}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{agent.uptime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {agent.tokenCount.toLocaleString()} tokens
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {agent.tasksCompleted} tasks
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Type
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {agent.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
