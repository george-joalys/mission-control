"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface SkillRow {
  id: string;
  name: string;
  description: string;
  content: string;
  updated_at: string;
}

const skillColors: Record<string, string> = {
  "joalys-seo": "#10b981",
  "joalys-import": "#6366f1",
  "self-improvement": "#f59e0b",
  "mockup-organizer": "#ec4899",
  "coding-agent": "#8b5cf6",
  weather: "#06b6d4",
};

function SkillCard({ skill }: { skill: SkillRow }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const color = skillColors[skill.id] || "#6366f1";

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
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold font-mono">{skill.name}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{skill.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="ghost" size="sm" className="w-full justify-between text-xs" onClick={() => setExpanded(!expanded)}>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            SKILL.md
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
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

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("skills")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setSkills(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and manage agent skills</p>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[200px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">No skills found. Run the sync script to populate data.</p>
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
