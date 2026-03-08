import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amora Insights | China Innovation & Future Industries",
  description: "Deep-dive analysis on China's innovation in future industries: Future Information, Health, Energy, Space, Materials, and Manufacturing. Intelligence + Green transformation solutions.",
  keywords: ["China innovation", "future industries", "technology analysis", "green transformation", "intelligence", "enterprise database"],
  authors: [{ name: "Amora Insights" }],
  openGraph: {
    title: "Amora Insights | China Innovation & Future Industries",
    description: "Deep-dive analysis on China's innovation in future industries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
