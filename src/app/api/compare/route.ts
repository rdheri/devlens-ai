import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, computeLanguageStats, computeRepoMetrics, computeActivityData } from "@/lib/github";
import { analyzeProfile } from "@/lib/ai";
import { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

async function analyzeUser(username: string): Promise<AnalysisResult> {
  const [user, repos, events] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
    fetchGitHubEvents(username),
  ]);

  if (repos.length === 0) throw new Error(`${username} has no public repositories`);

  const languages = computeLanguageStats(repos);
  const { totalStars, totalForks, activeRepos } = computeRepoMetrics(repos);
  const activity = computeActivityData(events);
  const analysis = await analyzeProfile(user, repos, languages);

  return { user, languages, analysis, activity, totalStars, totalForks, activeRepos, analyzedAt: new Date().toISOString() };
}

export async function GET(request: NextRequest) {
  const user1 = request.nextUrl.searchParams.get("user1");
  const user2 = request.nextUrl.searchParams.get("user2");

  if (!user1 || !user2) {
    return NextResponse.json({ error: "Two usernames are required" }, { status: 400 });
  }

  const clean1 = user1.trim().replace(/[^a-zA-Z0-9-]/g, "");
  const clean2 = user2.trim().replace(/[^a-zA-Z0-9-]/g, "");

  if (!clean1 || !clean2) {
    return NextResponse.json({ error: "Invalid usernames" }, { status: 400 });
  }

  try {
    const [result1, result2] = await Promise.all([
      analyzeUser(clean1),
      analyzeUser(clean2),
    ]);

    return NextResponse.json({ user1: result1, user2: result2 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
