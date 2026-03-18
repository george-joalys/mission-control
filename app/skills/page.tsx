"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, StickyNote } from "lucide-react";

const skills = [
  {
    id: "joalys-seo",
    name: "joalys-seo",
    description: "SEO analysis and content optimization skill for AI agents",
    tags: ["seo", "content", "analysis"],
    color: "#10b981",
    skillMd: `# joalys-seo\n\nSEO optimization skill that analyzes content for keyword density, readability, meta tags, and provides actionable improvement suggestions.\n\n## Usage\n\`\`\`\n/seo analyze <url>\n/seo keywords <topic>\n/seo audit <content>\n\`\`\`\n\n## Capabilities\n- Keyword density analysis\n- Meta tag optimization\n- Readability scoring\n- Competitor analysis`,
  },
  {
    id: "joalys-import",
    name: "joalys-import",
    description: "Import and process data from various sources and formats",
    tags: ["data", "import", "processing"],
    color: "#6366f1",
    skillMd: `# joalys-import\n\nData import skill that handles CSV, JSON, XML, and API endpoints.\n\n## Usage\n\`\`\`\n/import file <path>\n/import api <endpoint>\n/import transform <rules>\n\`\`\`\n\n## Supported Formats\n- CSV, TSV\n- JSON, JSONL\n- XML\n- REST APIs`,
  },
  {
    id: "self-improvement",
    name: "self-improvement",
    description: "Agent self-evaluation and prompt optimization routines",
    tags: ["meta", "optimization", "learning"],
    color: "#f59e0b",
    skillMd: `# self-improvement\n\nMeta-skill for agent self-evaluation and continuous improvement.\n\n## Process\n1. Analyze recent task performance\n2. Identify patterns in failures\n3. Suggest prompt modifications\n4. A/B test improvements\n\n## Metrics Tracked\n- Task completion rate\n- Token efficiency\n- User satisfaction scores`,
  },
  {
    id: "mockup-organizer",
    name: "mockup-organizer",
    description: "Organize and categorize design mockups and wireframes",
    tags: ["design", "organization", "files"],
    color: "#ec4899",
    skillMd: `# mockup-organizer\n\nAutomatically organize design files into structured directories.\n\n## Features\n- Auto-detect file types (Figma, Sketch, PNG, SVG)\n- Group by project/feature\n- Generate thumbnail previews\n- Version tracking`,
  },
  {
    id: "coding-agent",
    name: "coding-agent",
    description: "Write, review, and refactor code across multiple languages",
    tags: ["code", "development", "review"],
    color: "#8b5cf6",
    skillMd: `# coding-agent\n\nFull-stack coding skill with support for multiple languages.\n\n## Capabilities\n- Code generation from specs\n- Code review with suggestions\n- Refactoring assistance\n- Test generation\n\n## Supported Languages\nTypeScript, Python, Rust, Go, and more.`,
  },
  {
    id: "weather",
    name: "weather",
    description: "Fetch and format weather data for any location worldwide",
    tags: ["api", "weather", "data"],
    color: "#06b6d4",
    skillMd: `# weather\n\nWeather data fetching and formatting skill.\n\n## Usage\n\`\`\`\n/weather current <location>\n/weather forecast <location> <days>\n/weather alerts <region>\n\`\`\`\n\n## Data Sources\n- OpenWeatherMap\n- National Weather Service\n- Weather.gov API`,
  },
];

function SkillCard({ skill }: { skill: (typeof skills)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");

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
      <div className="h-1" style={{ backgroundColor: skill.color }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold font-mono">
            {skill.name}
          </CardTitle>
          <div className="flex gap-1">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{skill.description}</p>
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
          <pre className="rounded-lg bg-muted/50 p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {skill.skillMd}
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage agent skills
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}
