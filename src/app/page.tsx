import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type Report, type NewsItem, type Company, type IndustrySlug } from '@/lib/db';
import SubscribeBox from '@/components/SubscribeBox';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// ─── Supabase (server-side) ───────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

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

function industryMeta(slug: string) {
  return INDUSTRY_META[slug as IndustrySlug] ?? { name: slug, icon: '📊', name_cn: slug };
}

// ─── Page (SSR) ───────────────────────────────────────────────────────────────

export default async function Home() {
  const supabase = getSupabase();

  // Parallel fetch: latest news (8), latest reports (6), featured companies (6), stats
  const [newsRes, reportsRes, companiesRes, statsRes] = await Promise.allSettled([
    supabase
      .from('news_items')
      .select('id,title,slug,summary,industry_slug,industry_id,source_name,is_featured,is_premium,published_at,tags,cover_image_url')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(8),

    supabase
      .from('reports')
      .select('id,title,slug,summary,industry_slug,is_premium,author,tags,published_at,report_format,cover_image_url')
      .in('production_status', ['published', 'approved'])
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(6),

    supabase
      .from('companies')
      .select('id,name,name_cn,industry_slug,sub_sector,country,hq_city,description,is_public,employee_count,amora_total,valuation_usd,last_funding_type,logo_url,tags')
      .eq('is_tracked', true)
      .not('amora_total', 'is', null)
      .order('amora_total', { ascending: false })
      .limit(6),

    Promise.all([
      supabase.from('reports').select('id', { count: 'exact', head: true }).in('production_status', ['published', 'approved']),
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('is_tracked', true),
      supabase.from('news_items').select('id', { count: 'exact', head: true }).eq('is_published', true),
    ]),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestNews: any[] = newsRes.status === 'fulfilled' ? (newsRes.value.data ?? []) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestReports: any[] = reportsRes.status === 'fulfilled' ? (reportsRes.value.data ?? []) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topCompanies: any[] = companiesRes.status === 'fulfilled' ? (companiesRes.value.data ?? []) : [];

  let reportsCount = 0, companiesCount = 0, newsCount = 0;
  if (statsRes.status === 'fulfilled') {
    const [r, c, n] = statsRes.value;
    reportsCount = r.count ?? 0;
    companiesCount = c.count ?? 0;
    newsCount = n.count ?? 0;
  }

  const featuredNews = latestNews[0] ?? null;
  const secondaryNews = latestNews.slice(1, 5);
  const sidebarNews = latestNews.slice(5, 8);

  const featuredReport = latestReports[0] ?? null;
  const otherReports = latestReports.slice(1);

  const industries = ALL_INDUSTRY_SLUGS.map((slug) => ({
    slug,
    ...INDUSTRY_META[slug],
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/" />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-800/60">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            {/* Left copy */}
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Frontier Tech Intelligence
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-4 tracking-tight">
                Mapping the companies<br />
                <span className="text-blue-400">shaping tomorrow.</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
                Deep-dive research, live company tracking, and daily intelligence
                across AI, robotics, biotech, clean energy, and the frontier industries
                defining the next decade.
              </p>
            </div>

            {/* Right — subscribe + stat pills */}
            <div className="flex flex-col gap-4 md:items-end shrink-0 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SubscribeBox source="homepage" />
              </div>
              <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
                <StatPill icon="📊" label="Reports" value={reportsCount} href="/reports" />
                <StatPill icon="🏢" label="Companies" value={companiesCount} href="/companies" />
                <StatPill icon="📰" label="News articles" value={newsCount} href="/news" />
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/reports" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              Browse Reports →
            </Link>
            <Link href="/companies" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              Company Tracker
            </Link>
            <Link href="/news" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* ── Industry Pills ───────────────────────────────────────────────────── */}
      <section className="border-b border-gray-800/60 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-2.5 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-600 font-medium shrink-0">Coverage:</span>
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/news?industry=${ind.slug}`}
              className="shrink-0 flex items-center gap-1.5 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
            >
              <span>{ind.icon}</span>
              <span>{ind.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 py-10 flex-1">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — LATEST NEWS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <SectionHeader title="Latest News" href="/news" icon="📰" />

          {latestNews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              {/* Left: featured + secondary grid */}
              <div className="flex flex-col gap-4">
                {/* Featured news */}
                {featuredNews && <FeaturedNewsCard item={featuredNews} />}

                {/* Secondary 4-grid */}
                {secondaryNews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {secondaryNews.map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: sidebar mini-list */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Also in the news</p>
                {sidebarNews.map((item) => (
                  <NewsListItem key={item.id} item={item} />
                ))}

                {/* Quick-link to news page */}
                <Link
                  href="/news"
                  className="mt-2 text-center text-xs text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/40 py-2 rounded-lg transition"
                >
                  View all news →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState emoji="📰" text="News coming soon" />
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — RESEARCH REPORTS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-12 pt-10 border-t border-gray-800/50">
          <SectionHeader title="Research Reports" href="/reports" icon="📊" />

          {latestReports.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
              {/* Featured report — full-width left card */}
              {featuredReport && (
                <div className="lg:col-span-2">
                  <FeaturedReportCard report={featuredReport} />
                </div>
              )}

              {/* Other reports */}
              {otherReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <EmptyState emoji="📊" text="Reports coming soon" />
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — TOP COMPANIES (by AMORA score)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-12 pt-10 border-t border-gray-800/50">
          <SectionHeader title="Top Tracked Companies" href="/companies" icon="🏢" />

          {topCompanies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCompanies.map((co) => (
                <CompanyCard key={co.id} company={co} />
              ))}
            </div>
          ) : (
            <EmptyState emoji="🏢" text="Company data coming soon" />
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — SIX INDUSTRIES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-4 pt-10 border-t border-gray-800/50">
          <SectionHeader title="Six Frontier Industries" href="/reports" icon="🌐" hideViewAll />
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
                <div className="text-xs text-gray-600 mt-0.5">{ind.name_cn}</div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

// ─── Shared layout helpers ────────────────────────────────────────────────────

function SectionHeader({
  title, href, icon, hideViewAll,
}: { title: string; href: string; icon: string; hideViewAll?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
        <h2 className="text-base font-bold text-white tracking-wide">
          <span className="mr-2 text-sm">{icon}</span>{title}
        </h2>
      </div>
      {!hideViewAll && (
        <Link href={href} className="text-xs text-blue-400 hover:text-blue-300 transition font-medium">
          View all →
        </Link>
      )}
    </div>
  );
}

function StatPill({
  icon, label, value, href,
}: { icon: string; label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 hover:border-blue-600/40 rounded-lg px-4 py-2 transition"
    >
      <span className="text-sm">{icon}</span>
      <span className="text-lg font-bold text-white">{value.toLocaleString()}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </Link>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="text-center py-16 text-gray-600">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-gray-500">{text}</p>
    </div>
  );
}

// ─── News Cards ───────────────────────────────────────────────────────────────

function FeaturedNewsCard({ item }: { item: NewsItem }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ind = industryMeta((item as any).industry_slug || (item as any).industry_id || '');
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group relative flex flex-col bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl overflow-hidden transition"
    >
      {/* Color accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            {ind.icon} {ind.name}
          </span>
          {item.is_featured && (
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full font-medium">Featured</span>
          )}
          {item.is_premium && (
            <span className="text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">⭐ Premium</span>
          )}
          <span className="text-xs text-gray-600 ml-auto shrink-0">{timeAgo(item.published_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-3">
          {item.summary}
        </p>

        {/* Source */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{item.source_name ?? 'AMORA'}</span>
          <span className="text-blue-400 group-hover:text-blue-300 transition font-medium">Read more →</span>
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ind = industryMeta((item as any).industry_slug || (item as any).industry_id || '');
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600/40 rounded-xl p-4 flex flex-col transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-gray-800/80 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 truncate">
          {ind.icon} <span className="truncate">{ind.name}</span>
        </span>
        <span className="text-xs text-gray-600 ml-auto shrink-0">{timeAgo(item.published_at)}</span>
      </div>
      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-3 flex-1">
        {item.title}
      </h3>
      <p className="text-xs text-gray-600">{item.source_name ?? 'AMORA'}</p>
    </Link>
  );
}

function NewsListItem({ item }: { item: NewsItem }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ind = industryMeta((item as any).industry_slug || (item as any).industry_id || '');
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex gap-3 items-start p-3 bg-gray-900/50 border border-gray-800/60 hover:border-blue-600/30 rounded-lg transition"
    >
      <span className="text-lg shrink-0 mt-0.5">{ind.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition line-clamp-2 leading-snug mb-1">
          {item.title}
        </p>
        <p className="text-xs text-gray-600">{timeAgo(item.published_at)}</p>
      </div>
    </Link>
  );
}

// ─── Report Cards ─────────────────────────────────────────────────────────────

function FeaturedReportCard({ report }: { report: Report }) {
  const meta = industryMeta(report.industry_slug);
  const isH5 = report.report_format === 'html' || report.report_format === 'h5_embed';

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group relative flex flex-col md:flex-row bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl overflow-hidden transition"
    >
      <div className="hidden md:block w-1.5 shrink-0 bg-gradient-to-b from-blue-500 to-cyan-600" />
      <div className="flex-1 p-6 md:p-7">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            {meta.icon} {meta.name}
          </span>
          {report.is_premium ? (
            <span className="text-xs font-semibold bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded-full">⭐ Premium</span>
          ) : (
            <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full">Free</span>
          )}
          {isH5 && <span className="text-xs bg-purple-900/40 text-purple-400 px-2.5 py-1 rounded-full font-medium">H5</span>}
          <span className="text-xs text-gray-600 ml-auto">{timeAgo(report.published_at)}</span>
        </div>
        <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition leading-snug mb-2">
          {report.title}
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4 max-w-2xl">
          {report.summary}
        </p>
        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {report.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
        )}
        <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition">
          Read full report →
        </span>
      </div>
    </Link>
  );
}

function ReportCard({ report }: { report: Report }) {
  const meta = industryMeta(report.industry_slug);
  const isH5 = report.report_format === 'html' || report.report_format === 'h5_embed';

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-5 flex flex-col transition"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1.5 truncate">
          {meta.icon} <span className="truncate">{meta.name}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isH5 && <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded font-medium">H5</span>}
          {report.is_premium
            ? <span className="text-xs bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded-full">⭐</span>
            : <span className="text-xs bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded-full">Free</span>}
        </div>
      </div>
      <h3 className="font-semibold text-sm text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-2">
        {report.title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
        {report.summary}
      </p>
      {report.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {report.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">#{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-3 mt-auto">
        <span className="truncate mr-2">{report.author ?? 'AMORA Research'}</span>
        <span className="shrink-0">{timeAgo(report.published_at)}</span>
      </div>
    </Link>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CompanyCard({ company }: { company: any }) {
  const ind = industryMeta(company.industry_slug ?? '');
  const score = company.amora_total ? Number(company.amora_total).toFixed(1) : null;

  // Score color
  const scoreColor =
    !score ? 'text-gray-500' :
    Number(score) >= 8 ? 'text-emerald-400' :
    Number(score) >= 6.5 ? 'text-blue-400' : 'text-gray-400';

  return (
    <Link
      href={`/companies/${company.id}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-5 flex flex-col gap-3 transition"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-sm text-white group-hover:text-blue-300 transition truncate leading-snug">
            {company.name}
          </p>
          {company.name_cn && (
            <p className="text-xs text-gray-500 truncate">{company.name_cn}</p>
          )}
        </div>
        {/* AMORA score badge */}
        {score && (
          <div className="shrink-0 flex flex-col items-center bg-gray-800/80 border border-gray-700/50 rounded-lg px-2.5 py-1.5">
            <span className={`text-base font-bold leading-none ${scoreColor}`}>{score}</span>
            <span className="text-[9px] text-gray-600 mt-0.5 tracking-wide">AMORA</span>
          </div>
        )}
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
          {ind.icon} {ind.name}
        </span>
        {company.sub_sector && (
          <span className="text-xs bg-gray-800/60 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]">
            {company.sub_sector}
          </span>
        )}
        {company.is_public && (
          <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Listed</span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
        {company.description ?? '—'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-2 mt-auto">
        <span>{company.hq_city ? `${company.hq_city}, ` : ''}{company.country}</span>
        {company.last_funding_type && (
          <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-500">{company.last_funding_type}</span>
        )}
      </div>
    </Link>
  );
}
