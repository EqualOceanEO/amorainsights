import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getReportBySlug, getReports, INDUSTRY_META, type Report } from '@/lib/db';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ReadingProgress from '@/components/ReadingProgress';
import SubscribeBox from '@/components/SubscribeBox';
import ShareBar from '@/components/ShareBar';
import ChartBlock from '@/components/ChartBlock';
import PremiumWall from '@/components/PremiumWall';
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isDemoMode = sp.demo === 'true';

  let report: Report | null = null;
  let relatedReports: Report[] = [];

  // Fallback data for HRI-2026 report (used when Supabase is unreachable)
  const HRI_2026_FALLBACK: Report = {
    id: 44,
    title: 'Humanoid Robotics Intelligence 2026',
    summary:
      'AMORA 发布《人形机器人智能产业报告 2026》，覆盖中美日韩欧 9 家核心企业，涵盖产业链全景、技术代际、商业化进程、市场容量与资本估值五大维度，基于 AMORA Model v3.0 构建评级体系。',
    industry_slug: 'humanoid-robotics',
    author: 'AMORA Research Team',
    is_premium: true,
    slug: 'humanoid-robotics-intelligence-2026',
    report_format: 'h5_embed',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  } as Report;

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
    // DB not ready — use fallback for known reports
    if (slug === 'humanoid-robotics-intelligence-2026') {
      report = HRI_2026_FALLBACK;
    }
  }

  if (!report) notFound();

  const session = await auth();
  const meta = INDUSTRY_META[report.industry_slug] ?? {
    name: report.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: '📊',
    name_cn: '',
  };
  const isPremium = report.is_premium;

  // Read subscription tier from session
  const tierFromSession = (session?.user as { subscriptionTier?: string })?.subscriptionTier ?? 'free';
  const subscriptionTier: SubscriptionTier = tierFromSession as SubscriptionTier;
  const hasAccess = !isPremium || subscriptionTier === 'pro';

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
            hasAccess={isDemoMode ? true : hasAccess}
            subscriptionTier={subscriptionTier}
            relatedReports={relatedReports}
            demoMode={isDemoMode}
          />
          <SiteFooter />
        </>
      ) : (
        <>
          {/* Floating Share Bar — left sidebar on desktop */}
          <div className="hidden xl:block">
            <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
              <ShareBar
                title={report.title}
                summary={report.summary ?? ''}
                url={`https://amorainsights.com/reports/${report.slug}`}
                variant="floating"
              />
            </div>
          </div>

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
                  <PremiumWall variant="report" title={`Unlock the full analysis for ${report.title}`} />
                )
              ) : (
                report.content ? (
                  <FreeContent report={report} />
                ) : (
                  <ComingSoon />
                )
              )}
            </article>

            {/* ── Share Bar ─────────────────────────────────────────────── */}
            <div className="mt-10">
              <ShareBar
                title={report.title}
                summary={report.summary ?? ''}
                url={`https://amorainsights.com/reports/${report.slug}`}
                variant="horizontal"
              />
            </div>

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

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    return {
      title: 'Report Not Found',
      description: 'The requested report could not be found.',
    };
  }

  const meta = INDUSTRY_META[report.industry_slug] ?? {
    name: report.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: '📊',
    name_cn: '',
  };

  const canonicalUrl = `https://amorainsights.com/reports/${report.slug}`;

  return {
    title: `${report.title} | AMORA Insights`,
    description: report.summary || `In-depth analysis and AMORA scoring for ${meta.name}.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: report.title,
      description: report.summary || `Comprehensive ${meta.name} report with AMORA framework scoring.`,
      siteName: 'AMORA Insights',
      images: report.cover_image_url
        ? [{ url: report.cover_image_url, width: 1200, height: 630, alt: report.title }]
        : [{ url: '/og-default.png', width: 1200, height: 630, alt: 'AMORA Insights' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: report.summary || `AMORA-scored analysis for ${meta.name}.`,
      images: report.cover_image_url
        ? [report.cover_image_url]
        : ['/og-default.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [
      meta.name,
      'AMORA',
      'AMORA score',
      report.industry_slug,
      ...(report.tags || []),
    ].filter(Boolean).join(', '),
  };
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
