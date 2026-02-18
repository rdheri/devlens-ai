import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLens AI – Developer Portfolio Intelligence",
  description:
    "AI-powered GitHub portfolio analysis. Get comprehensive developer assessments, skill mapping, and personalized career recommendations.",
  openGraph: {
    title: "DevLens AI – Developer Portfolio Intelligence",
    description: "Analyze any GitHub profile with AI-powered intelligence.",
    type: "website",
  },
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
