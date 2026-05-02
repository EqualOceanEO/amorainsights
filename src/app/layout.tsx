import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const TAGLINE = "Mapping Industries. Measuring Applications. Benchmarking the World.";
const VALUE_PROP = "Clarity on frontier tech, before the market catches up.";
const SITE_TITLE = "AmoraInsights — Mapping Frontier Industries";
const DESCRIPTION = `${TAGLINE} ${VALUE_PROP}`;

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased font-sans">
        {/* Suspense required because AnalyticsProvider uses useSearchParams */}
        <Suspense fallback={null}>
          <AuthProvider>
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
