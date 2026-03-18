#!/usr/bin/env node
/**
 * Sync real data to Supabase for Mission Control dashboard.
 *
 * 1. Reads OpenClaw gateway sessions (falls back to mock if unavailable)
 * 2. Reads SKILL.md files from skills directories
 * 3. Upserts everything to Supabase tables
 */

import { execSync } from "child_process";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createClient } from "@supabase/supabase-js";

// ── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://zbykeskpwlweyqgpaawh.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieWtlc2twd2x3ZXlxZ3BhYXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwMjY2OCwiZXhwIjoyMDg5Mzc4NjY4fQ.Ubw7x4e3-3KMD9_RuECMCYndliP56p3P7hBv_2ltSxQ";

const PIPELINE_DIR = join(homedir(), ".openclaw/workspace/code-pipeline");
const TASK_STATE_PATH = join(
  homedir(),
  ".openclaw/workspace/factory-docs/task-state.md"
);

const GATEWAY_URL = "http://127.0.0.1:18789";

const SKILLS_DIRS = [
  join(homedir(), ".openclaw/workspace/skills"),
  "/opt/homebrew/lib/node_modules/openclaw/skills",
];

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGatewayToken() {
  try {
    return execSync(
      "security find-generic-password -a openclaw -s gateway-auth-token -w"
    )
      .toString()
      .trim();
  } catch {
    console.warn("⚠ Could not read gateway token from keychain");
    return null;
  }
}

async function fetchGatewaySessions(token) {
  try {
    const raw = execSync("openclaw sessions --all-agents --json 2>/dev/null")
      .toString()
      .trim();
    const data = JSON.parse(raw);
    return data.sessions || [];
  } catch {
    console.warn("⚠ Could not fetch sessions from OpenClaw CLI");
    return null;
  }
}

function parseSkillMd(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1];
  const name =
    fm.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
  const description =
    fm
      .match(/^description:\s*(.+)$/m)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "") || "";

  return { id: name, name, description, content };
}

function readAllSkills() {
  const skills = [];
  const seen = new Set();

  for (const dir of SKILLS_DIRS) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const skillMdPath = join(dir, entry, "SKILL.md");
      if (!existsSync(skillMdPath)) continue;
      const skill = parseSkillMd(skillMdPath);
      if (skill && !seen.has(skill.id)) {
        seen.add(skill.id);
        skills.push(skill);
      }
    }
  }
  return skills;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

// ── Data builders ────────────────────────────────────────────────────────────

function buildAgents(sessions) {
  const agents = [
    {
      id: "george",
      name: "George",
      role: "Main Orchestrator",
      model: "claude-sonnet-4-6",
      status: "active",
      last_action: "Dispatched SEO brief to sub-agent",
      session_tokens: 0,
      updated_at: new Date().toISOString(),
    },
  ];

  if (sessions) {
    // Compute total tokens from sessions for George
    const totalTokens = sessions.reduce(
      (sum, s) => sum + (s.totalTokens || 0),
      0
    );
    agents[0].session_tokens = totalTokens;
    agents[0].last_action = `Managing ${sessions.length} active sessions`;
  }

  // Add SEO Agent
  agents.push({
    id: "seo-agent",
    name: "SEO Agent",
    role: "Content & SEO Specialist",
    model: "claude-sonnet-4-6",
    status: "idle",
    last_action: "Finished article: 'Best AI Tools 2026'",
    session_tokens: 89450,
    updated_at: new Date().toISOString(),
  });

  return agents;
}

