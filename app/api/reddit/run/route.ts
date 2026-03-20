export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST() {
  // Use execFile via shell to avoid Turbopack static analysis issues with dynamic paths
  const { exec } = require("child_process") as typeof import("child_process");

  const cmd = [
    `SUPABASE_SERVICE_KEY=${process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieWtlc2twd2x3ZXlxZ3BhYXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwMjY2OCwiZXhwIjoyMDg5Mzc4NjY4fQ.Ubw7x4e3-3KMD9_RuECMCYndliP56p3P7hBv_2ltSxQ"}`,
    `node $HOME/.openclaw/workspace/skills/reddit-scout/scripts/reddit-run.js`,
    `>> $HOME/.openclaw/workspace/logs/reddit-scout.log 2>&1 &`,
  ].join(" ");

  exec(cmd, { shell: "/bin/zsh" });

  return NextResponse.json({ ok: true, message: "Scan lancé en arrière-plan" });
}
