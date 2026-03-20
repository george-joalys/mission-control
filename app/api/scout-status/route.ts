import { NextResponse } from "next/server";

export async function GET() {
  const fs = require("fs");
  const os = require("os");
  const home = os.homedir();

  let redditState: { lastDailyScan: number; targetHour: number | null } = {
    lastDailyScan: 0,
    targetHour: null,
  };
  let scoutState: { lastWeeklyScan: number; targetHour: number | null } = {
    lastWeeklyScan: 0,
    targetHour: null,
  };

  try {
    redditState = JSON.parse(
      fs.readFileSync(
        `${home}/.openclaw/workspace/memory/reddit-scout-state.json`,
        "utf8"
      )
    );
  } catch {}

  try {
    scoutState = JSON.parse(
      fs.readFileSync(
        `${home}/.openclaw/workspace/memory/scout-state.json`,
        "utf8"
      )
    );
  } catch {}

  return NextResponse.json({ reddit: redditState, scout: scoutState });
}
