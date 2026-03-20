"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  Calendar,
  FileText,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Rocket,
} from "lucide-react";

interface AppIdea {
  name: string;
  potential_score: number;
  build_score: number;
  marketing_score: number;
  why: string;
}

interface PromisingApp {
  name: string;
  angle: string;
}

interface RedditScrapeCache {
  id: string;
  scraped_at: string | null;
  posts_count?: number;
  pain_points?: string[];
  app_ideas?: AppIdea[];
  promising_apps?: PromisingApp[];
  raw_data?: unknown;
  scan_type?: string;
}

function stars(score: number) {
  return "★".repeat(score) + "☆".repeat(5 - score);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "Date inconnue";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Date invalide";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScanCard({ scan }: { scan: RedditScrapeCache }) {
  const [expanded, setExpanded] = useState(false);
  const painPoints: string[] = Array.isArray(scan.pain_points) ? scan.pain_points : [];
  const appIdeas: AppIdea[] = Array.isArray(scan.app_ideas) ? scan.app_ideas : [];
  const promisingApps: PromisingApp[] = Array.isArray(scan.promising_apps) ? scan.promising_apps : [];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Scan Reddit</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              {formatDate(scan.scraped_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {scan.posts_count != null && (
            <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20">
              {scan.posts_count} posts
            </span>
          )}
          <div className="flex gap-1.5">
            {appIdeas.length > 0 && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/20">
                {appIdeas.length} idées
              </span>
            )}
            {painPoints.length > 0 && (
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400 border border-purple-500/20">
                Analysé par Iris
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-6">
          {/* Section 1 — Galères du marché */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-semibold text-foreground">💢 Galères du marché</h3>
            </div>
            {painPoints.length > 0 ? (
              <ul className="space-y-2">
                {painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Analyse en attente</p>
            )}
          </div>

          {/* Section 2 — Idées d'app */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-foreground">💡 Idées d&apos;app</h3>
            </div>
            {appIdeas.length > 0 ? (
              <ul className="space-y-4">
                {appIdeas.map((idea, i) => (
                  <li key={i} className="rounded-lg bg-accent/20 border border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground mb-1">{idea.name}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      <span title="Potentiel">💰 {stars(idea.potential_score)}</span>
                      <span title="Faisabilité">🔧 {stars(idea.build_score)}</span>
                      <span title="Marketing">📢 {stars(idea.marketing_score)}</span>
                    </div>
                    {idea.why && (
                      <p className="text-xs text-muted-foreground italic">→ {idea.why}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Analyse en attente</p>
            )}
          </div>

          {/* Section 3 — Apps à surveiller */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">🚀 Apps à surveiller</h3>
            </div>
            {promisingApps.length > 0 ? (
              <ul className="space-y-2">
                {promisingApps.map((app, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{app.name}</span>
                    {app.angle && <span> — {app.angle}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune app identifiée</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RedditPage() {
  const [scans, setScans] = useState<RedditScrapeCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launchMsg, setLaunchMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadScans();
  }, []);

  async function loadScans() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("reddit_scrape_cache")
        .select("*")
        .order("scraped_at", { ascending: false });

      if (err) throw err;
      setScans(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function launchScan() {
    setLaunching(true);
    setLaunchMsg(null);
    try {
      const res = await fetch("/api/reddit/run", { method: "POST" });
      const json = await res.json();
      setLaunchMsg(json.message || "Scan lancé !");
      setTimeout(() => setLaunchMsg(null), 5000);
    } catch {
      setLaunchMsg("Erreur lors du lancement");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Reddit Scout</h1>
            <p className="text-sm text-muted-foreground">
              Veille automatique des subreddits — pain points &amp; idées SaaS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadScans}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={launchScan}
            disabled={launching}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {launching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            Lancer un scan
          </button>
        </div>
      </div>

      {/* Launch message */}
      {launchMsg && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-sm text-orange-400">
          {launchMsg}
        </div>
      )}

      {/* Stats */}
      {!loading && scans.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Scans total</p>
            <p className="text-2xl font-bold text-foreground mt-1">{scans.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Dernier scan</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {formatDate(scans[0].scraped_at)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Posts total analysés</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {scans.reduce((acc, s) => acc + (s.posts_count || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des scans...
        </div>
      )}

      {/* Empty state */}
      {!loading && scans.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 mb-4">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold mb-1">Aucun scan pour l&apos;instant</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Lance ton premier scan Reddit Scout pour voir les résultats ici.
          </p>
          <button
            onClick={launchScan}
            disabled={launching}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            Lancer un scan
          </button>
        </div>
      )}

      {/* Scan list */}
      {!loading && scans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Historique des scans ({scans.length})
          </h2>
          {scans.map((scan) => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}
