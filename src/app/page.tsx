import Link from 'next/link';
import { getReports, getReportCountByIndustry, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type Report } from '@/lib/db';
import SubscribeBox from '@/components/SubscribeBox';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Page (SSR) ───────────────────────────────────────────────────────────────

export default async function Home() {
  let latestReports: Report[] = [];
  let featuredReport: Report | null = null;
  let industryCounts: Record<string, number> = {};

  try {
    const [reportsRes, countsRes] = await Promise.all([
      getReports({ page: 1, pageSize: 9 }),
      getReportCountByIndustry(),
    ]);
    latestReports = reportsRes.data;
    featuredReport = latestReports[0] ?? null;
    industryCounts = countsRes;
  } catch {
    // DB not ready — graceful degradation
  }

  const industries = ALL_INDUSTRY_SLUGS.map((slug) => ({
    slug,
    ...INDUSTRY_META[slug],
    count: industryCounts[slug] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── Shared Nav ──────────────────────────────────────────────────────── */}
      <SiteNav activePath="/" />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-800/60">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-5 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Frontier Tech Intelligence
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
              Mapping the companies<br />
              <span className="text-blue-400">shaping tomorrow.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              Deep-dive research reports on AI, robotics, biotech, clean energy, and the
              frontier industries defining the next decade — with data-driven benchmarks
              that go beyond the headlines.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reports"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
              >
                Browse All Reports →
              </Link>
              <Link
                href="/signup"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Industry Pills ──────────────────────────────────────────────────── */}
      <section className="border-b border-gray-800/60 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-xs text-gray-600 font-medium shrink-0">Coverage:</span>
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/reports?industry=${ind.slug}`}
              className="shrink-0 flex items-center gap-1.5 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
            >
              <span>{ind.icon}</span>
              <span>{ind.name}</span>
              {ind.count > 0 && (
                <span className="text-gray-500 ml-0.5">{ind.count}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 py-12">

        {/* ── Featured Report ─────────────────────────────────────────────── */}
        {featuredReport && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Featured Report
              </h2>
            </div>
            <FeaturedCard report={featuredReport} />
          </section>
        )}

        {/* ── Latest Reports Grid ─────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Latest Research
            </h2>
            <Link
              href="/reports"
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              View all →
            </Link>
          </div>

          {latestReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestReports.slice(1).map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-500">Reports coming soon</p>
            </div>
          )}
        </section>

        {/* ── Six Industries ──────────────────────────────────────────────── */}
        <section className="mb-14 pt-8 border-t border-gray-800/60">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Six Frontier Industries
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/reports?industry=${ind.slug}`}
                className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-4 text-center transition"
              >
                <div className="text-2xl mb-2">{ind.icon}</div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition leading-snug">
                  {ind.name}
                </div>
                {ind.count > 0 && (
                  <div className="text-xs text-gray-600 mt-1">{ind.count} reports</div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Three Pillars ───────────────────────────────────────────────── */}
        <section className="pt-8 border-t border-gray-800/60 mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">The AMORA Difference</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Research built for people who need to act on it — not just read it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '📐',
                label: 'Quantitative',
                heading: 'Data over narrative',
                desc: 'Every analysis is grounded in numbers — patents, financials, capacity metrics, and benchmarks. No narratives without evidence.',
              },
              {
                icon: '⚖️',
                label: 'Comparative',
                heading: 'Global perspective',
                desc: 'We put US, Chinese, and global players side by side. Understanding one market in isolation no longer works.',
              },
              {
                icon: '🎯',
                label: 'Applied',
                heading: 'Lab to deployment',
                desc: 'We focus on technologies reaching real-world scale. Depth over breadth — always. No concept papers, no hype.',
              },
            ].map((p) => (
              <div
                key={p.label}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
                  {p.label}
                </div>
                <h3 className="font-semibold text-white mb-2">{p.heading}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Newsletter ──────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-800/60 bg-gray-900/30 py-16">
        <div className="max-w-xl mx-auto px-5 text-center">
          <p className="text-xs tracking-widest text-blue-400 uppercase mb-3">Every Friday</p>
          <h2 className="text-2xl font-bold text-white mb-3">AMORA Weekly</h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Six frontier tracks, one briefing. No noise, no account required.
          </p>
          <div className="max-w-sm mx-auto">
            <SubscribeBox source="homepage" />
          </div>
        </div>
      </section>

      {/* ── Shared Footer ────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ report }: { report: Report }) {
  const meta = INDUSTRY_META[report.industry_slug] ?? { name: report.industry_slug, icon: '📊' };
  const isH5 = report.report_format === 'html' || report.report_format === 'h5_embed';

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group relative flex flex-col md:flex-row bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-2xl overflow-hidden transition"
    >
      {/* Left — color accent */}
      <div className="hidden md:block w-1.5 shrink-0 bg-gradient-to-b from-blue-500 to-blue-700" />

      <div className="flex-1 p-7 md:p-8">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            {meta.icon} {meta.name}
          </span>
          {report.is_premium ? (
            <span className="text-xs font-semibold bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded-full">
              ⭐ Premium
            </span>
          ) : (
            <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full">
              Free
            </span>
          )}
          {isH5 && (
            <span className="text-xs bg-purple-900/40 text-purple-400 px-2.5 py-1 rounded-full font-medium">
              H5
            </span>
          )}
          <span className="text-xs text-gray-600 ml-auto">{timeAgo(report.published_at)}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-300 transition leading-snug mb-3">
          {report.title}
        </h2>

        {/* Summary */}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5 max-w-2xl">
          {report.summary}
        </p>

        {/* Tags */}
        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {report.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition">
            Read full report →
          </span>
          <span className="text-xs text-gray-600">{report.author ?? 'AMORA Research'}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: Report }) {
  const meta = INDUSTRY_META[report.industry_slug] ?? { name: report.industry_slug, icon: '📊' };
  const isH5 = report.report_format === 'html' || report.report_format === 'h5_embed';

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-5 flex flex-col transition"
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1.5 truncate">
          {meta.icon} <span className="truncate">{meta.name}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isH5 && (
            <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded font-medium">H5</span>
          )}
          {report.is_premium ? (
            <span className="text-xs bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded-full">⭐</span>
          ) : (
            <span className="text-xs bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded-full">Free</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-2">
        {report.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
        {report.summary}
      </p>

      {/* Tags */}
      {report.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {report.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-3 mt-auto">
        <span className="truncate mr-2">{report.author ?? 'AMORA Research'}</span>
        <span className="shrink-0">{timeAgo(report.published_at)}</span>
      </div>
    </Link>
  );
}
