"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Factory, Eye, MessageSquare, DollarSign, MoreHorizontal, Calendar, Brain, ScrollText, Building2, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const bottomNavItems = [
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/factory", label: "Factory", icon: Factory },
  { href: "/veille", label: "Veille", icon: Eye },
  { href: "/comms", label: "Comms", icon: MessageSquare },
  { href: "/costs", label: "Costs", icon: DollarSign },
];

const moreItems = [
  { href: "/calendar", label: "Calendar", icon: Calendar, emoji: "📅" },
  { href: "/skills", label: "Skills", icon: Brain, emoji: "🧠" },
  { href: "/logs", label: "Logs", icon: ScrollText, emoji: "📜" },
  { href: "/office", label: "Office", icon: Building2, emoji: "🏢" },
  { href: "/reddit", label: "Reddit", icon: TrendingUp, emoji: "🔴" },
  { href: "/hugo", label: "Hugo", icon: Users, emoji: "🎯" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleMoreItemClick = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
                isActive
                  ? "text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]")} />
              <span className="text-[10px] leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-indigo-400" />
              )}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
            drawerOpen
              ? "text-indigo-400"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] leading-tight">More</span>
        </button>
      </nav>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Slide-up drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70] bg-card border-t border-border rounded-t-2xl transition-transform duration-300 ease-out md:hidden",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Items */}
        <div className="pb-4">
          {moreItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleMoreItemClick(item.href)}
              className="flex w-full items-center gap-4 px-6 py-4 text-base text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
