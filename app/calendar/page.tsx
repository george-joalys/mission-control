"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Info,
  Shield,
  Dices,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskRow {
  id: string;
  title: string;
  agent_id: string;
  scheduled_at: string;
  recurring: boolean;
  status: string;
  created_at: string;
}

interface JitterInfo {
  baseTime: Date;
  effectiveTime: Date;
  jitterMinutes: number;
  direction: 1 | -1;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const agentColors: Record<string, string> = {
  george: "#6366f1",
  "seo-agent": "#10b981",
};

const agentNames: Record<string, string> = {
  george: "George",
  "seo-agent": "SEO Agent",
};

// ---------------------------------------------------------------------------
// Jitter / hash helpers
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // convert to 32-bit int
  }
  return hash;
}

function applyJitter(
  baseTime: Date,
  taskId: string,
  dayStr: string,
  salt: number = 0,
): JitterInfo {
  const seed = hashCode(taskId + dayStr + String(salt));
  const jitterMinutes = 15 + (Math.abs(seed) % 16); // 15-30 min
  const direction: 1 | -1 = seed % 2 === 0 ? 1 : -1;
  const effectiveTime = new Date(baseTime);
  effectiveTime.setMinutes(
    effectiveTime.getMinutes() + jitterMinutes * direction,
  );
  return { baseTime, effectiveTime, jitterMinutes, direction };
}

// ---------------------------------------------------------------------------
// Week helpers
// ---------------------------------------------------------------------------

