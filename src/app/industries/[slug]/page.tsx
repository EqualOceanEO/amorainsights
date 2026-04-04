import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import { getLevel2Options, INDUSTRY_COLORS } from '@/lib/industries';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

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

// ─── Static params for ISR ──────────────────────────────────────────────────

export function generateStaticParams() {
  return ALL_INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

// ─── Page metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = INDUSTRY_META[slug as IndustrySlug];
  if (!meta) return { title: 'Industry Not Found' };
  return {
    title: `${meta.name} — AmoraInsights`,
    description: `Latest news, companies, and research reports in ${meta.name}.`,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = INDUSTRY_META[slug as IndustrySlug];

  if (!meta) notFound();

  const subSectors = getLevel2Options(slug);
  const colorClass = INDUSTRY_COLORS[slug] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  const dotColor = slug === 'ai' ? 'bg-blue-400' : slug === 'life-sciences' ? 'bg-rose-400' : slug === 'green-tech' ? 'bg-emerald-400' : slug === 'manufacturing' ? 'bg-amber-400' : slug === 'new-space' ? 'bg-indigo-400' : 'bg-orange-400';

  const supabase = getSupabase();

  const [newsRes, companiesRes, reportsRes] = await Promise.allSettled([
    supabase
      .from('news_items')
      .select('id,title,slug,summary,industry_slug,source_name,is_premium,published_at,tags,cover_image_url')
      .eq('is_published', true)
      .eq('industry_slug', slug)
      .order('published_at', { ascending: false })
      .limit(12),

    supabase
      .from('companies')
      .select('id,name,name_cn,sub_sector,country,hq_city,description,is_public,amora_total,logo_url')
      .eq('industry_slug', slug)
      .eq('is_tracked', true)
      .order('amora_total', { ascending: false, nullsFirst: false })
      .limit(12),

    supabase
      .from('reports')
      .select('id,title,slug,summary,is_premium,author,tags,published_at,report_format,cover_image_url')
      .in('production_status', ['published', 'approved'])
      .eq('industry_slug', slug)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(12),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const news: any[] = newsRes.status === 'fulfilled' ? (newsRes.value.data ?? []) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companies: any[] = companiesRes.status === 'fulfilled' ? (companiesRes.value.data ?? []) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reports: any[] = reportsRes.status === 'fulfilled' ? (reportsRes.value.data ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath={`/industries/${slug}`} />

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <section className="border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{meta.icon}</span>
                <h1 className="text-3xl font-bold text-white">{meta.name}</h1>
              </div>
              <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
                Tracking {news.length} news, {companies.length} companies, and {reports.length} reports in {meta.name}.
              </p>
            </div>

            {/* Sub-sector pills */}
            {subSectors.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end">
                {subSectors.map((sub) => (
                  <Link
                    key={sub}
                    href={`/industries/${slug}/${encodeURIComponent(sub)}`}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      colorClass
                    } hover:opacity-80`}
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 py-10 flex-1">

        {/* News */}
        <section className="mb-14">
          <div className="flex items-center gap-2.5 mb-5">
            <span className={`w-1.5 h-5 rounded-full ${dotColor}`} />
            <h2 className="text-base font-bold text-white tracking-wide">
              <span className="mr-2 text-sm">📰</span>Latest News
            </h2>
            <span className="text-xs text-gray-600 ml-auto">{news.length} articles</span>
          </div>

          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-blue-600/40 rounded-xl p-5 flex flex-col transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-600">{timeAgo(item.published_at)}</span>
                    {item.is_premium && (
                      <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">⭐</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-snug line-clamp-3 flex-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-3">{item.source_name ?? 'AMORA'}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-10 text-center">No news yet for this industry.</p>
          )}
        </section>

        {/* Companies */}
        <section className="mb-14">
          <div className="flex items-center gap-2.5 mb-5">
            <span className={`w-1.5 h-5 rounded-full ${dotColor}`} />
            <h2 className="text-base font-bold text-white tracking-wide">
              <span className="mr-2 text-sm">🏢</span>Companies
            </h2>
            <Link href={`/companies?industry=${slug}`} className="text-xs text-blue-400 hover:text-blue-300 ml-auto font-medium">
              View all →
            </Link>
          </div>

          {companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((co) => {
                const score = co.amora_total ? Number(co.amora_total).toFixed(1) : null;
                const scoreColor = !score ? 'text-gray-500' : Number(score) >= 8 ? 'text-emerald-400' : Number(score) >= 6.5 ? 'text-blue-400' : 'text-gray-400';
                return (
                  <Link
                    key={co.id}
                    href={`/companies/${co.id}`}
                    className="group bg-gray-900 border border-gray-800 hover:border-blue-600/40 rounded-xl p-5 flex flex-col transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-blue-300 transition truncate">
                          {co.name}
                        </p>
                        {co.name_cn && (
                          <p className="text-xs text-gray-600 truncate">{co.name_cn}</p>
                        )}
                      </div>
                      {score && (
                        <div className="shrink-0 flex flex-col items-center bg-gray-800/80 border border-gray-700/50 rounded-lg px-2 py-1">
                          <span className={`text-sm font-bold leading-none ${scoreColor}`}>{score}</span>
                          <span className="text-[8px] text-gray-600 mt-0.5">AMORA</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {co.sub_sector && (
                        <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                          {co.sub_sector}
                        </span>
                      )}
                      {co.is_public && (
                        <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Listed</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                      {co.description ?? '—'}
                    </p>

                    <div className="text-xs text-gray-600 border-t border-gray-800/60 pt-2 mt-3">
                      {co.hq_city ? `${co.hq_city}, ` : ''}{co.country}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-10 text-center">No tracked companies yet for this industry.</p>
          )}
        </section>

        {/* Reports */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <span className={`w-1.5 h-5 rounded-full ${dotColor}`} />
            <h2 className="text-base font-bold text-white tracking-wide">
              <span className="mr-2 text-sm">📊</span>Research Reports
            </h2>
            <Link href={`/reports?industry=${slug}`} className="text-xs text-blue-400 hover:text-blue-300 ml-auto font-medium">
              View all →
            </Link>
          </div>

          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-5 flex flex-col transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    {r.is_premium ? (
                      <span className="text-[10px] bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full font-medium">⭐ Premium</span>
                    ) : (
                      <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Free</span>
                    )}
                    <span className="text-[10px] text-gray-600">{timeAgo(r.published_at)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-snug line-clamp-2 flex-1 mb-3">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {r.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-2">
                    <span className="truncate">{r.author ?? 'AMORA Research'}</span>
                    <span className="text-blue-400 group-hover:text-blue-300 transition font-medium">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-10 text-center">No reports yet for this industry.</p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
