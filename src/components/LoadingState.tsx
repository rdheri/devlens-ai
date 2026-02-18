"use client";

import { useState, useEffect } from "react";

const PHASES = [
  { msg: "Connecting to GitHub API...", icon: "◇" },
  { msg: "Fetching repositories...", icon: "◆" },
  { msg: "Analyzing language distribution...", icon: "⬡" },
  { msg: "Running AI skill assessment...", icon: "△" },
  { msg: "Scoring code quality...", icon: "◈" },
  { msg: "Generating career insights...", icon: "▽" },
];

export default function LoadingState({ username }: { username: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p < PHASES.length - 1 ? p + 1 : p));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="spotlight fixed inset-0 pointer-events-none" />
      <div className="relative z-10 text-center max-w-md">
        {/* Pulsing orb */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-accent-cyan/5 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-accent-cyan/10 animate-pulse-slow" />
          <div className="absolute inset-4 rounded-full bg-surface-2 border border-accent-cyan/20 flex items-center justify-center">
            <span className="text-accent-cyan text-xl animate-pulse">
              {PHASES[phase].icon}
            </span>
          </div>
        </div>

        <h2 className="font-display font-700 text-xl text-txt-primary mb-2">
          Analyzing{" "}
          <span className="text-accent-cyan font-mono">{username}</span>
        </h2>

        {/* Phase messages */}
        <div className="h-6 mb-6">
          <p className="text-sm text-txt-secondary animate-fade-in" key={phase}>
            {PHASES[phase].msg}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-emerald rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
          />
        </div>

        {/* Skeleton preview */}
        <div className="mt-10 space-y-3 opacity-40">
          <div className="h-4 shimmer rounded w-3/4 mx-auto" />
          <div className="h-4 shimmer rounded w-1/2 mx-auto" />
          <div className="h-4 shimmer rounded w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
