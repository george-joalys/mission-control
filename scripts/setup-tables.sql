-- Mission Control — Supabase table setup
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS agents (
  id text PRIMARY KEY,
  name text,
  role text,
  model text,
  status text DEFAULT 'idle',
  last_action text,
  session_tokens integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text,
  action_type text,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id text PRIMARY KEY,
  name text,
  description text,
  content text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text,
  date date,
  tokens integer,
  cost_usd numeric(10,6),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  agent_id text,
  scheduled_at timestamptz,
  recurring boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_agent text,
  to_agent text,
  message text,
  task_description text,
  status text DEFAULT 'completed',
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comms ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tables
CREATE POLICY "Allow authenticated read" ON agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON comms FOR SELECT TO authenticated USING (true);

-- Allow service role full access (for sync script)
CREATE POLICY "Allow service role all" ON agents FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON logs FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON skills FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON costs FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON tasks FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON comms FOR ALL TO service_role USING (true);
