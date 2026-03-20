import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const DISCORD_SCRIPT = `${process.env.HOME}/.openclaw/workspace/scripts/discord-post.sh`;

export async function POST() {
  // Récupérer tous les prospects validés
  const { data: validated, error } = await supabase
    .from("hugo_prospects")
    .select("*")
    .eq("status", "validated");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!validated || validated.length === 0) {
    return NextResponse.json({ ok: true, count: 0, message: "No validated prospects" });
  }

  // Pour l'instant: log seulement + marquer comme sent (envoi Instagram = manuel)
  const ids = validated.map(p => p.id);
  await supabase
    .from("hugo_prospects")
    .update({ status: "sent", dm_sent_at: new Date().toISOString() })
    .in("id", ids);

  // Log les DMs qui auraient été envoyés
  const logLines = validated.map(p => `@${p.username} (score ${p.score}):\n${p.dm_text}`).join("\n\n---\n\n");
  console.log("[Hugo] DMs to send manually:\n", logLines);

  // Notification Discord
  try {
    const summary = validated.map(p => `@${p.username}`).join(", ");
    execSync(
      `bash ${DISCORD_SCRIPT} factory-live "🎯 Hugo — ${validated.length} DMs prêts à envoyer manuellement : ${summary}"`,
      { timeout: 10000 }
    );
  } catch (e) {
    console.log("[Hugo] Discord notification failed:", e);
  }

  return NextResponse.json({
    ok: true,
    count: validated.length,
    message: `${validated.length} DMs marked as sent (manual send required)`,
    prospects: validated.map(p => ({ username: p.username, score: p.score })),
  });
}
