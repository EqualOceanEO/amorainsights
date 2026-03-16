'use client';

/**
 * H5ReportViewer — renders an HTML/H5 format report in a sandboxed iframe.
 *
 * Simplified layout (2026-03-16 refactor):
 *  - Nav & Footer are rendered by the parent page (SiteNav / SiteFooter)
 *  - No duplicate Top Bar here — breadcrumb lives in the page, copyright in SiteFooter
 *  - Full-width iframe fills remaining viewport height
 *  - Premium gate: blurred preview + upgrade overlay
 *  - Related reports strip below iframe
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/db';
import type { SubscriptionTier } from '@/components/ChartBlock';
import ReadingProgress from '@/components/ReadingProgress';

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
}

// NAV height = 56px (h-14). We subtract that so the iframe fills the rest.
const NAV_H = 56;

export default function H5ReportViewer({
  report,
  hasAccess,
  relatedReports,
}: Props) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isPremium = report.is_premium;

  // Clean HTML: remove H5 internal nav/header that duplicates SiteNav
  const cleanHtml = report.html_content
    ? report.html_content
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<div[^>]*id=["']progress-bar["'][^>]*>.*?<\/div>/gi, '')
    : '';

  // Blurred preview: first 40% of HTML for paywall
  const previewHtml = cleanHtml ? buildPreviewHtml(cleanHtml) : '';

  return (
    <div className="flex flex-col flex-1">
      {/* H5 reports scroll via iframe, but we still track page-level scroll for the progress bar */}
      <ReadingProgress />

      {/* ── Sticky Breadcrumb bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-gray-800/40 bg-gray-950/90 backdrop-blur-sm px-5 py-2 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
          <Link href="/reports" className="hover:text-gray-400 transition shrink-0">Reports</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-xs md:max-w-lg">{report.title}</span>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {isPremium && (
            hasAccess ? (
              <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">✓ Pro</span>
            ) : (
              <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">⭐ Premium</span>
            )
          )}
          {hasAccess && report.html_content && (
            <button
              onClick={() => iframeRef.current?.requestFullscreen?.()}
              className="text-xs text-gray-500 hover:text-white transition px-2 py-1 rounded hover:bg-gray-800"
              title="Fullscreen"
            >
              ⛶
            </button>
          )}
        </div>
      </div>

      {/* ── Iframe / Paywall ─────────────────────────────────────────────── */}
      <div className="relative flex-1" style={{ minHeight: `calc(100vh - ${NAV_H + 37}px)` }}>
        {/* Loading skeleton */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading report…</p>
            </div>
          </div>
        )}

        {hasAccess ? (
          cleanHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={cleanHtml}
              sandbox="allow-scripts allow-same-origin allow-popups"
              title={report.title}
              className="w-full border-0 block"
              style={{ height: `calc(100vh - ${NAV_H + 37}px)` }}
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              No H5 content uploaded yet.
            </div>
          )
        ) : (
          /* ── Paywall ─────────────────────────────────────────────── */
          <div className="relative" style={{ height: `calc(100vh - ${NAV_H + 37}px)` }}>
            {/* Blurred partial preview */}
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
                className="w-full border-0 block"
                style={{ height: '100%', filter: 'blur(5px)', opacity: 0.25 }}
                onLoad={() => setIframeLoaded(true)}
              />
            )}

            {/* Paywall overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20">
              <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Premium Interactive Report
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
                  Unlock the full H5 experience
                </h2>
                <p className="text-gray-400 text-sm mb-2 leading-relaxed font-medium">
                  {report.title}
                </p>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  Interactive AMORA radar charts, competitive benchmarks, and dynamic
                  visualizations — available to Premium subscribers.
                </p>

                <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-gray-400 mb-8">
                  {['✓ Interactive charts', '✓ Full analysis', '✓ AMORA scores', '✓ Quarterly updates'].map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/signup?intent=premium"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
                  >
                    Start Free Trial →
                  </Link>
                  <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition px-4 py-3">
                    View plans
                  </Link>
                </div>

                <p className="text-xs text-gray-600 mt-4">
                  Already subscribed?{' '}
                  <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
                </p>

                {/* Social proof */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-5 text-xs text-gray-600">
                  <span>🔒 Cancel anytime</span>
                  <span>📦 Instant access</span>
                  <span>🌍 500+ analysts trust AMORA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Related Reports ──────────────────────────────────────────────── */}
      {relatedReports.length > 0 && (
        <div className="border-t border-gray-800/60 bg-gray-900/30 px-5 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Related Reports
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-blue-600/60 rounded-xl p-5 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {r.is_premium ? (
                      <span className="text-xs text-amber-400">⭐ Premium</span>
                    ) : (
                      <span className="text-xs text-green-400">Free</span>
                    )}
                    {(r.report_format === 'html' || r.report_format === 'h5_embed') && (
                      <span className="text-xs text-purple-400">H5</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Build a "preview" version of the HTML that only renders ~40% of content.
 */
function buildPreviewHtml(fullHtml: string): string {
  const cutoff = Math.floor(fullHtml.length * 0.4);
  const slicePoint = fullHtml.lastIndexOf('</div>', cutoff) || cutoff;
  const partial = fullHtml.slice(0, slicePoint);
  return partial + '\n</div></div></body></html>';
}
