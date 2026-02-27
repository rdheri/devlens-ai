export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  default_branch: string;
  open_issues_count: number;
  has_wiki: boolean;
  license: { spdx_id: string; name: string } | null;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: { name: string };
}

export interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityData {
  heatmap: ActivityDay[];
  totalEvents: number;
  streak: number;
  busiestDay: string;
  weekdayDistribution: number[];
  peakHour: number;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface SkillScore {
  category: string;
  score: number;
}

export interface RepoScore {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  qualityScore: number;
  lastActive: string;
  topics: string[];
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  skillScores: SkillScore[];
  topRepos: RepoScore[];
  recommendations: string[];
  careerLevel: string;
  specialization: string;
}

export interface AnalysisResult {
  user: GitHubUser;
  languages: LanguageStat[];
  analysis: AIAnalysis;
  activity: ActivityData;
  totalStars: number;
  totalForks: number;
  activeRepos: number;
  analyzedAt: string;
}
