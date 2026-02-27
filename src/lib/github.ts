import { GitHubUser, GitHubRepo, GitHubEvent, LanguageStat, ActivityData, ActivityDay } from "./types";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00add8",
  Rust: "#dea584",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  PHP: "#4f5d95",
  "C#": "#178600",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00b4ab",
  Scala: "#c22d40",
  R: "#198ce7",
  Lua: "#000080",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Jupyter: "#f37626",
  "Jupyter Notebook": "#f37626",
};

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    h["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error("GitHub user not found");
    if (res.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later.");
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  return ghFetch<GitHubUser>(`https://api.github.com/users/${username}`);
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (page <= 3) {
    const repos = await ghFetch<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=pushed&type=owner`
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  return allRepos.filter((r) => !r.fork && !r.archived);
}

export async function fetchGitHubEvents(username: string): Promise<GitHubEvent[]> {
  const allEvents: GitHubEvent[] = [];
  // GitHub Events API returns max 10 pages of 30 events (300 events, ~90 days)
  for (let page = 1; page <= 10; page++) {
    try {
      const events = await ghFetch<GitHubEvent[]>(
        `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`
      );
      allEvents.push(...events);
      if (events.length < 100) break;
    } catch {
      break; // Events API can 404 for some users
    }
  }
  return allEvents;
}

export function computeActivityData(events: GitHubEvent[]): ActivityData {
  const dayMap: Record<string, number> = {};
  const weekdayDist = [0, 0, 0, 0, 0, 0, 0];
  const hourDist = new Array(24).fill(0);

  // Fill last 90 days with 0s
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dayMap[key] = 0;
  }

  for (const event of events) {
    const date = new Date(event.created_at);
    const key = date.toISOString().split("T")[0];
    if (dayMap[key] !== undefined) {
      dayMap[key]++;
    }
    weekdayDist[date.getUTCDay()]++;
    hourDist[date.getUTCHours()]++;
  }

  // Compute intensity levels
  const counts = Object.values(dayMap);
  const maxCount = Math.max(...counts, 1);

  const heatmap: ActivityDay[] = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      count,
      level: count === 0
        ? 0
        : count <= maxCount * 0.25
          ? 1
          : count <= maxCount * 0.5
            ? 2
            : count <= maxCount * 0.75
              ? 3
              : 4,
    })) as ActivityDay[];

  // Compute current streak
  let streak = 0;
  const sortedDays = [...heatmap].reverse();
  // Start from yesterday (today might not be over)
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i].count > 0) streak++;
    else break;
  }
  // If today has activity, add it
  if (sortedDays[0]?.count > 0) streak++;

  // Busiest day
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const busiestDayIdx = weekdayDist.indexOf(Math.max(...weekdayDist));

  // Peak hour
  const peakHour = hourDist.indexOf(Math.max(...hourDist));

  return {
    heatmap,
    totalEvents: events.length,
    streak,
    busiestDay: dayNames[busiestDayIdx],
    weekdayDistribution: weekdayDist,
    peakHour,
  };
}

export function computeLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const langCount: Record<string, number> = {};
  let total = 0;

  for (const repo of repos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      total++;
    }
  }

  return Object.entries(langCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: LANGUAGE_COLORS[name] || "#6b7280",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function computeRepoMetrics(repos: GitHubRepo[]) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const activeRepos = repos.filter(
    (r) => new Date(r.pushed_at) > sixMonthsAgo
  ).length;

  return { totalStars, totalForks, activeRepos };
}
