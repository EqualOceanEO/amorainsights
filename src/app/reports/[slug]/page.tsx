import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getReportBySlug, getReports, INDUSTRY_META, type Report } from '@/lib/db';
import SubscribeBox from '@/components/SubscribeBox';
import ShareBar from '@/components/ShareBar';
import ChartBlock from '@/components/ChartBlock';
import type { SubscriptionTier } from '@/components/ChartBlock';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { slug } = await params;

  let report: Report | null = null;
  let relatedReports: Report[] = [];

  try {
    report = await getReportBySlug(slug);
    if (report) {
      const related = await getReports({
        industrySlug: report.industry_slug,
        pageSize: 3,
      });
      // Exclude current report
      relatedReports = related.data.filter((r) => r.id !== report!.id).slice(0, 2);
    }
  } catch {
    // DB not ready
  }

  if (!report) notFound();

  const meta = INDUSTRY_META[report.industry_slug];
  const isPremium = report.is_premium;

  // Resolve user subscription tier from session (JWT carries it, set in auth.ts)
  const subscriptionTier: SubscriptionTier =
    ((session.user as { subscriptionTier?: string }).subscriptionTier as SubscriptionTier) ?? 'free';

  // Content access: non-free tiers see full content, free users see paywall on premium reports
  const hasAccess = subscriptionTier !== 'free' || !isPremium;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/reports" className="hover:text-white transition">Reports</Link>
            <Link href="/companies" className="hover:text-white transition">Companies</Link>
          </nav>
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/reports" className="hover:text-gray-300 transition">Reports</Link>
          <span>/</span>
          <span className="text-gray-400 flex items-center gap-1">
            {meta.icon} {meta.name}
          </span>
        </nav>

        {/* ── Report Header ────────────────────────────────────────────────── */}
        <article>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full flex items-center gap-1.5">
              {meta.icon} {meta.name}
            </span>
            {isPremium ? (
              <span className="text-xs font-semibold bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                ⭐ Premium
              </span>
            ) : (
              <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full">
                Free
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-white">
            {report.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-800">
            <span>{report.author ?? 'AMORA Research'}</span>
            <span>·</span>
            <span>{formatDate(report.published_at)}</span>
            {report.view_count > 0 && (
              <>
                <span>·</span>
                <span>{report.view_count.toLocaleString()} views</span>
              </>
            )}
            <div className="ml-auto">
              <ShareBar
                title={report.title}
                summary={report.summary ?? ''}
                url={`https://amorainsights.com/reports/${report.slug}`}
                variant="horizontal"
              />
            </div>
          </div>

          {/* ── Summary (always visible) ─────────────────────────────────── */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">
              Executive Summary
            </p>
            <p className="text-gray-300 leading-relaxed">{report.summary}</p>
          </div>

          {/* ── Tags ────────────────────────────────────────────────────────── */}
          {report.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {report.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Interactive Chart (subscription-gated) ──────────────────────── */}
          <ChartBlock
            subscriptionTier={subscriptionTier}
            title="Market Growth Trend"
            caption="Source: AMORA Research · Q1 2026"
            height={280}
            option={{
              xAxis: {
                type: 'category',
                data: ['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25', 'Q4 25'],
              },
              yAxis: { type: 'value', name: 'Index' },
              series: [
                {
                  type: 'line',
                  data: [42, 55, 61, 68, 74, 82, 89, 97],
                  name: 'Growth Index',
                  areaStyle: { opacity: 0.15 },
                },
              ],
              grid: { left: 48, right: 24, top: 32, bottom: 32 },
            }}
          />

          {/* ── Full Content ─────────────────────────────────────────────────── */}
          {report.content ? (
            hasAccess ? (
              <div className="prose prose-invert prose-sm max-w-none">
                {/* Simple Markdown rendering — upgrade to react-markdown when dependency added */}
                {report.content.split('\n').map((line, i) => {
                  if (line.startsWith('# '))
                    return <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-white">{line.slice(2)}</h2>;
                  if (line.startsWith('## '))
                    return <h3 key={i} className="text-xl font-semibold mt-6 mb-2 text-white">{line.slice(3)}</h3>;
                  if (line.startsWith('### '))
                    return <h4 key={i} className="text-lg font-semibold mt-4 mb-2 text-gray-200">{line.slice(4)}</h4>;
                  if (line.startsWith('- '))
                    return <li key={i} className="ml-4 text-gray-300 mb-1">{line.slice(2)}</li>;
                  if (line.trim() === '')
                    return <br key={i} />;
                  return <p key={i} className="text-gray-300 leading-relaxed mb-3">{line}</p>;
                })}
              </div>
            ) : (
              <PremiumPaywall slug={report.slug} />
            )
          ) : (
            /* No full content yet — show paywall/coming soon */
            isPremium && !hasAccess ? (
              <PremiumPaywall slug={report.slug} />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">
                <p className="text-2xl mb-3">📝</p>
                <p className="font-medium text-gray-400">Full report content coming soon</p>
                <p className="text-sm mt-1">The executive summary above captures the key findings.</p>
              </div>
            )
          )}
        </article>

        {/* ── Share + Subscribe ────────────────────────────────────────────── */}
        <div className="mt-12 space-y-4">
          <ShareBar
            title={report.title}
            summary={report.summary ?? ''}
            url={`https://amorainsights.com/reports/${report.slug}`}
            variant="horizontal"
          />
          <SubscribeBox source="article_bottom" />
        </div>

        {/* ── Related Reports ──────────────────────────────────────────────── */}
        {relatedReports.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-800">
            <h2 className="text-lg font-semibold mb-5">
              More from {meta.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 transition"
                >
                  <div className="flex items-center justify-between mb-2">
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
            <div className="mt-5">
              <Link
                href={`/reports?industry=${report.industry_slug}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition"
              >
                View all {meta.name} reports →
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Premium Paywall ──────────────────────────────────────────────────────────

function PremiumPaywall({ slug }: { slug: string }) {
  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 select-none pointer-events-none blur-sm opacity-40">
        <p className="text-gray-400 text-sm mb-3">
          This report covers market sizing, competitive dynamics, investment signals, and
          forward-looking analysis across four key dimensions...
        </p>
        <p className="text-gray-400 text-sm mb-3">
          Key findings include comparative benchmarking of leading players, supply chain
          analysis, and regulatory environment assessment...
        </p>
        <p className="text-gray-400 text-sm">
          Financial projections and M&A activity analysis are included in the premium section...
        </p>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 rounded-xl">
        <div className="text-center px-6">
          <div className="text-3xl mb-3">⭐</div>
          <h3 className="text-xl font-bold text-white mb-2">Premium Report</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">
            This full report is available to AMORA Premium subscribers. Upgrade to access
            all in-depth analysis, data, and forecasts.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
          >
            Upgrade to Premium
          </Link>
          <p className="text-xs text-gray-600 mt-3">
            Already subscribed?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
