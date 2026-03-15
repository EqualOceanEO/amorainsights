import type { Metadata } from "next";
import "./globals.css";

const TAGLINE = "Mapping Industries. Measuring Applications. Benchmarking the World.";
const VALUE_PROP = "Clarity on frontier tech, before the market catches up.";
const SITE_TITLE = "AmoraInsights — Mapping Frontier Industries";
const DESCRIPTION = `${TAGLINE} ${VALUE_PROP}`;

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: DESCRIPTION,
    siteName: "AmoraInsights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
