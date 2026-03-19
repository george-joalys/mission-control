import dynamic from "next/dynamic";

export const revalidate = 0;

const PixelOffice = dynamic(
  () => import("@/components/pixel-office").then((m) => m.PixelOffice),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-muted-foreground">Chargement de l&apos;office...</div> }
);

const FactoryFloor = dynamic(
  () => import("@/components/factory-floor").then((m) => m.FactoryFloor),
  { ssr: false }
);

export default function OfficePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">The Office</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gem HQ — 3D Minecraft-style command center. 7 agents, idle animations, full orbit controls.
        </p>
      </div>
      <PixelOffice />
      <FactoryFloor />
    </div>
  );
}
