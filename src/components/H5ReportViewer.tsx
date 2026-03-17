'use client';

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

const NAV_H = 56;

export default function H5ReportViewer({
  report,
  hasAccess,
  relatedReports,
}: Props) {
  const isPremium = report.is_premium;

  // Clean HTML: remove H5 internal nav/header that duplicates SiteNav
  let cleanHtml = report.html_content || '';
  
  // Remove internal nav and fix disclaimer color
  cleanHtml = cleanHtml
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/class=["']disclaimer-text["']/gi, 'class="disclaimer-text" style="color: #9ca3af;"');

  // For premium reports without access: transform charts to static SVGs
  const displayHtml = isPremium && !hasAccess ? transformChartsToGated(cleanHtml) : cleanHtml;

  return (
    <div className="flex flex-col flex-1">
      <ReadingProgress />

      {/* Breadcrumb */}
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
        </div>
      </div>

      {/* Content - using dangerouslySetInnerHTML instead of iframe */}
      <div className="relative flex-1 bg-gray-950" style={{ minHeight: `calc(100vh - ${NAV_H + 37}px)` }}>
        {displayHtml ? (
          <div 
            className="h5-report-content"
            style={{ 
              height: `calc(100vh - ${NAV_H + 37}px)`,
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
            No H5 content uploaded yet.
          </div>
        )}
      </div>

      {/* Related Reports */}
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
 * Transform interactive charts to static SVGs + paywall hints for non-premium users.
 */
function transformChartsToGated(html: string): string {
  // Replace chart-container divs with gated charts
  const chartPattern = /<div class="chart-container">[\s\S]*?<div id="[^"]+" class="echarts"><\/div>[\s\S]*?<\/div>/gi;

  return html.replace(chartPattern, () => {
    return `
<div class="gated-chart-wrapper">
  <svg class="gated-chart-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />

    <g transform="translate(200, 100)" opacity="0.4">
      <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="none" stroke="#3b82f6" stroke-width="1"/>
      <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="none" stroke="#3b82f6" stroke-width="1"/>
      <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="none" stroke="#3b82f6" stroke-width="1"/>
      <polygon points="0,-55 50,-28 35,28 0,60 -45,20 -50,-20" fill="#3b82f6" fill-opacity="0.15" stroke="#60a5fa" stroke-width="2"/>
      <line x1="0" y1="-70" x2="0" y2="70" stroke="#6b7280" stroke-width="0.5"/>
      <line x1="-60" y1="-35" x2="60" y2="35" stroke="#6b7280" stroke-width="0.5"/>
      <line x1="-60" y1="35" x2="60" y2="-35" stroke="#6b7280" stroke-width="0.5"/>
    </g>

    <circle cx="200" cy="100" r="20" fill="#1f2937" opacity="0.9"/>
    <path d="M200,90 c-4,0 -7,3 -7,7 v2 h14 v-2 c0,-4 -3,-7 -7,-7 M196,99 v8 h8 v-8" fill="#9ca3af"/>

    <text x="200" y="140" text-anchor="middle" fill="#9ca3af" font-size="11" font-family="system-ui, sans-serif">
      Interactive AMORA Radar Chart
    </text>
    <text x="200" y="156" text-anchor="middle" fill="#6b7280" font-size="9" font-family="system-ui, sans-serif">
      5-axis · 25 indicators
    </text>
  </svg>

  <div class="gated-chart-overlay">
    <div class="gated-chart-cta">
      <div class="gated-chart-lock-icon">🔒</div>
      <h3 class="gated-chart-title">Interactive Chart</h3>
      <p class="gated-chart-desc">Hover for details · Zoom to explore · Export data</p>
      <a href="/pricing" class="gated-chart-button">Upgrade to Pro</a>
    </div>
  </div>

  <style>
    .gated-chart-wrapper {
      position: relative;
      margin: 24px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #374151;
      background: #111827;
    }

    .gated-chart-svg {
      display: block;
      width: 100%;
      height: auto;
      min-height: 200px;
    }

    .gated-chart-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gated-chart-wrapper:hover .gated-chart-overlay {
      opacity: 1;
    }

    .gated-chart-cta {
      text-align: center;
      padding: 32px;
      max-width: 280px;
    }

    .gated-chart-lock-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .gated-chart-title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .gated-chart-desc {
      color: #9ca3af;
      font-size: 13px;
      margin: 0 0 20px;
      line-height: 1.5;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .gated-chart-button {
      display: inline-block;
      background: #3b82f6;
      color: #fff;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .gated-chart-button:hover {
      background: #2563eb;
    }
  </style>
</div>`;
  });
}
