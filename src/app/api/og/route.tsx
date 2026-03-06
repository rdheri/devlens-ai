import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") || "developer";
  const name = request.nextUrl.searchParams.get("name") || username;
  const level = request.nextUrl.searchParams.get("level") || "Developer";
  const spec = request.nextUrl.searchParams.get("spec") || "Software Engineering";
  const score = request.nextUrl.searchParams.get("score") || "–";
  const stars = request.nextUrl.searchParams.get("stars") || "0";
  const repos = request.nextUrl.searchParams.get("repos") || "0";
  const streak = request.nextUrl.searchParams.get("streak") || "0";
  const langs = request.nextUrl.searchParams.get("langs") || "";

  const langList = langs ? langs.split(",").slice(0, 5) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#06060a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top spotlight */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 70px",
            position: "relative",
            flex: 1,
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#e2e8f0" }}>Dev</span>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#22d3ee" }}>Lens</span>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#34d399" }}>AI</span>
            </div>
            {/* Score circle */}
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                border: "3px solid #22d3ee",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(34,211,238,0.05)",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#22d3ee" }}>{score}</span>
              <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Score</span>
            </div>
          </div>

          {/* Profile */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src={`https://avatars.githubusercontent.com/${username}`}
                width="80"
                height="80"
                style={{ borderRadius: "16px", border: "2px solid #24243a" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "42px", fontWeight: 800, color: "#e2e8f0", lineHeight: 1.1 }}>{name}</span>
                <span style={{ fontSize: "18px", color: "#64748b", fontFamily: "monospace" }}>@{username}</span>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <span
                style={{
                  padding: "6px 16px",
                  borderRadius: "10px",
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.25)",
                  color: "#22d3ee",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {level}
              </span>
              <span
                style={{
                  padding: "6px 16px",
                  borderRadius: "10px",
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  color: "#a78bfa",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {spec}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "auto",
              paddingTop: "30px",
            }}
          >
            {[
              { label: "STARS", value: stars, color: "#fbbf24" },
              { label: "REPOS", value: repos, color: "#22d3ee" },
              { label: "STREAK", value: `${streak}d`, color: "#fb7185" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  background: "#0c0c14",
                  border: "1px solid #1a1a2e",
                }}
              >
                <span style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: "9px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>{s.label}</span>
              </div>
            ))}

            {/* Languages */}
            {langList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  background: "#0c0c14",
                  border: "1px solid #1a1a2e",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "9px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>TOP LANGUAGES</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {langList.map((lang) => (
                    <span key={lang} style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
