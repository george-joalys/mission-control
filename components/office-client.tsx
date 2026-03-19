"use client";

import dynamic from "next/dynamic";

const PixelOffice = dynamic(
  () => import("@/components/pixel-office").then((m) => m.PixelOffice),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-muted-foreground text-sm">Chargement de l&apos;office 3D...</div> }
);

const FactoryFloor = dynamic(
  () => import("@/components/factory-floor").then((m) => m.FactoryFloor),
  { ssr: false }
);

export function OfficeClient() {
  return (
    <>
      <PixelOffice />
      <FactoryFloor />
    </>
  );
}
