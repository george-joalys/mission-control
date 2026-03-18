import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: tasks, error } = await supabase
      .from("pipeline_tasks")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) throw error

    const stages: Record<string, typeof tasks> = {
      backlog: [],
      spec: [],
      inProgress: [],
      qa: [],
      review: [],
      shipped: [],
      archive: [],
    }

    const statusMap: Record<string, string> = {
      BACKLOG: "backlog",
      SPEC: "spec",
      DISPATCHED: "inProgress",
      ACK_RECEIVED: "inProgress",
      IN_PROGRESS: "inProgress",
      STALLED: "inProgress",
      BLOCKED: "inProgress",
      READY_FOR_QA: "qa",
      QA_IN_PROGRESS: "qa",
      REVIEW: "review",
      SHIPPED: "shipped",
      FAILED: "archive",
      ARCHIVED: "archive",
    }

    for (const task of tasks || []) {
      const stage = statusMap[task.status] || "backlog"
      stages[stage]!.push(task)
    }

    const stats = {
      shippedToday: stages.shipped?.length || 0,
      inProgress: stages.inProgress?.length || 0,
      backlog: stages.backlog?.length || 0,
      blocked: (tasks || []).filter((t) => t.status === "BLOCKED" || t.status === "STALLED" || t.status === "FAILED").length,
      total: tasks?.length || 0,
    }

    return NextResponse.json({ stages, stats, tasks })
  } catch (err) {
    return NextResponse.json({ error: String(err), stages: {}, stats: {}, tasks: [] }, { status: 500 })
  }
}
