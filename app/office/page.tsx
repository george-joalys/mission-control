"use client";

import { PixelOffice } from "@/components/pixel-office";

export default function OfficePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Watch your agents hard at work in their cozy pixel office
        </p>
      </div>
      <PixelOffice />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="font-medium text-sm">George</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Main orchestrator. Sits at the big desk, dispatching tasks and reviewing agent work. Never sleeps.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✍️</span>
            <span className="font-medium text-sm">SEO Agent</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Content specialist. Cranks out articles, keyword research, and meta optimizations from the side desk.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏢</span>
            <span className="font-medium text-sm">The Office</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A cozy nighttime workspace. Complete with a whiteboard, plants, and a window to the stars.
          </p>
        </div>
      </div>
    </div>
  );
}
