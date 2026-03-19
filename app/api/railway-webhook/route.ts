import { NextRequest, NextResponse } from "next/server"

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID!

type EmbedConfig = {
  title: string
  description: string
  color: number
}

function buildEmbed(type: string, meta: { serviceName: string; environmentName: string; error?: string }): EmbedConfig | null {
  const svc = meta.serviceName || "service"
  const env = meta.environmentName || "production"

  switch (type) {
    case "DEPLOY_STARTED":
    case "BUILD_STARTED":
      return {
        title: `\u{1F528} Build en cours...`,
        description: `**${svc}** (${env})\n\`[======>   ] 60%\``,
        color: 0xff9800, // orange
      }
    case "BUILD_SUCCESS":
      return {
        title: `\u2705 Build OK \u2014 d\u00e9ploiement en cours...`,
        description: `**${svc}** (${env})\n\`[=========>] 90%\``,
        color: 0x4caf50, // green
      }
    case "DEPLOY_SUCCESS":
      return {
        title: `\u{1F7E2} LIVE \u2014 ${svc} d\u00e9ploy\u00e9 en production`,
        description: `**${svc}** (${env})\n\`[==========] 100%\` \u2728`,
        color: 0x4caf50, // green
      }
    case "BUILD_FAILED":
    case "DEPLOY_FAILED":
      return {
        title: `\u274C \u00C9chec \u2014 ${svc}`,
        description: `**${svc}** (${env})\n${meta.error || "Erreur inconnue"}`,
        color: 0xf44336, // red
      }
    default:
      return null
  }
}

async function postToDiscord(embed: EmbedConfig) {
  const url = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [
        {
          title: embed.title,
          description: embed.description,
          color: embed.color,
          timestamp: new Date().toISOString(),
          footer: { text: "Railway \u2192 Mission Control" },
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Railway webhook payload: { type, timestamp, project, environment, deployment, service, ... }
    const eventType: string =
      body.type?.toUpperCase().replace(/\./g, "_") || // e.g. "deploy.started" → "DEPLOY_STARTED"
      body.status?.toUpperCase() ||
      "UNKNOWN"

    const meta = {
      serviceName: body.service?.name || body.project?.name || "mission-control",
      environmentName: body.environment?.name || "production",
      error: body.deployment?.meta?.error || body.error || undefined,
    }

    const embed = buildEmbed(eventType, meta)

    if (!embed) {
      return NextResponse.json({ ok: true, skipped: true, event: eventType })
    }

    await postToDiscord(embed)

    return NextResponse.json({ ok: true, event: eventType })
  } catch (err) {
    console.error("[railway-webhook]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "railway-webhook" })
}
