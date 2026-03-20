"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Factory, Eye, MessageSquare, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/factory", label: "Factory", icon: Factory },
  { href: "/veille", label: "Veille", icon: Eye },
  { href: "/comms", label: "Comms", icon: MessageSquare },
  { href: "/costs", label: "Costs", icon: DollarSign },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
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
    </nav>
  );
}
