import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getReportBySlug, getReports, INDUSTRY_META, type Report } from '@/lib/db';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ReadingProgress from '@/components/ReadingProgress';
import SubscribeBox from '@/components/SubscribeBox';
import ShareBar from '@/components/ShareBar';
import ChartBlock from '@/components/ChartBlock';
import type { SubscriptionTier } from '@/components/ChartBlock';
import { EventBeacon } from '@/components/EventBeacon';
import H5ReportViewer from '@/components/H5ReportViewer';

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
      relatedReports = related.data.filter((r) => r.id !== report!.id).slice(0, 2);
    }
  } catch {
    // DB not ready
  }

  if (!report) notFound();

  const meta = INDUSTRY_META[report.industry_slug] ?? {
    name: report.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: '📊',
    name_cn: '',
  };
  const isPremium = report.is_premium;

  // Public visitor = free tier
  const subscriptionTier: SubscriptionTier = 'free';
  const hasAccess = !isPremium;

  const isH5Report = report.report_format === 'html' || report.report_format === 'h5_embed';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Analytics */}
      <EventBeacon
        eventName="report_view"
        category="content"
        properties={{
          slug: report.slug,
          industry: report.industry_slug,
          is_premium: report.is_premium,
          has_access: hasAccess,
        }}
      />

      {/* Reading progress bar — only for Markdown (long-form scroll) */}
      {!isH5Report && <ReadingProgress />}

      {/* ── Shared Nav ─────────────────────────────────────────────────────── */}
      <SiteNav activePath="/reports" />

      {/* ── H5 Report: immersive full-height layout ──────────────────────── */}
      {isH5Report ? (
        <>
          <H5ReportViewer
            report={report}
            hasAccess={hasAccess}
            subscriptionTier={subscriptionTier}
            relatedReports={relatedReports}
          />
          <SiteFooter />
        </>
      ) : (
        <>
          <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10">

            {/* ── Breadcrumb ─────────────────────────────────────────────── */}
            <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-gray-400 transition">Home</Link>
              <span>/</span>
              <Link href="/reports" className="hover:text-gray-400 transition">Reports</Link>
              <span>/</span>
              <span className="text-gray-500 flex items-center gap-1">
                {meta.icon} {meta.name}
              </span>
            </nav>

            {/* ── Report Header ───────────────────────────────────────────── */}
            <article>
              {/* Industry + tier badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  {meta.icon} {meta.name}
                </span>
                {isPremium ? (
                  <span className="text-xs font-semibold bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded-full">
                    ⭐ Premium
                  </span>
                ) : (
                  <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {report.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-800">
                <span>{report.author ?? 'AMORA Research'}</span>
                <span>·</span>
                <span>{formatDate(report.published_at)}</span>
                {report.view_count > 0 && (
                  <>
                    <span>·</span>
                    <span>{report.view_count.toLocaleString()} views</span>
                  </>
                )}
                {/* ShareBar only in meta row */}
                <div className="ml-auto">
                  <ShareBar
                    title={report.title}
                    summary={report.summary ?? ''}
                    url={`https://amorainsights.com/reports/${report.slug}`}
                    variant="horizontal"
                  />
                </div>
              </div>

              {/* ── Executive Summary (always visible) ─────────────────── */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                  Executive Summary
                </p>
                <p className="text-gray-300 leading-relaxed text-[15px]">{report.summary}</p>
              </div>

              {/* ── Tags ───────────────────────────────────────────────── */}
              {report.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {report.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-800/80 text-gray-400 px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Interactive Chart ─────────────────────────────────── */}
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

              {/* ── Full Content: Free vs Premium ─────────────────────── */}
              {isPremium ? (
                hasAccess ? (
                  <FreeContent report={report} />
                ) : (
                  <PremiumGate slug={report.slug} title={report.title} />
                )
              ) : (
                report.content ? (
                  <FreeContent report={report} />
                ) : (
                  <ComingSoon />
                )
              )}
            </article>

            {/* ── Related Reports ──────────────────────────────────────── */}
            {relatedReports.length > 0 && (
              <section className="mt-16 pt-10 border-t border-gray-800">
                <h2 className="text-base font-semibold text-gray-300 mb-5">
                  More from {meta.name}
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
                <Link
                  href={`/reports?industry=${report.industry_slug}`}
                  className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  View all {meta.name} reports →
                </Link>
              </section>
            )}
          </main>

          {/* ── Shared Footer ────────────────────────────────────────────── */}
          <SiteFooter />
        </>
      )}
    </div>
  );
}

