'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/db';
import type { SubscriptionTier } from '@/components/ChartBlock';

// ── Report Source Map ─────────────────────────────────────────────────────────
// Maps report slug → { free: string, pro: string } HTML file paths under /public

const REPORT_HTML: Record<string, { free: string; pro: string }> = {
  'humanoid-robotics-intelligence-2026': {
    free: '/HRI-2026-Free-Preview-v2.0.html',
    pro: '/HRI-2026-AMORA-Report-v5.0.html',
  },
};

// Default fallback paths
const DEFAULT_FREE = '/HRI-2026-Free-Preview-v2.0.html';
const DEFAULT_PRO = '/HRI-2026-AMORA-Report-v5.0.html';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
  demoMode?: boolean;
}

// ── Upgrade Banner (shown above the iframe for free users) ────────────────────

function UpgradeBanner({ title }: { title?: string }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-5"
      style={{
        height: 44,
        background: 'linear-gradient(90deg, #06070e 0%, #0f0f1e 100%)',
        borderBottom: '1px solid rgba(251,191,36,0.2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: logo + breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/reports" className="text-sm font-black tracking-tight text-white shrink-0 hover:opacity-80 transition">
          AMORA
        </Link>
        <span className="text-gray-700 text-sm shrink-0">/</span>
        <span className="text-xs text-gray-500 truncate hidden sm:block max-w-xs">
          {title ?? 'Humanoid Robotics Intelligence 2026'}
        </span>
        <span className="shrink-0 text-[10px] font-semibold bg-green-950 text-green-400 border border-green-800/50 px-2 py-0.5 rounded-full tracking-wide">
          免费预览版
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="#chapters"
          className="hidden sm:block text-xs text-gray-500 hover:text-gray-300 transition"
        >
          免费章节
        </Link>
        <Link
          href="/pricing"
          className="text-xs text-gray-400 hover:text-gray-200 transition"
        >
          订阅 PRO
        </Link>
        <Link
          href="/pricing"
          className="text-xs font-bold px-3.5 py-1.5 rounded-md text-white transition hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 0 12px rgba(245,158,11,0.3)',
          }}
        >
          查看完整版 →
        </Link>
      </div>
    </div>
  );
}

function ProBanner({ title }: { title?: string }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-5"
      style={{
        height: 44,
        background: 'linear-gradient(90deg, #06070e 0%, #0f0f1e 100%)',
        borderBottom: '1px solid rgba(168,85,247,0.2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: logo + breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/reports" className="text-sm font-black tracking-tight text-white shrink-0 hover:opacity-80 transition">
          AMORA
        </Link>
        <span className="text-gray-700 text-sm shrink-0">/</span>
        <span className="text-xs text-gray-500 truncate hidden sm:block max-w-xs">
          {title ?? 'Humanoid Robotics Intelligence 2026'}
        </span>
        <span className="shrink-0 text-[10px] font-semibold bg-purple-950 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded-full tracking-wide">
          PRO
        </span>
      </div>

      {/* Right */}
      <Link
        href="/reports"
        className="shrink-0 text-xs text-gray-500 hover:text-gray-300 transition"
      >
        ← 所有报告
      </Link>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function H5ReportViewer({ report, hasAccess, demoMode }: Props) {
  const isPro = hasAccess || demoMode === true;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const paths = REPORT_HTML[report.slug ?? ''] ?? {
    free: DEFAULT_FREE,
    pro: DEFAULT_PRO,
  };

  const htmlSrc = isPro ? paths.pro : paths.free;

  // Height: full viewport minus the top banner bar (44px)
  const BANNER_H = 44;

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100vh', background: '#06070e' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }}
          />
          <p className="text-xs text-gray-500">Loading report…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hide body scrollbar — report scrolls inside iframe */}
      <style>{`
        html, body { overflow: hidden !important; margin: 0; padding: 0; }
        body::-webkit-scrollbar { display: none !important; }
      `}</style>

      {/* Top banner */}
      {isPro ? <ProBanner title={report.title} /> : <UpgradeBanner title={report.title} />}

      {/* Full-page iframe */}
      <div
        style={{
          position: 'fixed',
          top: BANNER_H,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#06070e',
        }}
      >
        <iframe
          key={htmlSrc}
          src={htmlSrc}
          className="w-full h-full border-0"
          title={report.title}
          sandbox="allow-scripts allow-same-origin allow-popups"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </>
  );
}
