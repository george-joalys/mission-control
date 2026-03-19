"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Eye, Plus, Trash2, RefreshCw, Clock, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface WatchedProfile {
  id: string;
  url: string;
  label: string;
  platform: string;
  active: boolean;
  created_at: string;
  last_scraped_at: string | null;
}

interface ScrapeCache {
  id: string;
  profile_id: string;
  scraped_at: string;
  posts_count: number;
  top_hooks: string[];
  analysis: string;
  raw_data: Record<string, unknown>;
}

export default function VeillePage() {
  const [profiles, setProfiles] = useState<WatchedProfile[]>([]);
  const [scrapeCache, setScrapeCache] = useState<Record<string, ScrapeCache>>({});
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("watched_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      if (profilesData && profilesData.length > 0) {
        const { data: cacheData } = await supabase
          .from("scrape_cache")
          .select("*")
          .in("profile_id", profilesData.map((p) => p.id))
          .order("scraped_at", { ascending: false });

        if (cacheData) {
          const byProfile: Record<string, ScrapeCache> = {};
          for (const item of cacheData) {
            if (!byProfile[item.profile_id]) {
              byProfile[item.profile_id] = item;
            }
          }
          setScrapeCache(byProfile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function addProfile() {
    if (!newUrl.trim() || !newLabel.trim()) return;

    const username = newUrl.match(/instagram\.com\/([^/?]+)/)?.[1] || newLabel;

    const { error } = await supabase.from("watched_profiles").insert({
      url: newUrl.trim(),
      label: newLabel.trim() || username,
      platform: "instagram",
      active: true,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setNewUrl("");
    setNewLabel("");
    setShowAddForm(false);
    loadData();
  }

  async function toggleProfile(id: string, active: boolean) {
    await supabase.from("watched_profiles").update({ active: !active }).eq("id", id);
    loadData();
  }

  async function deleteProfile(id: string) {
    await supabase.from("watched_profiles").delete().eq("id", id);
    loadData();
  }

  async function scrapeNow(profile: WatchedProfile) {
    setScraping(profile.id);
    setError(null);
    try {
      const response = await fetch("/api/scout/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id, url: profile.url, label: profile.label }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur scraping");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur scraping");
    } finally {
      setScraping(null);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Jamais";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Eye className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Veille Concurrentielle</h1>
              <p className="text-sm text-muted-foreground">Scout — analyse les hooks & formats qui marchent</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
            >
              <Plus className="h-4 w-4" />
              Ajouter profil
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <h3 className="text-sm font-semibold">Nouveau profil à surveiller</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">URL Instagram</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.instagram.com/compte/"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Label (nom court)</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="ex: Xavier Exelle"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addProfile}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                Ajouter
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewUrl(""); setNewLabel(""); }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Profiles list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Eye className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Aucun profil surveillé</p>
            <p className="text-xs mt-1">Clique sur "Ajouter profil" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => {
              const lastScrape = scrapeCache[profile.id];
              const isScrapingThis = scraping === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`rounded-lg border bg-card overflow-hidden transition-all ${
                    profile.active ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  {/* Profile header */}
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${profile.active ? "bg-emerald-400" : "bg-gray-500"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{profile.label}</span>
                          <span className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                            {profile.platform}
                          </span>
                        </div>
                        <a
                          href={profile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5"
                        >
                          {profile.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(profile.last_scraped_at)}
                      </div>

                      <button
                        onClick={() => scrapeNow(profile)}
                        disabled={isScrapingThis}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs disabled:opacity-50"
                      >
                        {isScrapingThis ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        {isScrapingThis ? "Scraping..." : "Scraper"}
                      </button>

                      <button
                        onClick={() => toggleProfile(profile.id, profile.active)}
                        className={`px-2 py-1.5 rounded-lg text-xs border ${
                          profile.active
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {profile.active ? "Actif" : "Inactif"}
                      </button>

                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Last scrape result */}
                  {lastScrape ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-muted-foreground">
                          Dernier scrape : {formatDate(lastScrape.scraped_at)} — {lastScrape.posts_count} posts analysés
                        </span>
                      </div>

                      {/* Top hooks */}
                      {lastScrape.top_hooks && lastScrape.top_hooks.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">🎣 TOP HOOKS DÉTECTÉS</p>
                          <div className="space-y-1">
                            {lastScrape.top_hooks.slice(0, 5).map((hook, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-xs text-purple-400 font-mono w-5 flex-shrink-0">{i + 1}.</span>
                                <p className="text-xs text-foreground/80 italic">"{hook}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Analysis */}
                      {lastScrape.analysis && (
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">🤖 ANALYSE IA</p>
                          <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                            {lastScrape.analysis}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p className="text-xs">Pas encore scrapé — clique sur "Scraper" pour analyser ce profil</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
