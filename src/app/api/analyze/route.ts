import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, fetchRepoCodeInsights, computeLanguageStats, computeRepoMetrics, computeActivityData } from "@/lib/github";
import { analyzeProfile } from "@/lib/ai";
import { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

// In-memory cache
const cache = new Map<string, { data: AnalysisResult; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Rate limiting: max requests per IP per window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests
const RATE_WINDOW = 1000 * 60 * 15; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const username = request.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
  if (!cleanUsername || cleanUsername.length > 39) return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });

  const cached = cache.get(cleanUsername.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return NextResponse.json(cached.data);

  try {
    const [user, repos, events] = await Promise.all([
      fetchGitHubUser(cleanUsername),
      fetchGitHubRepos(cleanUsername),
      fetchGitHubEvents(cleanUsername),
    ]);

    if (repos.length === 0) return NextResponse.json({ error: "This user has no public repositories to analyze" }, { status: 400 });

    const languages = computeLanguageStats(repos);
    const { totalStars, totalForks, activeRepos } = computeRepoMetrics(repos);
    const activity = computeActivityData(events);
    const codeInsights = await fetchRepoCodeInsights(repos);
    const analysis = await analyzeProfile(user, repos, languages, codeInsights);

    const result: AnalysisResult = {
      user, languages, analysis, activity, totalStars, totalForks, activeRepos,
      analyzedAt: new Date().toISOString(),
    };

    cache.set(cleanUsername.toLowerCase(), { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = message.includes("not found") ? 404 : message.includes("rate limit") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
