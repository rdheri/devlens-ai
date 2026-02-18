import Groq from "groq-sdk";
import { GitHubUser, GitHubRepo, LanguageStat, AIAnalysis, RepoScore } from "./types";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  return new Groq({ apiKey });
}

function buildPrompt(
  user: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStat[]
): string {
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15);

  const repoSummaries = topRepos
    .map(
      (r) =>
        `- ${r.name}: ${r.description || "No description"} | Lang: ${r.language || "N/A"} | ⭐${r.stargazers_count} | Forks: ${r.forks_count} | Topics: [${r.topics.join(", ")}] | Last push: ${r.pushed_at.split("T")[0]} | Issues: ${r.open_issues_count}`
    )
    .join("\n");

  const langSummary = languages
    .map((l) => `${l.name}: ${l.percentage}% (${l.count} repos)`)
    .join(", ");

  return `You are an expert developer talent analyst. Analyze this GitHub developer profile and provide a structured assessment.

DEVELOPER PROFILE:
- Username: ${user.login}
- Name: ${user.name || "N/A"}
- Bio: ${user.bio || "N/A"}
- Company: ${user.company || "N/A"}
- Location: ${user.location || "N/A"}
- Public Repos: ${user.public_repos}
- Followers: ${user.followers}
- Account Created: ${user.created_at.split("T")[0]}

LANGUAGES: ${langSummary}

TOP REPOSITORIES:
${repoSummaries}

Respond with ONLY valid JSON (no markdown, no backticks, no explanation) matching this exact structure:
{
  "summary": "A compelling 2-3 sentence executive summary of this developer's profile, capabilities, and trajectory. Be specific about their strengths and what makes them stand out.",
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "skillScores": [
    {"category": "Frontend", "score": <0-100>},
    {"category": "Backend", "score": <0-100>},
    {"category": "DevOps", "score": <0-100>},
    {"category": "Data & AI", "score": <0-100>},
    {"category": "Systems", "score": <0-100>},
    {"category": "Open Source", "score": <0-100>}
  ],
  "recommendations": ["actionable_rec_1", "actionable_rec_2", "actionable_rec_3"],
  "careerLevel": "one of: Junior | Mid-Level | Senior | Staff | Principal | Distinguished",
  "specialization": "Their primary area of expertise in 2-4 words"
}

SCORING GUIDELINES:
- Base scores on concrete evidence from repositories, languages, and activity
- Frontend: React/Vue/Angular/Svelte/CSS/HTML repos, UI libraries
- Backend: API repos, server frameworks, databases, Python/Java/Go/Node backends
- DevOps: Docker, CI/CD, Kubernetes, infrastructure, cloud configs, shell scripts
- Data & AI: ML/AI repos, data science, Jupyter notebooks, analytics, LLM projects
- Systems: C/C++/Rust repos, low-level programming, OS, networking, embedded
- Open Source: Stars, forks, community engagement, documentation quality
- Score 0 if no evidence, 20-40 for basic, 40-70 for intermediate, 70-90 for strong, 90+ for exceptional
- Be honest and evidence-based. Don't inflate scores.`;
}

function scoreRepos(repos: GitHubRepo[]): RepoScore[] {
  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((repo) => {
      // Quality heuristic: stars, description, topics, recency, license
      let quality = 30; // base
      if (repo.description && repo.description.length > 20) quality += 15;
      if (repo.topics.length > 0) quality += 10;
      if (repo.license) quality += 10;
      if (repo.stargazers_count > 0) quality += Math.min(repo.stargazers_count * 2, 20);
      if (repo.forks_count > 0) quality += Math.min(repo.forks_count * 3, 15);

      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceUpdate < 30) quality += 10;
      else if (daysSinceUpdate < 90) quality += 5;

      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        qualityScore: Math.min(quality, 100),
        lastActive: repo.pushed_at,
        topics: repo.topics.slice(0, 5),
      };
    });
}

export async function analyzeProfile(
  user: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStat[]
): Promise<AIAnalysis> {
  const prompt = buildPrompt(user, repos, languages);

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI analysis returned empty response");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON if wrapped in markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response");
    }
  }

  return {
    summary: parsed.summary || "Analysis could not be generated.",
    strengths: parsed.strengths || [],
    skillScores: parsed.skillScores || [],
    topRepos: scoreRepos(repos),
    recommendations: parsed.recommendations || [],
    careerLevel: parsed.careerLevel || "Unknown",
    specialization: parsed.specialization || "General Software Engineering",
  };
}
