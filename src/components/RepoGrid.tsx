"use client";
import { RepoScore } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "today"; if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`; return `${Math.floor(days / 365)}y ago`;
}
function scoreColor(s: number) { return s >= 80 ? "text-accent-emerald" : s >= 60 ? "text-accent-cyan" : s >= 40 ? "text-accent-amber" : "text-txt-muted"; }
function scoreBg(s: number) { return s >= 80 ? "bg-accent-emerald/10 border-accent-emerald/20" : s >= 60 ? "bg-accent-cyan/10 border-accent-cyan/20" : s >= 40 ? "bg-accent-amber/10 border-accent-amber/20" : "bg-surface-3 border-surface-4"; }

export default function RepoGrid({ repos }: { repos: RepoScore[] }) {
  return (
    <div className="card-gradient p-6">
      <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-1">Top Repositories</h3>
      <p className="text-xs text-txt-muted mb-5">Scored by code analysis: tests, CI/CD, docs, activity & community signals</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
        {repos.map((repo) => (
          <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" className="group block p-4 bg-surface-2/50 rounded-xl border border-surface-4 hover:border-accent-cyan/20 transition-all duration-200 hover:bg-surface-2">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h4 className="text-sm font-mono font-500 text-txt-primary group-hover:text-accent-cyan transition-colors truncate">{repo.name}</h4>
                {repo.language && <span className="text-[10px] text-txt-muted font-mono uppercase tracking-wider">{repo.language}</span>}
              </div>
              <div className={`flex-shrink-0 px-2 py-0.5 rounded-md border text-xs font-mono font-600 ${scoreBg(repo.qualityScore)} ${scoreColor(repo.qualityScore)}`}>{repo.qualityScore}</div>
            </div>
            {repo.description && <p className="text-xs text-txt-muted leading-relaxed line-clamp-2 mb-2.5">{repo.description}</p>}
            <div className="flex items-center gap-3 text-[10px] text-txt-muted font-mono">
              {repo.stars > 0 && <span>★ {repo.stars}</span>} {repo.forks > 0 && <span>⑂ {repo.forks}</span>}
              <span className="ml-auto">{timeAgo(repo.lastActive)}</span>
            </div>
            {repo.topics.length > 0 && <div className="flex flex-wrap gap-1 mt-2.5">{repo.topics.map((t) => <span key={t} className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface-3 text-txt-muted">{t}</span>)}</div>}
          </a>
        ))}
      </div>
    </div>
  );
}
