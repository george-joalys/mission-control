import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import os from "os";

export async function POST() {
  const scriptDir = path.join(
    os.homedir(),
    ".openclaw/workspace/agents/leads/skills/prospect-scraper/scripts"
  );

  // Lance scrape-prospects.js puis generate-dm.js en background
  const child = spawn(
    "node",
    [path.join(scriptDir, "scrape-prospects.js")],
    {
      detached: true,
      stdio: "ignore",
      env: { ...process.env },
    }
  );
  child.unref();

  // Enchaîne generate-dm.js via shell pour ne pas bloquer
  const child2 = spawn(
    "bash",
    ["-c", `sleep 30 && node ${path.join(scriptDir, "generate-dm.js")}`],
    {
      detached: true,
      stdio: "ignore",
      env: { ...process.env },
    }
  );
  child2.unref();

  return NextResponse.json({ ok: true, message: "Scraping launched in background" });
}
