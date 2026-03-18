import { PixelOffice } from "@/components/pixel-office";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OfficePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gem HQ — Joalys Paris Operations Center, deep in the Sri Lankan jungle
        </p>
      </div>
      <PixelOffice />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="font-medium text-sm">George — Gem Explorer</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Main orchestrator. Grades gemstones, manages B2B inquiries, and dispatches tasks from his stone desk. Never sleeps.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✍️</span>
            <span className="font-medium text-sm">SEO Agent — Scroll Keeper</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Content specialist. Writes gem guides, researches keywords, and publishes articles from ancient scrolls and a quill pen.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💎</span>
            <span className="font-medium text-sm">Gem HQ</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A stone temple in the Sri Lankan jungle. Torches flicker, gems glow, and treasure chests hold Ceylon&apos;s finest.
          </p>
        </div>
      </div>
    </div>
  );
}
