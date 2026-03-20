import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * One-time setup route for Reddit Scout tables.
 * Call: POST /api/setup-reddit with Authorization: Bearer <SERVICE_KEY>
 * Delete this file after use.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${SERVICE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // We can't run raw SQL via the REST API, but we can test if tables exist
  // and create them via supabase's rpc if available.
  // 
  // This route will be used to verify setup status.
  const results: Record<string, string> = {};

  const r1 = await supabase.from("reddit_watched_subs").select("id").limit(1);
  results["reddit_watched_subs"] = r1.error ? `MISSING (${r1.error.code})` : "EXISTS";

  const r2 = await supabase.from("reddit_scrape_cache").select("id").limit(1);
  results["reddit_scrape_cache"] = r2.error ? `MISSING (${r2.error.code})` : "EXISTS";

  const sql = `
-- Run this in Supabase Dashboard > SQL Editor:
CREATE TABLE IF NOT EXISTS reddit_watched_subs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subreddit text NOT NULL,
  label text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reddit_scrape_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_at timestamptz DEFAULT now(),
  posts_count int,
  pain_points jsonb,
  app_ideas jsonb,
  promising_apps jsonb,
  raw_data jsonb,
  scan_type text DEFAULT 'daily'
);

INSERT INTO reddit_watched_subs (subreddit, label) VALUES
  ('entrepreneur', 'Entrepreneurs'),
  ('startups', 'Startups'),
  ('SideProject', 'Side Projects'),
  ('AppIdeas', 'App Ideas'),
  ('nocode', 'No Code'),
  ('SaaS', 'SaaS'),
  ('indiehackers', 'Indie Hackers')
ON CONFLICT DO NOTHING;
`;

  return NextResponse.json({ tables: results, sql_to_run: sql });
}
