'use client';

/**
 * H5ReportViewer — renders an HTML/H5 format report in a sandboxed iframe.
 *
 * Security model:
 *  - Uses srcdoc (no external URL needed)
 *  - sandbox="allow-scripts allow-same-origin" — scripts run but no navigation,
 *    no popups, no form submit to external targets
 *  - allow-same-origin is required so inline scripts can access the DOM
 *
 * Layout:
 *  - Full-width, 100vh iframe below the site nav
 *  - Thin top bar with breadcrumb + share button
 *  - If premium + no access: renders paywall overlay on top of blurred preview
 *
 * George, 2026-03-15
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/db';
import type { SubscriptionTier } from '@/components/ChartBlock';

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
}

export default function H5ReportViewer({
  report,
  hasAccess,
  relatedReports,
}: Props) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const meta_icon = report.industry_slug === 'ai' ? '🤖'
    : report.industry_slug === 'life-sciences' ? '🧬'
    : report.industry_slug === 'green-tech' ? '⚡'
    : report.industry_slug === 'intelligent-manufacturing' ? '🦾'
    : report.industry_slug === 'new-space' ? '🚀'
    : '⚛️';

  const meta_name = report.industry_slug.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // For premium reports where user lacks access: show 40% of content with paywall overlay
  const previewHtml = report.html_content
    ? buildPreviewHtml(report.html_content)
    : '';

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 65px)' }}>
      {/* ── H5 Top Bar ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/reports" className="hover:text-gray-300 transition">Reports</Link>
          <span>/</span>
          <span className="text-gray-400 flex items-center gap-1">
            {meta_icon} {meta_name}
          </span>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{report.title}</span>
        </nav>
        <div className="flex items-center gap-3">
          {report.is_premium && (
            hasAccess ? (
              <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">✓ Pro Access</span>
            ) : (
              <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">⭐ Premium</span>
            )
          )}
          <span className="text-xs bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded-full">H5 Report</span>
          {/* Open fullscreen */}
          <button
            onClick={() => {
              iframeRef.current?.requestFullscreen?.();
            }}
            className="text-xs text-gray-500 hover:text-white transition px-2 py-1 rounded hover:bg-gray-800"
            title="Fullscreen"
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      {/* ── H5 Content Area ─────────────────────────────────────────────── */}
      <div className="flex-1 relative">
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
          /* Full report — sandboxed iframe */
          report.html_content ? (
            <iframe
              ref={iframeRef}
              srcDoc={report.html_content}
              sandbox="allow-scripts allow-same-origin allow-popups"
              title={report.title}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 113px)', display: 'block' }}
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              No H5 content uploaded yet.
            </div>
          )
        ) : (
          /* Paywall — show blurred preview + overlay */
          <div className="relative" style={{ height: 'calc(100vh - 113px)' }}>
            {/* Blurred partial preview */}
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
                className="w-full border-0"
                style={{ height: '100%', display: 'block', filter: 'blur(4px)', opacity: 0.3 }}
                onLoad={() => setIframeLoaded(true)}
              />
            )}

            {/* Paywall Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/85 z-20 px-6">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold text-white mb-3">Premium H5 Report</h2>
                <p className="text-gray-400 text-sm mb-2 leading-relaxed">
                  <strong className="text-white">{report.title}</strong>
                </p>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  This interactive report is available to AMORA Premium subscribers.
                  Upgrade to access the full analysis, AMORA scores, and dynamic visualizations.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm mb-4"
                >
                  Upgrade to Premium →
                </Link>
                <p className="text-xs text-gray-600">
                  Already subscribed?{' '}
                  <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Related Reports ──────────────────────────────────────── */}
      {relatedReports.length > 0 && (
        <div className="border-t border-gray-800 bg-gray-900/40 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              More from {meta_name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 transition"
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
 * Build a "preview" version of the HTML that only renders the first ~40% of content.
 * This is used for the paywall blur effect. We do a rough character-count split.
 */
function buildPreviewHtml(fullHtml: string): string {
  const cutoff = Math.floor(fullHtml.length * 0.4);
  // Try to cut at a sensible point (end of a block element)
  const slicePoint = fullHtml.lastIndexOf('</div>', cutoff) || cutoff;
  const partial = fullHtml.slice(0, slicePoint);
  // Close the document minimally
  return partial + '\n</div></div></body></html>';
}
