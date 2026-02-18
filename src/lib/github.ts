import { GitHubUser, GitHubRepo, LanguageStat } from "./types";

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

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
};

if (process.env.GITHUB_TOKEN) {
  headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function ghFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
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

  // Fetch up to 3 pages (300 repos max)
  while (page <= 3) {
    const repos = await ghFetch<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=pushed&type=owner`
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  // Filter out forks and archived repos
  return allRepos.filter((r) => !r.fork && !r.archived);
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
