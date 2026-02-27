"use client";

import { ActivityData } from "@/lib/types";

interface Props {
  activity: ActivityData;
}

const LEVEL_COLORS = [
  "bg-surface-3",        // 0 - no activity
  "bg-accent-emerald/20", // 1
  "bg-accent-emerald/40", // 2
  "bg-accent-emerald/65", // 3
  "bg-accent-emerald",    // 4 - max
];

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ActivityHeatmap({ activity }: Props) {
  const { heatmap, totalEvents, streak, busiestDay, peakHour, weekdayDistribution } = activity;

  // Group heatmap days into weeks (columns) for a GitHub-style grid
  // First, pad to start on a Sunday
  const firstDate = heatmap.length > 0 ? new Date(heatmap[0].date) : new Date();
  const firstDayOfWeek = firstDate.getUTCDay(); // 0=Sun
  const padded = [
    ...Array.from({ length: firstDayOfWeek }, () => ({ date: "", count: 0, level: 0 as const })),
    ...heatmap,
  ];

  // Group into weeks
  const weeks: typeof padded[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Get month labels for the top axis
  const monthMarkers: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    for (const day of week) {
      if (day.date) {
        const m = new Date(day.date).getUTCMonth();
        if (m !== lastMonth) {
          monthMarkers.push({ label: MONTH_LABELS[m], col: colIdx });
          lastMonth = m;
        }
        break;
      }
    }
  });

  const formatHour = (h: number) => {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxWeekday = Math.max(...weekdayDistribution, 1);

  return (
    <div className="card-gradient p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider">
          Activity Heatmap
        </h3>
        <span className="text-[10px] font-mono text-txt-muted">Last 90 days</span>
      </div>
      <p className="text-xs text-txt-muted mb-5">
        Public contribution events from GitHub
      </p>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-[28px]">
          {monthMarkers.map((m, i) => (
            <span
              key={i}
              className="text-[9px] text-txt-muted font-mono"
              style={{ marginLeft: i === 0 ? `${m.col * 13}px` : `${(m.col - (monthMarkers[i - 1]?.col ?? 0) - 1) * 13}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-0.5">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span key={i} className="text-[9px] text-txt-muted font-mono h-[10px] flex items-center leading-none">
                {d}
              </span>
            ))}
          </div>
          {/* Grid */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[3px]">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-[10px] h-[10px] rounded-[2px] ${day.date ? LEVEL_COLORS[day.level] : "bg-transparent"} transition-colors hover:ring-1 hover:ring-accent-cyan/50`}
                  title={day.date ? `${day.date}: ${day.count} events` : ""}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-[28px]">
          <span className="text-[9px] text-txt-muted font-mono mr-1">Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
          ))}
          <span className="text-[9px] text-txt-muted font-mono ml-1">More</span>
        </div>
      </div>

      {/* Activity stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-surface-3">
        <div className="text-center">
          <p className="font-mono font-700 text-lg text-accent-emerald">{totalEvents}</p>
          <p className="text-[10px] text-txt-muted font-mono uppercase mt-0.5">Events</p>
        </div>
        <div className="text-center">
          <p className="font-mono font-700 text-lg text-accent-cyan">{streak}</p>
          <p className="text-[10px] text-txt-muted font-mono uppercase mt-0.5">Day Streak</p>
        </div>
        <div className="text-center">
          <p className="font-mono font-700 text-lg text-accent-violet">{busiestDay.slice(0, 3)}</p>
          <p className="text-[10px] text-txt-muted font-mono uppercase mt-0.5">Busiest Day</p>
        </div>
        <div className="text-center">
          <p className="font-mono font-700 text-lg text-accent-amber">{formatHour(peakHour)}</p>
          <p className="text-[10px] text-txt-muted font-mono uppercase mt-0.5">Peak Hour</p>
        </div>
      </div>

      {/* Weekday distribution mini bars */}
      <div className="mt-4 pt-4 border-t border-surface-3">
        <p className="text-[10px] text-txt-muted font-mono uppercase mb-2">Weekly Pattern</p>
        <div className="flex items-end gap-1.5 h-10">
          {weekdayDistribution.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-accent-cyan/40 transition-all hover:bg-accent-cyan/60"
                style={{ height: `${(count / maxWeekday) * 100}%`, minHeight: count > 0 ? "3px" : "1px" }}
              />
              <span className="text-[8px] text-txt-muted font-mono">{dayNames[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
