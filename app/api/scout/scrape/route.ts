import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { profile_id, url, label } = await req.json();

    if (!profile_id || !url) {
      return NextResponse.json({ error: "profile_id and url required" }, { status: 400 });
    }

    // Déclenche le scraping via OpenClaw (skill scout-scraper)
    // Pour l'instant, on envoie un message à l'agent George qui déclenchera le skill
    // L'agent mettra à jour scrape_cache directement

    // Appel au skill scout-scraper via l'API OpenClaw locale
    const ocResponse = await fetch("http://localhost:3456/api/run-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill: "scout-scraper",
        params: { profile_id, url, label },
      }),
    }).catch(() => null);

    if (!ocResponse || !ocResponse.ok) {
      // Fallback: retourner une erreur claire
      return NextResponse.json(
        {
          error:
            "Le skill scout-scraper doit être déclenché via George (Telegram). Tape /veille pour lancer le scraping.",
          manual: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
