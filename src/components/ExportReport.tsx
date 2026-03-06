"use client";

import { AnalysisResult } from "@/lib/types";
import { useState } from "react";

interface Props {
  data: AnalysisResult;
}

export default function ExportReport({ data }: Props) {
  const { user, analysis, languages, activity, totalStars, totalForks, activeRepos } = data;
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW = 210;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      // Colors
      const cyan = [34, 211, 238] as [number, number, number];
      const emerald = [52, 211, 153] as [number, number, number];
      const violet = [167, 139, 250] as [number, number, number];
      const dark = [6, 6, 10] as [number, number, number];
      const surface1 = [12, 12, 20] as [number, number, number];
      const surface3 = [26, 26, 46] as [number, number, number];
      const textPrimary = [226, 232, 240] as [number, number, number];
      const textSecondary = [148, 163, 184] as [number, number, number];
      const textMuted = [100, 116, 139] as [number, number, number];

      // Background
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageW, 297, "F");

      // Header bar
      doc.setFillColor(...surface1);
      doc.rect(0, 0, pageW, 42, "F");

      // Brand
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textPrimary);
      doc.text("DevLens", margin, 16);
      doc.setTextColor(...cyan);
      doc.text("AI", margin + 30, 16);

      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text("DEVELOPER PORTFOLIO INTELLIGENCE", margin, 22);

      doc.setFontSize(8);
      doc.text(`Generated ${new Date(data.analyzedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageW - margin, 16, { align: "right" });
      doc.text("devlens-ai.vercel.app", pageW - margin, 22, { align: "right" });

      // Career level badge
      doc.setFillColor(...surface3);
      const badgeText = analysis.careerLevel;
      const badgeW = doc.getTextWidth(badgeText) + 8;
      doc.roundedRect(pageW - margin - badgeW, 28, badgeW, 7, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(...cyan);
      doc.text(badgeText, pageW - margin - badgeW / 2, 32.5, { align: "center" });

      // Name + username
      y = 32;
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text(`@${user.login}`, margin, y);

      doc.setFontSize(16);
      doc.setTextColor(...textPrimary);
      doc.setFont("helvetica", "bold");
      y += 8;
      doc.text(user.name || user.login, margin, y);

      // Specialization
      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(...cyan);
      doc.text(analysis.specialization, margin, y);

      // Stats boxes
      y += 10;
      const statsBoxW = contentW / 6;
      const stats = [
        { label: "REPOS", value: String(user.public_repos), color: cyan },
        { label: "STARS", value: String(totalStars), color: [251, 191, 36] as [number, number, number] },
        { label: "FORKS", value: String(totalForks), color: violet },
        { label: "ACTIVE", value: String(activeRepos), color: emerald },
        { label: "STREAK", value: `${activity.streak}d`, color: [251, 113, 133] as [number, number, number] },
        { label: "EVENTS", value: String(activity.totalEvents), color: cyan },
      ];

      stats.forEach((s, i) => {
        const x = margin + i * statsBoxW;
        doc.setFillColor(...surface1);
        doc.roundedRect(x + 1, y, statsBoxW - 2, 16, 2, 2, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...(s.color as [number, number, number]));
        doc.text(s.value, x + statsBoxW / 2, y + 7, { align: "center" });
        doc.setFontSize(5);
        doc.setTextColor(...textMuted);
        doc.text(s.label, x + statsBoxW / 2, y + 12, { align: "center" });
      });

      // AI Summary
      y += 24;
      doc.setFillColor(...surface1);
      doc.roundedRect(margin, y, contentW, 24, 3, 3, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...emerald);
      doc.text("● AI ASSESSMENT", margin + 5, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...textPrimary);
      const summaryLines = doc.splitTextToSize(analysis.summary, contentW - 10);
      doc.text(summaryLines.slice(0, 3), margin + 5, y + 10);

      // Code Quality Insights
      if (analysis.codeInsights) {
        y += 30;
        doc.setFillColor(...surface1);
        doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...violet);
        doc.text("◆ CODE QUALITY INSIGHTS", margin + 5, y + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...textSecondary);
        const insightLines = doc.splitTextToSize(analysis.codeInsights, contentW - 10);
        doc.text(insightLines.slice(0, 2), margin + 5, y + 10.5);
        y += 22;
      } else {
        y += 30;
      }

      // Skill scores as horizontal bars
      y += 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("SKILL SCORES", margin, y);
      y += 5;

      const barW = contentW * 0.55;
      analysis.skillScores.forEach((s) => {
        doc.setFontSize(7);
        doc.setTextColor(...textSecondary);
        doc.text(s.category, margin, y + 3);

        // Bar background
        const barX = margin + 30;
        doc.setFillColor(...surface3);
        doc.roundedRect(barX, y, barW, 4, 1, 1, "F");

        // Bar fill
        const fillW = (s.score / 100) * barW;
        const barColor = s.score >= 70 ? emerald : s.score >= 40 ? cyan : textMuted;
        doc.setFillColor(...barColor);
        doc.roundedRect(barX, y, fillW, 4, 1, 1, "F");

        // Score value
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...barColor);
        doc.text(String(s.score), barX + barW + 4, y + 3);

        y += 7;
      });

      // Strengths
      y += 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("STRENGTHS", margin, y);
      y += 5;

      analysis.strengths.forEach((s) => {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textSecondary);
        doc.text(`✦  ${s}`, margin + 2, y);
        y += 5;
      });

      // Languages
      y += 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("LANGUAGES", margin, y);
      y += 5;

      languages.slice(0, 6).forEach((l) => {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textSecondary);
        doc.text(`${l.name}`, margin + 2, y);
        doc.setTextColor(...textMuted);
        doc.text(`${l.percentage}%`, margin + 40, y);
        y += 4.5;
      });

      // Recommendations
      y += 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("RECOMMENDATIONS", margin, y);
      y += 5;

      analysis.recommendations.forEach((r, i) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...cyan);
        doc.text(`${i + 1}`, margin + 2, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textSecondary);
        const recLines = doc.splitTextToSize(r, contentW - 12);
        doc.text(recLines[0], margin + 8, y);
        y += 5;
      });

      // Footer
      doc.setFontSize(6);
      doc.setTextColor(50, 50, 70);
      doc.text("Generated by DevLens AI — devlens-ai.vercel.app", pageW / 2, 290, { align: "center" });

      doc.save(`devlens-report-${user.login}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/analyze/${user.login}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={generatePDF}
        disabled={generating}
        className="group flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 text-accent-cyan text-xs font-semibold rounded-xl border border-accent-cyan/20 hover:bg-accent-cyan/20 hover:border-accent-cyan/40 disabled:opacity-50 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {generating ? "Generating PDF..." : "Download PDF Report"}
      </button>
      <button
        onClick={copyShareLink}
        className="group flex items-center gap-2 px-4 py-2 bg-surface-2 text-txt-secondary text-xs font-semibold rounded-xl border border-surface-4 hover:border-accent-violet/30 hover:text-accent-violet transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Copy Share Link
      </button>
    </div>
  );
}
