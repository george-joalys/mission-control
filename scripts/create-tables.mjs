#!/usr/bin/env node
/**
 * Create Supabase tables for Mission Control.
 * Tries the management API first, falls back to printing instructions.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL = readFileSync(join(__dirname, "setup-tables.sql"), "utf-8");

const SUPABASE_URL = "https://zbykeskpwlweyqgpaawh.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieWtlc2twd2x3ZXlxZ3BhYXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwMjY2OCwiZXhwIjoyMDg5Mzc4NjY4fQ.Ubw7x4e3-3KMD9_RuECMCYndliP56p3P7hBv_2ltSxQ";
const PROJECT_REF = "zbykeskpwlweyqgpaawh";

// Split SQL into individual statements for execution
const statements = SQL.split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

async function tryManagementAPI() {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    }
  );
  if (res.ok) {
    console.log("Tables created via Management API.");
    return true;
  }
  return false;
}

async function checkTablesExist() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/agents?select=id&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  return res.ok;
}

async function main() {
  // Check if tables already exist
  if (await checkTablesExist()) {
    console.log("Tables already exist. Skipping creation.");
    return;
  }

  // Try management API
  if (await tryManagementAPI()) return;

  // If nothing worked, print instructions
  console.log("\n" + "=".repeat(60));
  console.log("MANUAL STEP REQUIRED");
  console.log("=".repeat(60));
  console.log("\nCould not create tables programmatically.");
  console.log("Please run the following SQL in your Supabase SQL Editor:");
  console.log("  Dashboard > SQL Editor > New Query\n");
  console.log("SQL file: scripts/setup-tables.sql");
  console.log("\nOr copy-paste the SQL below:\n");
  console.log(SQL);
  console.log("\n" + "=".repeat(60));
  process.exit(1);
}

main().catch(console.error);