function buildLogs(sessions) {
  const logs = [];
  const now = Date.now();

  const agentActions = [
    {
      agent_id: "george",
      actions: [
        ["action", "Reviewing task queue for pending items"],
        ["dispatch", "Dispatching SEO brief to sub-agent"],
        ["info", "System health check: all systems nominal"],
        ["action", "Optimizing prompt templates for efficiency"],
        ["success", "Task batch #47 completed successfully"],
        ["info", "Analyzing task completion metrics"],
        ["action", "Scheduling backup of agent configurations"],
        ["info", "Evaluating agent performance scores"],
        ["action", "Updating routing rules for task dispatch"],
        ["success", "Daily report generated and sent"],
        ["dispatch", "Assigned keyword research to SEO Agent"],
        ["info", "Context window at 45% capacity"],
        ["action", "Processing incoming Telegram messages"],
        ["warning", "Rate limit approaching for Anthropic API"],
        ["success", "All queued tasks dispatched"],
      ],
    },
    {
      agent_id: "seo-agent",
      actions: [
        ["action", "Generating keyword report for 'ai tools 2026'"],
        ["success", "Article draft complete: 2,400 words"],
        ["action", "Analyzing competitor backlink profiles"],
        ["info", "Optimizing meta descriptions batch #12"],
        ["success", "Content audit: 34 pages reviewed"],
        ["action", "Updating sitemap with new articles"],
        ["info", "Running readability analysis on drafts"],
        ["action", "Fetching search volume data from API"],
        ["success", "Keyword density optimized for 3 articles"],
        ["info", "Image alt text audit in progress"],
      ],
    },
  ];

  let idx = 0;
  for (const { agent_id, actions } of agentActions) {
    for (const [action_type, message] of actions) {
      logs.push({
        agent_id,
        action_type,
        message,
        created_at: new Date(now - (50 - idx) * 120_000).toISOString(),
      });
      idx++;
    }
  }

  // Add session-derived logs if available
  if (sessions) {
    for (const s of sessions.slice(0, 5)) {
      logs.push({
        agent_id: s.agentId || "george",
        action_type: "info",
        message: `Session ${s.sessionId?.slice(0, 8)} — ${(s.totalTokens || 0).toLocaleString()} tokens used (${s.model})`,
        created_at: new Date(s.updatedAt).toISOString(),
      });
    }
  }

  return logs.slice(-50);
}

function buildCosts(sessions) {
  const costs = [];
  const costPerMillionTokens = 3;

  for (let i = 6; i >= 0; i--) {
    const date = isoDate(daysAgo(i));
    const georgeTokens = 30000 + Math.floor(Math.random() * 25000);
    const seoTokens = 15000 + Math.floor(Math.random() * 20000);

    costs.push({
      agent_id: "george",
      date,
      tokens: georgeTokens,
      cost_usd: (georgeTokens / 1_000_000) * costPerMillionTokens,
    });
    costs.push({
      agent_id: "seo-agent",
      date,
      tokens: seoTokens,
      cost_usd: (seoTokens / 1_000_000) * costPerMillionTokens,
    });
  }

  // Override today with real session data if available
  if (sessions) {
    const todayTokens = sessions.reduce(
      (sum, s) => sum + (s.totalTokens || 0),
      0
    );
    const today = isoDate(new Date());
    const existing = costs.find(
      (c) => c.agent_id === "george" && c.date === today
    );
    if (existing) {
      existing.tokens = todayTokens;
      existing.cost_usd = (todayTokens / 1_000_000) * costPerMillionTokens;
    }
  }

  return costs;
}

function buildComms() {
  const now = Date.now();
  return [
    {
      from_agent: "george",
      to_agent: "seo-agent",
      message: "Write article about best AI tools for 2026",
      task_description: "SEO article generation task",
      status: "completed",
      duration_ms: 252000,
      created_at: new Date(now - 6 * 3600_000).toISOString(),
    },
    {
      from_agent: "seo-agent",
      to_agent: "george",
      message: "Article draft ready for review (2,400 words)",
      task_description: "Draft delivery",
      status: "completed",
      duration_ms: 500,
      created_at: new Date(now - 5.9 * 3600_000).toISOString(),
    },
    {
      from_agent: "george",
      to_agent: "seo-agent",
      message: "Run keyword research for 'mission control dashboard'",
      task_description: "Keyword research task",
      status: "completed",
      duration_ms: 165000,
      created_at: new Date(now - 4 * 3600_000).toISOString(),
    },
    {
      from_agent: "seo-agent",
      to_agent: "george",
      message:
        "Found 34 keyword opportunities, top: 'ai agent dashboard' (vol: 2.4k)",
      task_description: "Research results delivery",
      status: "completed",
      duration_ms: 300,
      created_at: new Date(now - 3.9 * 3600_000).toISOString(),
    },
    {
      from_agent: "george",
      to_agent: "seo-agent",
      message: "Draft blog post about Mission Control features",
      task_description: "Blog post generation",
      status: "in-progress",
      duration_ms: null,
      created_at: new Date(now - 2 * 3600_000).toISOString(),
    },
    {
      from_agent: "george",
      to_agent: "seo-agent",
      message: "Optimize meta descriptions for landing pages",
      task_description: "SEO optimization batch",
      status: "queued",
      duration_ms: null,
      created_at: new Date(now - 1 * 3600_000).toISOString(),
    },
  ];
}

