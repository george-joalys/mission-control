"use client";

import { useState, useEffect } from "react";
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
import { Plus, Repeat, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface TaskRow {
  id: string;
  title: string;
  agent_id: string;
  scheduled_at: string;
  recurring: boolean;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const agentColors: Record<string, string> = {
  george: "#6366f1",
  "seo-agent": "#10b981",
};

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

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const today = formatDate(new Date());

  const agentNames: Record<string, string> = { george: "George", "seo-agent": "SEO Agent" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Weekly task schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
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
                  <input className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm" placeholder="Task title..." />
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
                    <input type="date" className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <input type="time" className="mt-1 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <Repeat className="h-3.5 w-3.5" />
                      Recurring
                    </label>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setDialogOpen(false)}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-[200px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = formatDate(day);
            const dayTasks = tasks.filter((t) => {
              const taskDate = new Date(t.scheduled_at).toISOString().split("T")[0];
              return taskDate === dateStr;
            });
            const isToday = dateStr === today;

            return (
              <Card key={dateStr} className={`min-h-[200px] ${isToday ? "ring-1 ring-indigo-500/50" : ""}`}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-indigo-500 text-white" : "text-muted-foreground"}`}>
                      {day.getDate()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayTasks.map((task) => {
                    const color = agentColors[task.agent_id] || "#6366f1";
                    const time = new Date(task.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                    return (
                      <div
                        key={task.id}
                        className="rounded-md p-2 text-xs"
                        style={{ backgroundColor: `${color}15`, borderLeft: `2px solid ${color}` }}
                      >
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <span>{time}</span>
                          {task.recurring && <Repeat className="h-2.5 w-2.5 ml-1" />}
                        </div>
                        <Badge variant="outline" className={`mt-1 text-[9px] px-1 py-0 ${statusStyles[task.status] || statusStyles.pending}`}>
                          {task.status}
                        </Badge>
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
  );
}