function getWeekDays(baseDate: Date) {
  const start = new Date(baseDate);
  const day = start.getDay();
  start.setDate(start.getDate() - day + 1); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatJitter(info: JitterInfo) {
  const sign = info.direction === 1 ? "+" : "-";
  return `${sign}${info.jitterMinutes}min`;
}

// ---------------------------------------------------------------------------
// Tooltip component (lightweight, no extra dep)
// ---------------------------------------------------------------------------

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-[10px] leading-tight text-zinc-200 shadow-lg ring-1 ring-white/10">
          {text}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [jitterSalt, setJitterSalt] = useState(0);
  const [showRandomizerPanel, setShowRandomizerPanel] = useState(true);

  // ---- Fetch tasks ----
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tasks")
      .select("*")
      .order("scheduled_at")
      .then(({ data }) => {
        if (data) setTasks(data);
        setLoading(false);
      });
  }, []);

  // ---- Week calculations ----
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);
  const today = formatDate(new Date());

  // ---- Build jitter map for all recurring tasks ----
  const jitterMap = useMemo(() => {
    const map = new Map<string, JitterInfo>();
    for (const task of tasks) {
      if (!task.recurring) continue;
      const taskDate = new Date(task.scheduled_at);
      const dayStr = taskDate.toISOString().split("T")[0];
      const info = applyJitter(taskDate, task.id, dayStr, jitterSalt);
      map.set(task.id, info);
    }
    return map;
  }, [tasks, jitterSalt]);

  // ---- Re-randomize handler ----
  const reRandomize = useCallback(() => {
    setJitterSalt((s) => s + 1);
  }, []);

  // ---- Recurring tasks for the randomizer panel ----
  const recurringTasks = useMemo(
    () => tasks.filter((t) => t.recurring),
    [tasks],
  );

  // ---- Get effective time for display ----
  function getEffectiveTime(task: TaskRow): Date {
    if (!task.recurring) return new Date(task.scheduled_at);
    const info = jitterMap.get(task.id);
    return info ? info.effectiveTime : new Date(task.scheduled_at);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly task schedule &mdash; anti-detection randomizer active
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip text="Anti-pattern detection: tasks run at varying times to avoid detection patterns">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10 min-h-[44px] sm:min-h-0"
              onClick={() => setShowRandomizerPanel((v) => !v)}
            >
              <Shield className="h-3.5 w-3.5" />
              Stealth Mode
            </Button>
          </Tooltip>

          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={() => setWeekOffset(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
                    placeholder="Task title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Agent</label>
                    <select className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
                      <option>George</option>
                      <option>SEO Agent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <input
                      type="time"
                      className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <Repeat className="h-3.5 w-3.5" />
                      Recurring
                    </label>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setDialogOpen(false)}
                >
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ---- Calendar grid ---- */}
      <div className="overflow-x-auto">
      {loading ? (
        <div className="grid grid-cols-7 gap-3 min-w-[600px]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-[200px] rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3 min-w-[600px]">
          {weekDays.map((day) => {
            const dateStr = formatDate(day);
            const dayTasks = tasks.filter((t) => {
              const taskDate = new Date(t.scheduled_at)
                .toISOString()
                .split("T")[0];
              return taskDate === dateStr;
            });
            const isToday = dateStr === today;

            return (
              <Card
                key={dateStr}
                className={`min-h-[200px] ${isToday ? "ring-1 ring-indigo-500/50" : ""}`}
              >
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-indigo-500 text-white" : "text-muted-foreground"}`}
                    >
                      {day.getDate()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayTasks.map((task) => {
                    const color = agentColors[task.agent_id] || "#6366f1";
                    const isRandomized = task.recurring;
                    const effectiveTime = getEffectiveTime(task);
                    const baseTime = new Date(task.scheduled_at);
                    const jitterInfo = jitterMap.get(task.id);

                    return (
                      <div
                        key={task.id}
                        className="rounded-md p-1.5 sm:p-2 text-[10px] sm:text-xs"
                        style={{
                          backgroundColor: `${color}15`,
                          borderLeft: `2px solid ${color}`,
                        }}
                      >
                        <div className="font-medium flex items-center gap-1 min-w-0">
                          <span className="truncate">{task.title}</span>
                          {isRandomized && (
                            <Tooltip text="Anti-pattern detection: tasks run at varying times to avoid detection patterns">
                              <span className="cursor-help shrink-0">
                                <Dices className="h-3 w-3 text-amber-400" />
                              </span>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          {isRandomized && jitterInfo ? (
                            <>
                              <span className="line-through opacity-50">
                                {formatTime(baseTime)}
                              </span>
                              <span className="text-amber-400 font-semibold">
                                {formatTime(effectiveTime)}
                              </span>
                              <span className="text-[9px] text-amber-500/70 ml-0.5">
                                ({formatJitter(jitterInfo)})
                              </span>
                            </>
                          ) : (
                            <span>{formatTime(baseTime)}</span>
                          )}
                          {task.recurring && (
                            <Repeat className="h-2.5 w-2.5 ml-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 ${statusStyles[task.status] || statusStyles.pending}`}
                          >
                            {task.status}
                          </Badge>
                          {isRandomized && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30"
                            >
                              <Dices className="h-2 w-2 mr-0.5" />
                              Randomized
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>

      {/* ---- Schedule Randomizer Panel ---- */}
      {showRandomizerPanel && !loading && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Schedule Randomizer</span>
                <Tooltip text="Anti-pattern detection: tasks run at varying times to avoid detection patterns">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={reRandomize}
              >
                <Shuffle className="h-3.5 w-3.5" />
                Re-randomize
              </Button>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Recurring tasks are offset by a random jitter of +/-15-30 minutes.
              The jitter is seeded per task+date so it stays stable within a day
              but changes daily. No fixed cron patterns.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {recurringTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No recurring tasks found. Add a recurring task to enable
                anti-detection scheduling.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Task</th>
                      <th className="text-left py-2 pr-4 font-medium">Agent</th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Base Time
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Jitter
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Effective Time
                      </th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringTasks.map((task) => {
                      const jitterInfo = jitterMap.get(task.id);
                      const baseTime = new Date(task.scheduled_at);

                      return (
                        <tr
                          key={task.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <Dices className="h-3 w-3 text-amber-400 shrink-0" />
                              <span className="font-medium truncate max-w-[180px]">
                                {task.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    agentColors[task.agent_id] || "#6366f1",
                                }}
                              />
                              <span>
                                {agentNames[task.agent_id] || task.agent_id}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground line-through">
                            {formatTime(baseTime)}
                          </td>
                          <td className="py-2 pr-4">
                            {jitterInfo ? (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono"
                              >
                                {formatJitter(jitterInfo)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </td>
                          <td className="py-2 pr-4 text-amber-400 font-semibold">
                            {jitterInfo
                              ? formatTime(jitterInfo.effectiveTime)
                              : formatTime(baseTime)}
                          </td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 ${statusStyles[task.status] || statusStyles.pending}`}
                            >
                              {task.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
