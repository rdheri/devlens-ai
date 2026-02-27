import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLens AI – Developer Portfolio Intelligence",
  description:
    "AI-powered GitHub portfolio analysis. Skill mapping, code quality scoring, activity heatmaps, developer comparison, and personalized career recommendations.",
  metadataBase: new URL("https://devlens-ai.vercel.app"),
  openGraph: {
    title: "DevLens AI – Developer Portfolio Intelligence",
    description:
      "Analyze any GitHub profile with AI. Skill radar, activity heatmaps, code quality scores, and career roadmaps in seconds.",
    type: "website",
    siteName: "DevLens AI",
    url: "https://devlens-ai.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevLens AI – Developer Portfolio Intelligence",
    description: "AI-powered GitHub portfolio analysis with skill mapping and career recommendations.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="noise-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
