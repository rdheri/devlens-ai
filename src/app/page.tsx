"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";

const FEATURES = [
  { icon: "◆", title: "Deep Code Analysis", desc: "Scans actual file trees, READMEs, test suites, CI/CD configs, and Docker files — not just repo metadata." },
  { icon: "⬡", title: "Activity Intelligence", desc: "90-day heatmap with streak tracking, peak coding hours, and weekly contribution rhythm analysis." },
  { icon: "△", title: "Career Roadmap", desc: "AI generates personalized skill development recommendations based on current trajectory and evidence gaps." },
  { icon: "◈", title: "Compare Mode", desc: "Side-by-side developer comparison with overlaid skill radars and metric breakdowns. Built for hiring teams." },
];

const VALUE_PROPS = [
  { label: "Open Source", icon: "◇" },
  { label: "No Sign-Up", icon: "△" },
  { label: "PDF Reports", icon: "◆" },
];

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleAnalyze = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setIsNavigating(true);
    router.push(`/analyze/${encodeURIComponent(trimmed)}`);
  }, [username, router]);

  return (
    <main className="relative min-h-screen grid-bg">
      <AnimatedBackground />
      <div className="spotlight fixed inset-0 pointer-events-none" />

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        {/* Badge */}
        <div className="animate-fade-up mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-surface-4 bg-surface-1/80 backdrop-blur text-xs font-mono text-txt-secondary tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            AI-Powered · Code-Level Analysis
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up font-display font-800 text-center leading-[0.95] tracking-tight" style={{ animationDelay: "0.1s" }}>
          <span className="block text-5xl sm:text-7xl lg:text-8xl text-txt-primary">Dev<span className="gradient-text">Lens</span></span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl text-txt-secondary font-500 mt-3 tracking-normal">Developer Portfolio Intelligence</span>
        </h1>

        <p className="animate-fade-up max-w-xl text-center text-txt-secondary text-base sm:text-lg mt-6 leading-relaxed font-light" style={{ animationDelay: "0.2s" }}>
          Enter any GitHub username. Our AI analyzes actual code content, tests, CI/CD configurations, and contribution patterns to generate a comprehensive developer profile.
        </p>

        {/* Search */}
        <div className="animate-fade-up mt-10 w-full max-w-lg" style={{ animationDelay: "0.3s" }}>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan/30 via-accent-emerald/20 to-accent-violet/30 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-surface-1 border border-surface-4 rounded-2xl overflow-hidden focus-within:border-accent-cyan/40 transition-colors">
              <span className="pl-5 text-txt-muted text-lg">github.com/</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} placeholder="username" className="flex-1 bg-transparent px-1 py-4 text-lg text-txt-primary placeholder:text-txt-muted/50 outline-none font-mono" autoFocus spellCheck={false} />
              <button onClick={handleAnalyze} disabled={!username.trim() || isNavigating} className="mr-2 px-6 py-2.5 bg-accent-cyan/10 text-accent-cyan font-semibold text-sm rounded-xl border border-accent-cyan/20 hover:bg-accent-cyan/20 hover:border-accent-cyan/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap">
                {isNavigating ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>Analyzing</span> : "Analyze →"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-txt-muted">
            <span>Try:</span>
            {["torvalds", "sindresorhus", "tj"].map((name) => (
              <button key={name} onClick={() => { setUsername(name); setIsNavigating(true); router.push(`/analyze/${name}`); }} className="px-2.5 py-1 rounded-lg bg-surface-2 border border-surface-4 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all font-mono">{name}</button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button onClick={() => router.push("/compare")} className="text-xs text-txt-muted hover:text-accent-violet transition-colors font-mono">⬡ Compare two developers side-by-side →</button>
          </div>
        </div>

        {/* Value props (honest, not fake counters) */}
        <div className="animate-fade-up flex items-center justify-center gap-8 mt-14" style={{ animationDelay: "0.4s" }}>
          {VALUE_PROPS.map((v) => (
            <div key={v.label} className="flex items-center gap-2 text-txt-muted">
              <span className="text-accent-cyan text-xs">{v.icon}</span>
              <span className="text-xs font-mono">{v.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl w-full" style={{ animationDelay: "0.5s" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card-gradient p-5 group hover:scale-[1.02] transition-transform duration-300">
              <div className="text-accent-cyan text-xl mb-3 group-hover:text-glow-cyan transition-all">{f.icon}</div>
              <h3 className="font-display font-600 text-sm text-txt-primary mb-1.5">{f.title}</h3>
              <p className="text-xs text-txt-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="animate-fade-up mt-16 text-xs text-txt-muted/60 font-mono" style={{ animationDelay: "0.6s" }}>
          Built with Next.js · Groq AI (Llama 3.3 70B) · GitHub API · Recharts
        </p>
      </section>
    </main>
  );
}
