import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST() {
  const scriptPath =
    `${process.env.HOME || "/Users/joalys"}/.openclaw/workspace/skills/reddit-scout/scripts/reddit-run.js`;

  // Launch the script in background (fire and forget)
  const child = spawn("node", [scriptPath], {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      SUPABASE_SERVICE_KEY:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieWtlc2twd2x3ZXlxZ3BhYXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwMjY2OCwiZXhwIjoyMDg5Mzc4NjY4fQ.Ubw7x4e3-3KMD9_RuECMCYndliP56p3P7hBv_2ltSxQ",
    },
  });

  child.unref();

  return NextResponse.json({ ok: true, message: "Scan lancé en arrière-plan" });
}
