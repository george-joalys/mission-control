import { CommTimeline } from "@/components/comm-timeline";

export default function CommsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Agent-to-agent message timeline
        </p>
      </div>
      <CommTimeline />
    </div>
  );
}
