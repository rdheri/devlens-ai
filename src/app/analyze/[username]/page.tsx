"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnalysisResult } from "@/lib/types";
import SkillRadar from "@/components/SkillRadar";
import LanguageBar from "@/components/LanguageBar";
import RepoGrid from "@/components/RepoGrid";
import LoadingState from "@/components/LoadingState";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import ExportReport from "@/components/ExportReport";

function StatCard({ label, value, sub, accent = "cyan" }: { label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = { cyan: "text-accent-cyan", emerald: "text-accent-emerald", violet: "text-accent-violet", amber: "text-accent-amber", rose: "text-accent-rose" };
  return (
    <div className="card-gradient p-4 text-center group hover:scale-[1.02] transition-transform">
      <p className={`font-mono font-700 text-2xl ${colors[accent] || colors.cyan}`}>{value}</p>
      <p className="text-[10px] text-txt-muted uppercase tracking-wider mt-1 font-mono">{label}</p>
      {sub && <p className="text-[9px] text-txt-muted/60 font-mono mt-0.5">{sub}</p>}
    </div>
  );
}

function OverallScore({ analysis }: { analysis: AnalysisResult["analysis"] }) {
  const avg = Math.round(analysis.skillScores.reduce((s, c) => s + c.score, 0) / analysis.skillScores.length);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (avg / 100) * circumference;
  const color = avg >= 70 ? "#34d399" : avg >= 40 ? "#22d3ee" : "#fbbf24";
  return (
    <div className="card-gradient p-6 flex flex-col items-center justify-center">
      <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-4">Overall Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a2e" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-800 text-3xl text-txt-primary">{avg}</span>
          <span className="text-[9px] text-txt-muted font-mono uppercase">/ 100</span>
        </div>
      </div>
      <p className="text-xs text-txt-muted mt-3 text-center">Weighted average across all skill dimensions</p>
    </div>
  );
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params.username as string) || "";
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = useCallback(async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`/api/analyze?username=${encodeURIComponent(username)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setData(json);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }, [username]);

  useEffect(() => { if (username) fetchAnalysis(); }, [username, fetchAnalysis]);

  if (loading) return <LoadingState username={username} />;
  if (error) return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="spotlight fixed inset-0 pointer-events-none" />
      <div className="relative z-10 text-center max-w-md">
        <div className="text-4xl mb-4">✕</div>
        <h2 className="font-display font-700 text-xl text-txt-primary mb-2">Analysis Failed</h2>
        <p className="text-sm text-txt-secondary mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-accent-cyan/10 text-accent-cyan font-semibold text-sm rounded-xl border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all">← Try Another Username</button>
      </div>
    </div>
  );
  if (!data) return null;

  const { user, languages, analysis, activity, totalStars, totalForks, activeRepos } = data;

  return (
    <main className="relative min-h-screen grid-bg">
      <div className="spotlight fixed inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-8 animate-fade-up">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-txt-muted hover:text-accent-cyan transition-colors text-sm">
            <span>←</span><span className="font-display font-700 text-txt-primary">Dev<span className="gradient-text">Lens</span></span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/compare")} className="text-[10px] font-mono text-txt-muted hover:text-accent-violet transition-colors">Compare ⬡</button>
            <span className="text-[10px] font-mono text-txt-muted">Analyzed {new Date(data.analyzedAt).toLocaleString()}</span>
          </div>
        </nav>

        {/* Profile Header */}
        <section className="card-gradient p-6 sm:p-8 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-surface-4 ring-2 ring-accent-cyan/10 ring-offset-2 ring-offset-surface-0">
                <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-700 border ${
                analysis.careerLevel.includes("Senior") || analysis.careerLevel.includes("Staff") ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald" :
                analysis.careerLevel.includes("Mid") ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan" : "bg-accent-violet/10 border-accent-violet/30 text-accent-violet"
              }`}>{analysis.careerLevel}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <h1 className="font-display font-800 text-2xl text-txt-primary">{user.name || user.login}</h1>
                <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-txt-muted hover:text-accent-cyan transition-colors">@{user.login} ↗</a>
              </div>
              {user.bio && <p className="text-sm text-txt-secondary mb-2">{user.bio}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-txt-muted font-mono">
                {user.location && <span>📍 {user.location}</span>}
                {user.company && <span>🏢 {user.company}</span>}
                <span>👥 {user.followers} followers</span>
                <span>Joined {new Date(user.created_at).getFullYear()}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-mono">{analysis.specialization}</span>
                {analysis.strengths.slice(0, 3).map((s) => <span key={s} className="px-2.5 py-1 rounded-lg bg-surface-3 border border-surface-4 text-txt-secondary text-xs">{s}</span>)}
              </div>
              <div className="mt-4"><ExportReport data={data} /></div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <StatCard label="Repositories" value={user.public_repos} accent="cyan" />
          <StatCard label="Total Stars" value={totalStars} accent="amber" />
          <StatCard label="Total Forks" value={totalForks} accent="violet" />
          <StatCard label="Active (6mo)" value={activeRepos} accent="emerald" />
          <StatCard label="Day Streak" value={activity.streak} accent="rose" sub="consecutive" />
          <StatCard label="Events (90d)" value={activity.totalEvents} accent="cyan" sub="public" />
        </div>

        {/* AI Summary */}
        <section className="card-gradient p-6 mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider">AI Assessment</h3>
          </div>
          <p className="text-base text-txt-primary leading-relaxed">{analysis.summary}</p>
        </section>

        {/* Code Quality Insights (NEW - from actual code analysis) */}
        {analysis.codeInsights && (
          <section className="card-gradient p-6 mb-6 animate-fade-up" style={{ animationDelay: "0.22s" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent-violet text-sm">◆</span>
              <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider">Code Quality Insights</h3>
              <span className="ml-auto px-2 py-0.5 rounded-md text-[9px] font-mono bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">FROM CODE ANALYSIS</span>
            </div>
            <p className="text-sm text-txt-primary leading-relaxed">{analysis.codeInsights}</p>
          </section>
        )}

        {/* Score + Radar + Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <OverallScore analysis={analysis} />
          <SkillRadar skills={analysis.skillScores} />
          <LanguageBar languages={languages} />
        </div>

        {/* Activity */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.3s" }}><ActivityHeatmap activity={activity} /></div>

        {/* Repos */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.35s" }}><RepoGrid repos={analysis.topRepos} /></div>

        {/* Recommendations */}
        <section className="card-gradient p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-1">AI Recommendations</h3>
          <p className="text-xs text-txt-muted mb-4">Personalized growth roadmap based on code-level profile analysis</p>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface-2/50 border border-surface-4 hover:border-accent-cyan/15 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-mono font-700">{i + 1}</span>
                <p className="text-sm text-txt-primary leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8 space-y-3">
          <div className="flex justify-center gap-3">
            <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-surface-2 text-txt-secondary text-sm rounded-xl border border-surface-4 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all">Analyze Another →</button>
            <button onClick={() => router.push("/compare")} className="px-6 py-2.5 bg-accent-violet/10 text-accent-violet text-sm rounded-xl border border-accent-violet/20 hover:bg-accent-violet/20 transition-all">Compare Developers ⬡</button>
          </div>
          <p className="mt-4 text-[10px] text-txt-muted/50 font-mono">DevLens AI · Built with Next.js, Groq AI, GitHub API</p>
        </footer>
      </div>
    </main>
  );
}
