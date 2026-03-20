import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "ready_for_review";

  const { data, error } = await supabase
    .from("hugo_prospects")
    .select("*")
    .eq("status", status)
    .order("score", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
