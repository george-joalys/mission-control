import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const PIPELINE_DIR = "/Users/joalys/.openclaw/workspace/code-pipeline";

const FILES = {
  backlog: "backlog.md",
  spec: "spec.md",
  inProgress: "in-progress.md",
  qa: "qa.md",
  review: "review.md",
  shipped: "shipped.md",
  archive: "archive.md",
};

function parseTasks(content: string): string[] {
  const lines = content.split("\n");
  const tasks: string[] = [];
  for (const line of lines) {
    const match = line.match(/^###\s+(.+)/);
    if (match) {
      tasks.push(match[1].trim());
    }
  }
  return tasks;
}

export async function GET() {
  const stages: Record<string, string[]> = {};

  for (const [key, file] of Object.entries(FILES)) {
    try {
      const content = await readFile(join(PIPELINE_DIR, file), "utf-8");
      stages[key] = parseTasks(content);
    } catch {
      stages[key] = [];
    }
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const shippedToday = stages.shipped.filter((t) => t.includes(today)).length;

  const stats = {
    shippedToday,
    inProgress: stages.inProgress.length,
    backlog: stages.backlog.length,
    blocked: 0,
    avgPipelineTime: "—",
  };

  return NextResponse.json({ stages, stats });
}
