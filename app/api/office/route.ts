import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from("pipeline_tasks")
    .select("agent_id, title, status")
    .in("status", ["IN_PROGRESS", "SPEC", "QA", "DISPATCHED"]);

  // Return first active task per agent
  const activeAgents: Record<string, string> = {};
  for (const task of data || []) {
    if (!activeAgents[task.agent_id]) {
      activeAgents[task.agent_id] = task.title;
    }
  }

  return NextResponse.json({ activeAgents });
}
