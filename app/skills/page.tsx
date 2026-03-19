"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  StickyNote,
  Import,
  Search,
  BookOpen,
  FileEdit,
  Sparkles,
  FileUp,
  BarChart3,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

// ── Active skills config ────────────────────────────────────────────

const ACTIVE_SKILL_IDS = [
  "joalys-import",
  "joalys-seo",
  "journal-soir",
  "content-brief",
  "hook-generator",
  "word-ingestion",
  "perf-analyzer",
];

const SKILL_COLORS: Record<string, string> = {
  "joalys-import": "#6366f1",
  "joalys-seo": "#10b981",
  "journal-soir": "#f59e0b",
  "content-brief": "#8b5cf6",
  "hook-generator": "#ec4899",
  "word-ingestion": "#06b6d4",
  "perf-analyzer": "#ef4444",
};

const SKILL_ICONS: Record<string, React.ReactNode> = {
  "joalys-import": <Import className="h-4 w-4" />,
  "joalys-seo": <Search className="h-4 w-4" />,
  "journal-soir": <BookOpen className="h-4 w-4" />,
  "content-brief": <FileEdit className="h-4 w-4" />,
  "hook-generator": <Sparkles className="h-4 w-4" />,
  "word-ingestion": <FileUp className="h-4 w-4" />,
  "perf-analyzer": <BarChart3 className="h-4 w-4" />,
};

const FALLBACK_SKILLS: SkillRow[] = [
  {
    id: "joalys-import",
    name: "Joalys Import",
    description: "Import products and data from Joalys sources",
    content: "# Joalys Import\nImport skill for Joalys data pipeline",
    updated_at: new Date().toISOString(),
  },
  {
    id: "joalys-seo",
    name: "Joalys SEO",
    description: "SEO optimization for Joalys content",
    content: "# Joalys SEO\nSEO analysis and optimization",
    updated_at: new Date().toISOString(),
  },
  {
    id: "journal-soir",
    name: "Journal du Soir",
    description: "Evening journal generation and summary",
    content: "# Journal du Soir\nDaily evening report generation",
    updated_at: new Date().toISOString(),
  },
  {
    id: "content-brief",
    name: "Content Brief",
    description: "Generate content briefs for articles",
    content: "# Content Brief\nStructured content brief generator",
    updated_at: new Date().toISOString(),
  },
  {
    id: "hook-generator",
    name: "Hook Generator",
    description: "Generate engaging hooks for content",
    content: "# Hook Generator\nCreate compelling hooks and headlines",
    updated_at: new Date().toISOString(),
  },
  {
    id: "word-ingestion",
    name: "Word Ingestion",
    description: "Ingest and process Word documents",
    content: "# Word Ingestion\nProcess .docx files into structured data",
    updated_at: new Date().toISOString(),
  },
  {
    id: "perf-analyzer",
    name: "Perf Analyzer",
    description: "Analyze agent performance metrics",
    content: "# Perf Analyzer\nPerformance analysis and reporting",
    updated_at: new Date().toISOString(),
  },
];

// ── Types ───────────────────────────────────────────────────────────

interface SkillRow {
  id: string;
  name: string;
  description: string;
  content: string;
  updated_at: string;
}

// ── Skill Card ──────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: SkillRow }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const color = SKILL_COLORS[skill.id] || "#6366f1";
  const icon = SKILL_ICONS[skill.id] || <Zap className="h-4 w-4" />;

  useEffect(() => {
    const saved = localStorage.getItem(`skill-notes-${skill.id}`);
    if (saved) setNotes(saved);
  }, [skill.id]);

  const saveNotes = (value: string) => {
    setNotes(value);
    localStorage.setItem(`skill-notes-${skill.id}`, value);
  };

  return (
    <Card className="overflow-hidden transition-all hover:border-white/20">
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center rounded-md p-1.5"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </span>
            <CardTitle className="text-base font-semibold font-mono">
              {skill.name}
            </CardTitle>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {skill.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            SKILL.md
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
        {expanded && (
          <pre className="rounded-lg bg-muted/50 p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-y-auto">
            {skill.content}
          </pre>
        )}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
            <StickyNote className="h-3 w-3" />
            Personal notes
          </div>
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder="Add notes about this skill..."
            className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("skills")
      .select("*")
      .in("id", ACTIVE_SKILL_IDS)
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSkills(data);
        } else {
          // Fallback: show placeholder skills if none found in DB
          setSkills(FALLBACK_SKILLS);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Active Skills
          </h1>
          <span className="text-lg text-muted-foreground font-light">
            &mdash; Joalys
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-sm text-muted-foreground">
            Filtered view of active agent skills
          </p>
          <Badge
            variant="outline"
            className="text-xs tabular-nums border-emerald-500/40 text-emerald-400"
          >
            {skills.length} active skill{skills.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[220px] rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No active skills found.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