// ─── Free / Full Content Renderer ────────────────────────────────────────────

function FreeContent({ report }: { report: Report }) {
  if (!report.content) return <ComingSoon />;
  return (
    <div className="prose prose-invert prose-sm max-w-none mt-8">
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
          return <div key={i} className="h-3" />;
        return <p key={i} className="text-gray-300 leading-relaxed mb-3">{line}</p>;
      })}
    </div>
  );
}

// ─── Premium Gate (Hook Design) ───────────────────────────────────────────────

function PremiumGate({ slug, title }: { slug: string; title: string }) {
  void slug;
  return (
    <div className="mt-8 space-y-0">
      {/* Teaser — first few paragraphs blurred */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Faded preview text */}
        <div
          className="px-6 py-8 bg-gray-900/60 border border-gray-800 rounded-xl select-none pointer-events-none"
          aria-hidden="true"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          }}
        >
          <p className="text-gray-400 text-sm leading-7 mb-4">
            This report covers market sizing, competitive dynamics, and investment signals
            across four key dimensions. Our proprietary AMORA scoring methodology evaluates
            each company on 25 second-order indicators...
          </p>
          <p className="text-gray-400 text-sm leading-7 mb-4">
            Key findings include comparative benchmarking of leading players, supply chain
            analysis, regulatory environment assessment, and forward-looking projections
            for 2026–2028...
          </p>
          <p className="text-gray-400 text-sm leading-7">
            Financial projections, M&A activity analysis, and strategic recommendations
            are included in the full report. Subscriber access includes downloadable data
            tables and quarterly update alerts...
          </p>
        </div>
      </div>

      {/* Upgrade CTA card */}
      <div className="rounded-xl border border-blue-800/50 bg-gradient-to-b from-blue-950/40 to-gray-950/80 p-8 text-center -mt-0 relative z-10">
        {/* Hook headline */}
        <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Premium Report
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
          Unlock the full analysis for
          <br />
          <span className="text-blue-400">{title}</span>
        </h2>

        <p className="text-gray-400 text-sm mb-2 max-w-sm mx-auto leading-relaxed">
          Get the complete report — AMORA scores, competitive matrix, supply chain map,
          financial projections, and strategic recommendations.
        </p>

        {/* Value bullets */}
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 mb-8 mt-4">
          {[
            '✓ Full 40-page report',
            '✓ AMORA 5-axis score',
            '✓ Quarterly updates',
            '✓ Data export',
          ].map((item) => (
            <li key={item} className="text-gray-400">{item}</li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup?intent=premium"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
          >
            Start Free Trial →
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-400 hover:text-white transition px-4 py-3"
          >
            View plans
          </Link>
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Already subscribed?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>{' '}
          to access your reports.
        </p>
      </div>

      {/* Social proof strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-xs text-gray-600">
        <span>🔒 Cancel anytime</span>
        <span>📦 Instant access after signup</span>
        <span>🌍 500+ analysts trust AMORA</span>
      </div>

      {/* Newsletter hook — low-friction alternative */}
      <div className="mt-8 pt-8 border-t border-gray-800/60">
        <p className="text-xs text-gray-500 text-center mb-4">
          Not ready to subscribe? Get the weekly briefing — free.
        </p>
        <div className="max-w-sm mx-auto">
          <SubscribeBox source="report_premium_gate" compact />
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon ─────────────────────────────────────────────────────────────

function ComingSoon() {
  return (
    <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-xl p-10 text-center">
      <p className="text-2xl mb-3">📝</p>
      <p className="font-medium text-gray-400">Full report content coming soon</p>
      <p className="text-sm text-gray-600 mt-1">The executive summary above captures the key findings.</p>
      <div className="mt-6 max-w-xs mx-auto">
        <SubscribeBox source="report_coming_soon" compact />
      </div>
    </div>
  );
}
