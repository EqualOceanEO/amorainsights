import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { supabase, INDUSTRY_META, type IndustrySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  source_url: string | null;
  source_name: string | null;
  author: string | null;
  industry_slug: string;
  company_id: number | null;
  company_ids: number[];
  tags: string[];
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: string;
  ticker: string | null;
  country: string;
  hq_city: string | null;
}

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch news article
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !news) notFound();

  const item = news as NewsDetail;
  const industry = INDUSTRY_META[item.industry_slug as IndustrySlug] ?? {
    name: item.industry_slug, icon: '📰',
  };

  // Fetch related company
  let company: Company | null = null;
  if (item.company_id) {
    const { data: co } = await supabase
      .from('companies')
      .select('id,name,name_cn,industry_slug,ticker,country,hq_city')
      .eq('id', item.company_id)
      .maybeSingle();
    company = co as Company | null;
  }

  // Fetch related news (same industry, exclude current)
  const { data: related } = await supabase
    .from('news')
    .select('id,title,slug,summary,industry_slug,published_at,source_name')
    .eq('is_published', true)
    .eq('industry_slug', item.industry_slug)
    .neq('id', item.id)
    .order('published_at', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/news" />

      <main className="max-w-4xl mx-auto px-5 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/news" className="hover:text-white transition">News</Link>
          <span>/</span>
          <span className="inline-flex items-center gap-1 text-gray-400">
            {industry.icon} {industry.name}
          </span>
        </nav>

        {/* Article */}
        <article>
          {/* Cover image */}
          {item.cover_image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
              {industry.icon} {industry.name}
            </span>
            {item.is_premium && (
              <span className="text-xs bg-amber-900/40 text-amber-400 px-2.5 py-1 rounded-full font-medium">
                Pro
              </span>
            )}
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
            {item.title}
          </h1>

          {/* Summary */}
          {item.summary && (
            <p className="text-base text-gray-400 leading-relaxed mb-6 border-l-2 border-blue-500/40 pl-4">
              {item.summary}
            </p>
          )}

          {/* Byline */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-800">
            {item.author && <span>By {item.author}</span>}
            {item.source_name && (
              <span className="flex items-center gap-1">
                {item.source_url ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    {item.source_name} ↗
                  </a>
                ) : (
                  item.source_name
                )}
              </span>
            )}
            <span>{fmtDate(item.published_at)}</span>
          </div>

          {/* Content */}
          {item.content ? (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white">
              {/* Render as plain text with basic formatting */}
              {item.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-300 leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm mb-3">
                {item.is_premium
                  ? 'This article is for Pro subscribers.'
                  : 'Full article content coming soon.'}
              </p>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  Read original source ↗
                </a>
              )}
            </div>
          )}
        </article>

        {/* ── Related Company ────────────────────────────────────────── */}
        {company && (
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Related Company
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg shrink-0">
                {INDUSTRY_META[company.industry_slug as IndustrySlug]?.icon ?? '🏢'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{company.name}</p>
                {company.name_cn && <p className="text-xs text-gray-500">{company.name_cn}</p>}
                <p className="text-xs text-gray-600 mt-0.5">
                  {[company.hq_city, company.country].filter(Boolean).join(', ')}
                  {company.ticker && <span className="ml-2 font-mono text-gray-500">{company.ticker}</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Related Articles ───────────────────────────────────────── */}
        {related && related.length > 0 && (
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              More from {industry.icon} {industry.name}
            </h3>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.slug}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition group"
                >
                  <p className="text-sm font-medium text-white group-hover:text-blue-300 transition line-clamp-2">
                    {r.title}
                  </p>
                  {r.summary && (
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1">{r.summary}</p>
                  )}
                  <p className="text-xs text-gray-700 mt-1.5">
                    {r.source_name && <span>{r.source_name} · </span>}
                    {r.published_at && new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`/news?industry=${item.industry_slug}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition"
              >
                View all {industry.name} news →
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
