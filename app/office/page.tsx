import { OfficeClient } from "@/components/office-client";

export const revalidate = 0;

export default function OfficePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gem HQ — 3D Minecraft-style command center. 7 agents, idle animations, full orbit controls.
        </p>
      </div>
      <OfficeClient />
    </div>
  );
}