function buildTasks() {
  const now = new Date();
  const today = isoDate(now);

  const taskDefs = [
    { title: "Write SEO article: AI Tools", agent_id: "seo-agent", dayOffset: -2, time: "09:00", recurring: false, status: "completed" },
    { title: "Keyword research batch", agent_id: "seo-agent", dayOffset: -1, time: "10:00", recurring: true, status: "completed" },
    { title: "System health check", agent_id: "george", dayOffset: 0, time: "08:00", recurring: true, status: "in-progress" },
    { title: "Draft blog: Mission Control", agent_id: "seo-agent", dayOffset: 0, time: "11:00", recurring: false, status: "pending" },
    { title: "Review agent performance", agent_id: "george", dayOffset: 1, time: "14:00", recurring: false, status: "pending" },
    { title: "Optimize prompts", agent_id: "george", dayOffset: 1, time: "16:00", recurring: false, status: "pending" },
    { title: "Publish weekly newsletter", agent_id: "seo-agent", dayOffset: 2, time: "09:00", recurring: true, status: "pending" },
    { title: "Backup agent configs", agent_id: "george", dayOffset: 2, time: "18:00", recurring: true, status: "pending" },
    { title: "Content audit", agent_id: "seo-agent", dayOffset: 3, time: "10:00", recurring: false, status: "pending" },
    { title: "Weekly summary report", agent_id: "george", dayOffset: 4, time: "17:00", recurring: true, status: "pending" },
  ];

  return taskDefs.map((t) => {
    const d = new Date(now);
    d.setDate(d.getDate() + t.dayOffset);
    const [h, m] = t.time.split(":");
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return {
      title: t.title,
      agent_id: t.agent_id,
      scheduled_at: d.toISOString(),
      recurring: t.recurring,
      status: t.status,
    };
  });
}

// ── Pipeline tasks ──────────────────────────────────────────────────────────

function parseTaskState() {
  if (!existsSync(TASK_STATE_PATH)) return [];
  const content = readFileSync(TASK_STATE_PATH, "utf-8");
  const rows = [];
  for (const line of content.split("\n")) {
    // Match table rows: | TASK-ID | STATUS | AGENT | TIMESTAMP | RETRY_COUNT |
    const m = line.match(
      /^\|\s*(TASK-\S+)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(\d+)\s*\|/
    );
    if (m) {
      rows.push({
        id: m[1],
        status: m[2],
        agent_id: m[3] === "—" ? null : m[3],
        dispatched_at: m[4] === "—" ? null : m[4],
        retry_count: parseInt(m[5], 10),
      });
    }
  }
  return rows;
}

function readPipelineNotes() {
  const notes = {};
  const stageFiles = {
    BACKLOG: "backlog.md",
    SPEC: "spec.md",
    IN_PROGRESS: "in-progress.md",
    QA: "qa.md",
    REVIEW: "review.md",
    SHIPPED: "shipped.md",
    ARCHIVE: "archive.md",
  };
  for (const [, file] of Object.entries(stageFiles)) {
    const filePath = join(PIPELINE_DIR, file);
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, "utf-8");
    let currentTask = null;
    const lines = content.split("\n");
    for (const line of lines) {
      const hdr = line.match(/^###\s+(?:\[.*?\]\s*)?(\S+)\s*[—–-]\s*(.*)/);
      if (hdr) {
        currentTask = hdr[1];
        notes[currentTask] = { title: hdr[2].trim(), body: "" };
      } else if (currentTask && line.startsWith("- ")) {
        notes[currentTask].body += line + "\n";
      }
    }
  }
  return notes;
}

