import type { Metadata } from "next";

interface Props {
  params: { username: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.username;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://devlens-ai.vercel.app";

  let name = username;
  let repos = "0";
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      name = data.name || username;
      repos = String(data.public_repos || 0);
    }
  } catch {
    // Use defaults
  }

  const ogParams = new URLSearchParams({
    username, name, repos,
    level: "Developer",
    spec: "Software Engineering",
    score: "-",
    stars: "0",
  });

  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

  return {
    title: `${name} (@${username}) – DevLens AI`,
    description: `AI-powered developer portfolio analysis for ${name}. View skill scores, code quality, activity heatmap, and career recommendations.`,
    openGraph: {
      title: `${name} – Developer Profile | DevLens AI`,
      description: `See the full AI analysis of ${name}'s GitHub portfolio: skill radar, activity heatmap, code quality scores, and more.`,
      type: "website",
      url: `${baseUrl}/analyze/${username}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `DevLens AI profile for ${name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} – DevLens AI Analysis`,
      description: `AI-powered portfolio analysis for @${username}`,
      images: [ogImageUrl],
    },
  };
}

export default function AnalyzeLayout({ children }: Props) {
  return <>{children}</>;
}
