"use client";

import { useState } from "react";
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
import tasksData from "@/data/tasks.json";

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
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

  const baseDate = new Date("2026-03-18");
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const today = "2026-03-18";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly task schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
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

      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dateStr = formatDate(day);
          const dayTasks = tasksData.filter((t) => t.date === dateStr);
          const isToday = dateStr === today;

          return (
            <Card
              key={dateStr}
              className={`min-h-[200px] ${
                isToday ? "ring-1 ring-indigo-500/50" : ""
              }`}
            >
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-indigo-500 text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-md p-2 text-xs"
                    style={{
                      backgroundColor: `${task.color}15`,
                      borderLeft: `2px solid ${task.color}`,
                    }}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <span>{task.time}</span>
                      {task.recurring && (
                        <Repeat className="h-2.5 w-2.5 ml-1" />
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[9px] px-1 py-0 ${
                        statusStyles[task.status]
                      }`}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
