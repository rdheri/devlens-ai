"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/lib/types";
import AnimatedBackground from "@/components/AnimatedBackground";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

function CompareCard({ data, color }: { data: AnalysisResult; color: "cyan" | "violet" }) {
  const { user, analysis, totalStars, totalForks, activeRepos, activity } = data;
  const accent = color === "cyan" ? "text-accent-cyan" : "text-accent-violet";
  const border = color === "cyan" ? "border-accent-cyan/20" : "border-accent-violet/20";
  const bg = color === "cyan" ? "bg-accent-cyan/5" : "bg-accent-violet/5";
  return (
    <div className={`card-gradient p-5 ${border} border`}>
      <div className="flex items-center gap-3 mb-4">
        <img src={user.avatar_url} alt={user.login} className="w-12 h-12 rounded-xl border border-surface-4" />
        <div><h3 className={`font-display font-700 text-base ${accent}`}>{user.name || user.login}</h3><p className="text-xs font-mono text-txt-muted">@{user.login}</p></div>
      </div>
      <div className={`rounded-lg p-3 mb-3 ${bg}`}><p className="text-xs font-mono text-txt-secondary">{analysis.careerLevel} · {analysis.specialization}</p></div>
      <div className="grid grid-cols-2 gap-2 text-center">
        {[{l:"STARS",v:totalStars},{l:"REPOS",v:user.public_repos},{l:"FORKS",v:totalForks},{l:"ACTIVE",v:activeRepos},{l:"STREAK",v:activity.streak},{l:"FOLLOWERS",v:user.followers}].map(s=>
          <div key={s.l} className="p-2 bg-surface-2 rounded-lg"><p className={`font-mono font-700 ${accent}`}>{s.v}</p><p className="text-[9px] text-txt-muted font-mono">{s.l}</p></div>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        {analysis.strengths.slice(0, 3).map((s) => <div key={s} className="text-[11px] text-txt-secondary px-2 py-1 bg-surface-2 rounded-md">✦ {s}</div>)}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [data, setData] = useState<{ user1: AnalysisResult; user2: AnalysisResult } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(async () => {
    if (!user1.trim() || !user2.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/compare?user1=${encodeURIComponent(user1.trim())}&user2=${encodeURIComponent(user2.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Comparison failed");
    } finally { setLoading(false); }
  }, [user1, user2]);

  const radarData = data ? data.user1.analysis.skillScores.map((s, i) => ({ subject: s.category, user1: s.score, user2: data.user2.analysis.skillScores[i]?.score ?? 0 })) : [];

  return (
    <main className="relative min-h-screen grid-bg">
      <AnimatedBackground /><div className="spotlight fixed inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center justify-between mb-10">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-txt-muted hover:text-accent-cyan transition-colors text-sm"><span>←</span><span className="font-display font-700 text-txt-primary">Dev<span className="gradient-text">Lens</span></span></button>
          <span className="px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet text-xs font-mono">Compare Mode</span>
        </nav>
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="font-display font-800 text-3xl text-center text-txt-primary mb-2">Compare <span className="gradient-text">Developers</span></h1>
          <p className="text-center text-sm text-txt-secondary mb-8">Side-by-side AI-powered skill comparison with deep code analysis</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted text-sm">@</span><input type="text" value={user1} onChange={(e) => setUser1(e.target.value)} placeholder="first username" className="w-full bg-surface-1 border border-surface-4 rounded-xl pl-8 pr-4 py-3 text-sm text-txt-primary placeholder:text-txt-muted/50 outline-none focus:border-accent-cyan/40 font-mono" /></div>
            <span className="text-txt-muted self-center text-lg font-display font-700">vs</span>
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted text-sm">@</span><input type="text" value={user2} onChange={(e) => setUser2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCompare()} placeholder="second username" className="w-full bg-surface-1 border border-surface-4 rounded-xl pl-8 pr-4 py-3 text-sm text-txt-primary placeholder:text-txt-muted/50 outline-none focus:border-accent-violet/40 font-mono" /></div>
          </div>
          <div className="text-center mt-4">
            <button onClick={handleCompare} disabled={!user1.trim() || !user2.trim() || loading} className="px-8 py-2.5 bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 text-txt-primary font-semibold text-sm rounded-xl border border-accent-cyan/20 hover:border-accent-violet/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              {loading ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>Analyzing Both...</span> : "Compare →"}
            </button>
          </div>
          {error && <p className="text-center text-accent-rose text-sm mt-3">{error}</p>}
        </div>
        {data && (
          <div className="space-y-6 animate-fade-up">
            <div className="card-gradient p-6">
              <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-1 text-center">Skill Comparison</h3>
              <p className="text-xs text-txt-muted mb-4 text-center">Overlaid radar from deep code analysis</p>
              <div className="w-full max-w-[400px] aspect-square mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                    <PolarGrid stroke="#1a1a2e" /><PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} /><PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={data.user1.user.login} dataKey="user1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={2} />
                    <Radar name={data.user2.user.login} dataKey="user2" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><CompareCard data={data.user1} color="cyan" /><CompareCard data={data.user2} color="violet" /></div>
            <div className="card-gradient p-6">
              <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                {data.user1.analysis.skillScores.map((s, i) => {
                  const s2 = data.user2.analysis.skillScores[i];
                  const maxScore = Math.max(s.score, s2?.score ?? 0, 1);
                  return (
                    <div key={s.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-txt-muted w-20">{s.category}</span>
                        <div className="flex-1 flex items-center gap-2 mx-3">
                          <span className="text-xs font-mono text-accent-cyan w-8 text-right">{s.score}</span>
                          <div className="flex-1 flex h-2 gap-0.5">
                            <div className="flex-1 bg-surface-3 rounded-l-full overflow-hidden flex justify-end"><div className="h-full bg-accent-cyan/60 rounded-l-full" style={{ width: `${(s.score / maxScore) * 100}%` }} /></div>
                            <div className="flex-1 bg-surface-3 rounded-r-full overflow-hidden"><div className="h-full bg-accent-violet/60 rounded-r-full" style={{ width: `${((s2?.score ?? 0) / maxScore) * 100}%` }} /></div>
                          </div>
                          <span className="text-xs font-mono text-accent-violet w-8">{s2?.score ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
