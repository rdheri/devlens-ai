import Groq from "groq-sdk";
import { GitHubUser, GitHubRepo, LanguageStat, AIAnalysis, RepoScore, RepoCodeInsight } from "./types";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  return new Groq({ apiKey });
}

function buildPrompt(
  user: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStat[],
  codeInsights: RepoCodeInsight[]
): string {
  const topRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 15);

  const repoSummaries = topRepos
    .map((r) =>
      `- ${r.name}: ${r.description || "No description"} | Lang: ${r.language || "N/A"} | ⭐${r.stargazers_count} | Forks: ${r.forks_count} | Topics: [${r.topics.join(", ")}] | Last push: ${r.pushed_at.split("T")[0]} | Issues: ${r.open_issues_count}`
    ).join("\n");

  const langSummary = languages.map((l) => `${l.name}: ${l.percentage}% (${l.count} repos)`).join(", ");

  // Build actual code analysis section
  const codeAnalysis = codeInsights.map((insight) => {
    const signals = [
      insight.hasTests ? "✅ Has tests" : "❌ No tests found",
      insight.hasCI ? "✅ Has CI/CD" : "❌ No CI/CD",
      insight.hasDocker ? "✅ Dockerized" : "○ No Docker",
      insight.hasLicense ? "✅ Licensed" : "○ No license",
      insight.hasReadme ? "✅ Has README" : "❌ No README",
      `📁 ${insight.topFiles.length} source files detected`,
    ].join(" | ");

    let readmeSection = "";
    if (insight.readmeExcerpt) {
      // Truncate README for prompt efficiency
      const excerpt = insight.readmeExcerpt.slice(0, 800);
      readmeSection = `\n  README excerpt: ${excerpt}`;
    }

    const fileStructure = insight.topFiles.length > 0
      ? `\n  Key files: ${insight.topFiles.slice(0, 10).join(", ")}`
      : "";

    return `📦 ${insight.repoName}:\n  ${signals}${readmeSection}${fileStructure}`;
  }).join("\n\n");

  return `You are an expert developer talent analyst. Analyze this GitHub developer profile using BOTH metadata AND actual code/project analysis.

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

TOP REPOSITORIES (metadata):
${repoSummaries}

ACTUAL CODE ANALYSIS (from repo contents):
${codeAnalysis || "No code insights available"}

IMPORTANT: Use the ACTUAL CODE ANALYSIS section above to give evidence-based scores. The presence of tests, CI/CD, Docker, README quality, and file structure patterns are CONCRETE evidence. Don't just score based on repo names and descriptions.

Respond with ONLY valid JSON matching this structure:
{
  "summary": "2-3 sentence executive summary. Reference specific repos and concrete code evidence.",
  "strengths": ["strength1 with evidence", "strength2 with evidence", "strength3", "strength4"],
  "skillScores": [
    {"category": "Frontend", "score": <0-100>},
    {"category": "Backend", "score": <0-100>},
    {"category": "DevOps", "score": <0-100>},
    {"category": "Data & AI", "score": <0-100>},
    {"category": "Systems", "score": <0-100>},
    {"category": "Open Source", "score": <0-100>}
  ],
  "recommendations": ["actionable_rec_1", "actionable_rec_2", "actionable_rec_3"],
  "careerLevel": "Junior | Mid-Level | Senior | Staff | Principal | Distinguished",
  "specialization": "Primary area in 2-4 words",
  "codeInsights": "2-3 sentences specifically about their code quality, testing practices, documentation quality, and engineering maturity based on the actual code analysis above."
}

SCORING GUIDELINES:
- Base scores on CONCRETE evidence: actual test files, CI configs, Docker usage, README quality, file structure
- Frontend: React/Vue/Angular repos, UI libraries, CSS/HTML files
- Backend: API repos, server frameworks, database schemas
- DevOps: Docker, CI/CD configs, Kubernetes, cloud infrastructure
- Data & AI: ML/AI repos, notebooks, data pipelines, LLM projects
- Systems: C/C++/Rust repos, low-level programming
- Open Source: Stars, forks, README quality, licensing, community signals
- Score 0 if no evidence, 20-40 basic, 40-70 intermediate, 70-90 strong, 90+ exceptional
- Be honest. A repo with no tests and no README is not high quality regardless of stars.`;
}

function scoreRepos(repos: GitHubRepo[], codeInsights: RepoCodeInsight[]): RepoScore[] {
  const insightMap = new Map(codeInsights.map((i) => [i.repoName, i]));

  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((repo) => {
      let quality = 20; // base
      const insight = insightMap.get(repo.name);

      // Metadata signals
      if (repo.description && repo.description.length > 20) quality += 8;
      if (repo.topics.length > 0) quality += 5;
      if (repo.stargazers_count > 0) quality += Math.min(repo.stargazers_count * 2, 15);
      if (repo.forks_count > 0) quality += Math.min(repo.forks_count * 3, 10);

      // ACTUAL code signals (weighted higher)
      if (insight) {
        if (insight.hasReadme && insight.readmeExcerpt.length > 200) quality += 12;
        else if (insight.hasReadme) quality += 6;
        if (insight.hasTests) quality += 15;
        if (insight.hasCI) quality += 10;
        if (insight.hasDocker) quality += 5;
        if (insight.hasLicense) quality += 3;
        if (insight.topFiles.length > 10) quality += 5;
      } else {
        // Repos we didn't deeply analyze get modest scores
        if (repo.license) quality += 5;
      }

      const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate < 30) quality += 7;
      else if (daysSinceUpdate < 90) quality += 3;

      return {
        name: repo.name, description: repo.description, url: repo.html_url,
        language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count,
        qualityScore: Math.min(quality, 100), lastActive: repo.pushed_at, topics: repo.topics.slice(0, 5),
      };
    });
}

export async function analyzeProfile(
  user: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStat[],
  codeInsights: RepoCodeInsight[]
): Promise<AIAnalysis> {
  const prompt = buildPrompt(user, repos, languages, codeInsights);

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1800,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI analysis returned empty response");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    else throw new Error("Failed to parse AI response");
  }

  return {
    summary: parsed.summary || "Analysis could not be generated.",
    strengths: parsed.strengths || [],
    skillScores: parsed.skillScores || [],
    topRepos: scoreRepos(repos, codeInsights),
    recommendations: parsed.recommendations || [],
    careerLevel: parsed.careerLevel || "Unknown",
    specialization: parsed.specialization || "General Software Engineering",
    codeInsights: parsed.codeInsights || "",
  };
}