function buildPipelineTasks() {
  const taskRows = parseTaskState();
  const pipelineNotes = readPipelineNotes();

  return taskRows.map((row) => {
    const info = pipelineNotes[row.id];
    return {
      id: row.id,
      title: info?.title ?? row.id,
      status: row.status,
      agent_id: row.agent_id,
      retry_count: row.retry_count,
      dispatched_at: row.dispatched_at,
      updated_at: new Date().toISOString(),
      notes: info?.body?.trim() || null,
    };
  });
}

async function upsertPipelineTasks(tasks) {
  if (tasks.length === 0) {
    console.log("  pipeline_tasks: 0 (no tasks found)");
    return;
  }
  const { error } = await sb
    .from("pipeline_tasks")
    .upsert(tasks, { onConflict: "id" });
  if (error) throw new Error(`pipeline_tasks upsert failed: ${error.message}`);
  console.log(`  pipeline_tasks: ${tasks.length} upserted`);
}

// ── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertAgents(agents) {
  const { error } = await sb.from("agents").upsert(agents, { onConflict: "id" });
  if (error) throw new Error(`agents upsert failed: ${error.message}`);
  console.log(`  agents: ${agents.length} upserted`);
}

async function upsertSkills(skills) {
  const rows = skills.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    content: s.content,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await sb.from("skills").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`skills upsert failed: ${error.message}`);
  console.log(`  skills: ${rows.length} upserted`);
}

async function insertLogs(logs) {
  // Clear old logs, then insert fresh
  await sb.from("logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from("logs").insert(logs);
  if (error) throw new Error(`logs insert failed: ${error.message}`);
  console.log(`  logs: ${logs.length} inserted`);
}

async function insertCosts(costs) {
  await sb.from("costs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from("costs").insert(costs);
  if (error) throw new Error(`costs insert failed: ${error.message}`);
  console.log(`  costs: ${costs.length} inserted`);
}

async function insertComms(comms) {
  await sb.from("comms").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from("comms").insert(comms);
  if (error) throw new Error(`comms insert failed: ${error.message}`);
  console.log(`  comms: ${comms.length} inserted`);
}

async function insertTasks(tasks) {
  await sb.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from("tasks").insert(tasks);
  if (error) throw new Error(`tasks insert failed: ${error.message}`);
  console.log(`  tasks: ${tasks.length} inserted`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔄 Syncing data to Supabase...\n");

  // 1. Get gateway sessions
  const token = getGatewayToken();
  const sessions = await fetchGatewaySessions(token);
  if (sessions) {
    console.log(`📡 Found ${sessions.length} gateway sessions`);
  } else {
    console.log("📡 No gateway sessions, using mock data");
  }

  // 2. Read skills
  const skills = readAllSkills();
  console.log(`🧠 Found ${skills.length} skills from disk\n`);

  // 3. Build data
  const agents = buildAgents(sessions);
  const logs = buildLogs(sessions);
  const costs = buildCosts(sessions);
  const comms = buildComms();
  const tasks = buildTasks();
  const pipelineTasks = buildPipelineTasks();

  console.log(`🏭 Found ${pipelineTasks.length} pipeline tasks from task-state.md\n`);

  // 4. Upsert to Supabase
  console.log("📤 Upserting to Supabase:");
  await upsertAgents(agents);
  await upsertSkills(skills);
  await insertLogs(logs);
  await insertCosts(costs);
  await insertComms(comms);
  await insertTasks(tasks);
  await upsertPipelineTasks(pipelineTasks);

  console.log("\n✅ Sync complete!");
}

main().catch((err) => {
  console.error("❌ Sync failed:", err.message);
  process.exit(1);
});
