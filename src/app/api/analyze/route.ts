import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, computeLanguageStats, computeRepoMetrics, computeActivityData } from "@/lib/github";
import { analyzeProfile } from "@/lib/ai";
import { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

const cache = new Map<string, { data: AnalysisResult; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60;

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
  if (!cleanUsername || cleanUsername.length > 39) {
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
  }

  const cached = cache.get(cleanUsername.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const [user, repos, events] = await Promise.all([
      fetchGitHubUser(cleanUsername),
      fetchGitHubRepos(cleanUsername),
      fetchGitHubEvents(cleanUsername),
    ]);

    if (repos.length === 0) {
      return NextResponse.json(
        { error: "This user has no public repositories to analyze" },
        { status: 400 }
      );
    }

    const languages = computeLanguageStats(repos);
    const { totalStars, totalForks, activeRepos } = computeRepoMetrics(repos);
    const activity = computeActivityData(events);
    const analysis = await analyzeProfile(user, repos, languages);

    const result: AnalysisResult = {
      user,
      languages,
      analysis,
      activity,
      totalStars,
      totalForks,
      activeRepos,
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
