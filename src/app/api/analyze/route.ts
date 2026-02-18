import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser, fetchGitHubRepos, computeLanguageStats, computeRepoMetrics } from "@/lib/github";
import { analyzeProfile } from "@/lib/ai";
import { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

// Simple in-memory cache (persists within serverless function lifecycle)
const cache = new Map<string, { data: AnalysisResult; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  // Sanitize
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
  if (!cleanUsername || cleanUsername.length > 39) {
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(cleanUsername.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // 1. Fetch GitHub data
    const [user, repos] = await Promise.all([
      fetchGitHubUser(cleanUsername),
      fetchGitHubRepos(cleanUsername),
    ]);

    if (repos.length === 0) {
      return NextResponse.json(
        { error: "This user has no public repositories to analyze" },
        { status: 400 }
      );
    }

    // 2. Compute statistics
    const languages = computeLanguageStats(repos);
    const { totalStars, totalForks, activeRepos } = computeRepoMetrics(repos);

    // 3. AI Analysis
    const analysis = await analyzeProfile(user, repos, languages);

    // 4. Build result
    const result: AnalysisResult = {
      user,
      languages,
      analysis,
      totalStars,
      totalForks,
      activeRepos,
      analyzedAt: new Date().toISOString(),
    };

    // Cache result
    cache.set(cleanUsername.toLowerCase(), { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = message.includes("not found") ? 404 : message.includes("rate limit") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
