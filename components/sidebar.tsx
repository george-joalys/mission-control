"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Calendar,
  Brain,
  ScrollText,
  DollarSign,
  MessageSquare,
  Building2,
  Factory,
  Sparkles,
  Eye,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/skills", label: "Skills", icon: Brain },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/comms", label: "Comms", icon: MessageSquare },
  { href: "/office", label: "Office", icon: Building2, fun: true },
  { href: "/factory", label: "🏭 Factory", icon: Factory },
  { href: "/veille", label: "👁️ Veille", icon: Eye },
  { href: "/reddit", label: "🔴 Reddit", icon: TrendingUp },
  { href: "/hugo", label: "🎯 Hugo", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Mission Control</h1>
          <p className="text-[10px] text-muted-foreground">AI Agent HQ</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.fun && (
                <span className="ml-auto text-[10px] rounded-full bg-amber-500/20 text-amber-400 px-1.5 py-0.5 font-medium">
                  FUN
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">2 agents online</span>
        </div>
      </div>
    </aside>
  );
}
