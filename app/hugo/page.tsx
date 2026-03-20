"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Play,
  CheckCircle,
  XCircle,
  ExternalLink,
  Send,
  RefreshCw,
  Clock,
  Star,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prospect {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  posts_count: number | null;
  last_post_date: string | null;
  profile_url: string | null;
  website: string | null;
  location: string | null;
  recent_posts: Array<{ caption: string; likes: number; timestamp: number }> | null;
  score: number;
  score_details: Record<string, string> | null;
  status: string;
  dm_text: string | null;
  ghl_contact_id: string | null;
  dm_sent_at: string | null;
  scraped_at: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : score >= 50
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : score >= 30
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-muted text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", color)}>
      <Star className="h-3 w-3" />
      {score}
    </span>
  );
}

function formatFollowers(n: number | null) {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = Date.now();
  const diffDays = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)}sem`;
  if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)}mois`;
  return d.toLocaleDateString("fr-FR");
}

export default function HugoPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [sentProspects, setSentProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [sending, setSending] = useState(false);
  const [editedDMs, setEditedDMs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewRes, sentRes] = await Promise.all([
        fetch("/api/hugo/prospects?status=ready_for_review"),
        fetch("/api/hugo/prospects?status=sent"),
      ]);
      const reviewData = await reviewRes.json();
      const sentData = await sentRes.json();
      setProspects(Array.isArray(reviewData) ? reviewData : []);
      setSentProspects(Array.isArray(sentData) ? sentData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch("/api/hugo/scrape", { method: "POST" });
      if (res.ok) {
        showMessage("success", "Scraping lancé en arrière-plan. Les prospects arriveront dans quelques minutes.");
      } else {
        showMessage("error", "Erreur au lancement du scraping.");
      }
    } catch {
      showMessage("error", "Erreur réseau.");
    } finally {
      setScraping(false);
    }
  };

  const handleValidate = async (prospect: Prospect) => {
    const dmText = editedDMs[prospect.id] ?? prospect.dm_text ?? "";
    try {
      const res = await fetch("/api/hugo/validate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prospect.id, dm_text: dmText }),
      });
      if (res.ok) {
        setProspects(prev => prev.filter(p => p.id !== prospect.id));
        showMessage("success", `@${prospect.username} validé ✅`);
      } else {
        showMessage("error", "Erreur validation.");
      }
    } catch {
      showMessage("error", "Erreur réseau.");
    }
  };

  const handleSkip = async (prospect: Prospect) => {
    try {
      const res = await fetch("/api/hugo/skip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prospect.id }),
      });
      if (res.ok) {
        setProspects(prev => prev.filter(p => p.id !== prospect.id));
        showMessage("success", `@${prospect.username} ignoré`);
      } else {
        showMessage("error", "Erreur skip.");
      }
    } catch {
      showMessage("error", "Erreur réseau.");
    }
  };

  const handleSendBatch = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/hugo/send-batch", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showMessage("success", `${data.count} DMs marqués comme envoyés`);
        fetchProspects();
      } else {
        showMessage("error", "Erreur envoi batch.");
      }
    } catch {
      showMessage("error", "Erreur réseau.");
    } finally {
      setSending(false);
    }
  };

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const scrapedToday = [...prospects, ...sentProspects].filter(
    p => p.scraped_at?.startsWith(today)
  ).length;
  const validatedCount = prospects.filter(p => p.status === "validated").length;
  const sentCount = sentProspects.length;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Hugo — Prospection Instagram
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bijoutiers créateurs français · JOALYS PARIS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProspects}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scraping ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Lancer scraping
          </button>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm font-medium",
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          )}
        >
          {message.text}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Scrapés aujourd'hui", value: scrapedToday, icon: TrendingUp, color: "text-blue-400" },
          { label: "À valider", value: prospects.length, icon: Clock, color: "text-amber-400" },
          { label: "Validés", value: validatedCount, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Envoyés", value: sentCount, icon: Send, color: "text-indigo-400" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("flex items-center gap-2 text-sm text-muted-foreground mb-1")}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              {stat.label}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Section "À valider" */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">À valider aujourd'hui</h2>
          {prospects.length > 0 && (
            <button
              onClick={handleSendBatch}
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {sending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Envoyer les validés
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : prospects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun prospect à valider.</p>
            <p className="text-sm mt-1">Lance le scraping ou attends le cron de demain matin.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {prospects.map(prospect => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                dmValue={editedDMs[prospect.id] ?? prospect.dm_text ?? ""}
                onDMChange={val => setEditedDMs(prev => ({ ...prev, [prospect.id]: val }))}
                onValidate={() => handleValidate(prospect)}
                onSkip={() => handleSkip(prospect)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section "Envoyés" */}
      {sentProspects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Envoyés ({sentProspects.length})</h2>
          <div className="space-y-2">
            {sentProspects.map(prospect => (
              <div
                key={prospect.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {(prospect.username[0] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">@{prospect.username}</span>
                    <ScoreBadge score={prospect.score} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envoyé {formatDate(prospect.dm_sent_at)}
                  </p>
                </div>
                <a
                  href={prospect.profile_url || `https://instagram.com/${prospect.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProspectCard({
  prospect,
  dmValue,
  onDMChange,
  onValidate,
  onSkip,
}: {
  prospect: Prospect;
  dmValue: string;
  onDMChange: (val: string) => void;
  onValidate: () => void;
  onSkip: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col">
      {/* Header prospect */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
          {(prospect.username[0] || "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={prospect.profile_url || `https://instagram.com/${prospect.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              @{prospect.username}
              <ExternalLink className="h-3 w-3" />
            </a>
            <ScoreBadge score={prospect.score} />
          </div>
          {prospect.full_name && (
            <p className="text-xs text-muted-foreground">{prospect.full_name}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 px-4 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {formatFollowers(prospect.followers)} followers
        </span>
        {prospect.last_post_date && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(prospect.last_post_date)}
          </span>
        )}
      </div>

      {/* Bio */}
      {prospect.bio && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">{prospect.bio}</p>
        </div>
      )}

      {/* DM editor */}
      <div className="px-4 pb-3 flex-1">
        <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          DM généré
        </div>
        <textarea
          value={dmValue}
          onChange={e => onDMChange(e.target.value)}
          rows={expanded ? 8 : 4}
          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 leading-relaxed"
          placeholder="Aucun DM généré..."
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground mt-1"
        >
          {expanded ? "Réduire ▲" : "Agrandir ▼"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onValidate}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          Valider
        </button>
        <button
          onClick={onSkip}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <XCircle className="h-4 w-4" />
          Skip
        </button>
      </div>
    </div>
  );
}
