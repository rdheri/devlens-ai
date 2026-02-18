"use client";

import { LanguageStat } from "@/lib/types";

interface Props {
  languages: LanguageStat[];
}

export default function LanguageBar({ languages }: Props) {
  const maxCount = Math.max(...languages.map((l) => l.count));

  return (
    <div className="card-gradient p-6">
      <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-1">
        Language Distribution
      </h3>
      <p className="text-xs text-txt-muted mb-5">
        Across all public repositories
      </p>
      <div className="space-y-3">
        {languages.map((lang, i) => (
          <div key={lang.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-sm text-txt-primary font-500">
                  {lang.name}
                </span>
              </div>
              <span className="text-xs font-mono text-txt-muted">
                {lang.percentage}% · {lang.count} repos
              </span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full score-bar transition-all duration-1000"
                style={{
                  width: `${(lang.count / maxCount) * 100}%`,
                  backgroundColor: lang.color,
                  transitionDelay: `${i * 80}ms`,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
