"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { SkillScore } from "@/lib/types";

interface Props {
  skills: SkillScore[];
}

export default function SkillRadar({ skills }: Props) {
  const data = skills.map((s) => ({
    subject: s.category,
    value: s.score,
    fullMark: 100,
  }));

  return (
    <div className="card-gradient p-6">
      <h3 className="font-display font-600 text-sm text-txt-secondary uppercase tracking-wider mb-1">
        Skill Mapping
      </h3>
      <p className="text-xs text-txt-muted mb-4">
        AI-scored across 6 engineering dimensions
      </p>
      <div className="w-full aspect-square max-w-[320px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#1a1a2e" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "DM Sans" }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="#22d3ee"
              fillOpacity={0.12}
              dot={{
                r: 4,
                fill: "#22d3ee",
                stroke: "#06060a",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Skill values */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
        {skills.map((s) => (
          <div key={s.category} className="flex items-center justify-between">
            <span className="text-xs text-txt-muted">{s.category}</span>
            <span
              className={`text-xs font-mono font-600 ${
                s.score >= 70
                  ? "text-accent-emerald"
                  : s.score >= 40
                    ? "text-accent-cyan"
                    : "text-txt-muted"
              }`}
            >
              {s.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
