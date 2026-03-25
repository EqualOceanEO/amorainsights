'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { INDUSTRY_COLORS, INDUSTRY_DOT_COLORS } from '@/lib/industries';

const SUB_SECTOR_NAMES: Record<string, string> = {
  '49': 'Foundation Models', '50': 'AI Agents', '51': 'AI Semiconductors',
  '52': 'Computer Vision', '53': 'NLP & Speech', '54': 'AI for Science',
  '55': 'Gene Editing', '56': 'Synthetic Biology', '57': 'Cell Therapy',
  '58': 'AI Drug Discovery', '59': 'Medical Devices', '60': 'Genomics & Diagnostics',
  '61': 'EV Batteries', '62': 'Green Hydrogen', '63': 'Solar Photovoltaics',
  '64': 'Energy Storage', '65': 'Carbon Capture', '66': 'Circular Economy',
  '67': 'Humanoid Robots', '68': 'Industrial Robots', '69': 'IIoT & Smart Factory',
  '70': 'Additive Manufacturing', '71': 'Digital Twin', '72': 'Autonomous Vehicles',
  '73': 'Launch Vehicles', '74': 'Satellite Internet', '75': 'Earth Observation',
  '76': 'Space Propulsion', '77': 'Low-Altitude Economy', '78': 'Space Manufacturing',
  '79': 'Carbon Fiber', '80': 'Semiconductor Materials', '81': 'Battery Materials',
  '82': 'Metamaterials', '83': 'Graphene', '84': 'Biomaterials',
};

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  industry_slug: string;
  industry_id: string | number | null;
  sub_sector_id: string | number | null;
  company_id: number | null;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  related?: RelatedItem[];
}

interface RelatedItem {
  id: number;
  title: string;
  summary: string | null;
  industry_slug: string;
  source_name: string | null;
  published_at: string;
  cover_image_url: string | null;
  slug: string | null;
}



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Section heading with left accent
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 bg-blue-500 rounded-full" />
      <h2 className="text-base font-bold text-white uppercase tracking-wide">{children}</h2>
    </div>
  );
}

export default function NewsDetailPage() {
  const { slug }    = useParams<{ slug: string }>();
  const router      = useRouter();
  const [item, setItem]       = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/news/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setItem(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteNav />
        <div className="max-w-4xl mx-auto px-5 py-16 animate-pulse space-y-4">
          <div className="h-5 bg-gray-800 rounded w-1/4" />
          <div className="h-10 bg-gray-800 rounded w-full" />
          <div className="h-10 bg-gray-800 rounded w-3/4" />
          <div className="h-px bg-gray-800 my-6" />
          <div className="h-32 bg-gray-800 rounded-xl" />
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: `${75 + i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteNav />
        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
          <p className="text-2xl font-semibold mb-3">Article not found</p>
          <button onClick={() => router.push('/news')} className="text-sm text-blue-400 hover:underline">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  const industryColor = INDUSTRY_COLORS[item.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  const industryDotColor = INDUSTRY_DOT_COLORS[item.industry_slug] ?? 'bg-gray-400';

  // Build industry label for display
  const industryLabel1 = item.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Split summary into sentences for intro + body
  const summary = item.summary ?? '';
  const sentences = summary.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
  const introSentences = sentences.slice(0, 2);
  const bodySentences  = sentences.slice(2);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      {/* Top gradient bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 py-10">

        {/* Back */}
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-8 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-10">

          {/* ── Main column — expanded content width ── */}
          <article className="min-w-0">

            {/* Tags */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {/* Level 1 */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${industryColor}`}>{industryLabel1}</span>
              {item.is_premium && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Premium</span>
              )}
              {item.tags?.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{tag}</span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-5">{item.title}</h1>

            {/* Meta bar */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 pb-6 border-b border-gray-800/60 mb-6">
              {item.author && <span className="text-gray-300 font-medium">{item.author}</span>}
              {item.author && item.source_name && <span>·</span>}
              {item.source_name && (
                item.source_url
                  ? <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">{item.source_name}</a>
                  : <span>{item.source_name}</span>
              )}
              <span>·</span>
              <span>{formatDate(item.published_at)}</span>
            </div>

            {/* Cover image */}
            {item.cover_image_url && (
              <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
                <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />
              </div>
            )}

            {/* Summary / Lead */}
            {item.summary && (
              <div className="relative bg-gradient-to-br from-blue-500/8 to-blue-600/4 border border-blue-500/15 rounded-2xl p-6 mb-8">
                <div className="absolute top-4 left-4 w-6 h-6 opacity-20">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-medium pl-2">
                  {item.summary}
                </p>
              </div>
            )}



            {/* Article body — intro */}
            {introSentences.length > 0 && (
              <div className="mb-8">
                <SectionHeading>Overview</SectionHeading>
                <div className="space-y-4">
                  {introSentences.map((s, i) => (
                    <p key={i} className="text-gray-300 leading-relaxed text-base">{s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Full content if available — expanded reading layout */}
            {item.content && (
              <div className="mb-10">
                <SectionHeading>Full Analysis</SectionHeading>
                <div className="space-y-6">
                  {item.content.split(/\n\n+/).filter(Boolean).map((para, i) => (
                    <p key={i} className="text-gray-300 leading-loose text-lg">{para.trim()}</p>
                  ))}
                </div>
                {/* Content footer */}
                <div className="mt-8 pt-6 border-t border-gray-800 flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3.75 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 3.75 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 3.75 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-3.75 1.253" />
                  </svg>
                  <span>{item.content.split(/\s+/).filter(Boolean).length} words · AMORA Research</span>
                </div>
              </div>
            )}

            {/* Body sentences (if no full content) */}
            {!item.content && bodySentences.length > 0 && (
              <div className="mb-8">
                <SectionHeading>Details</SectionHeading>
                <div className="space-y-4">
                  {bodySentences.map((s, i) => (
                    <p key={i} className="text-gray-300 leading-relaxed text-base">{s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Market implications callout */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
              <SectionHeading>Market Implications</SectionHeading>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-gray-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Industry observers are closely watching execution timelines and competitive responses from key players across the value chain.
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Supply chain dynamics and regulatory environment remain pivotal variables that could reshape the competitive landscape in the coming quarters.
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Institutional investors with exposure to this sector should monitor downstream effects on margin profiles and capital allocation decisions.
                </li>
              </ul>
            </div>

            {/* Read original */}
            {item.source_url && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-sm text-white font-medium transition-all"
                >
                  Read original article
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {item.source_name && (
                  <span className="text-xs text-gray-600">Source: {item.source_name}</span>
                )}
              </div>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">

            {/* Article info card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Article Info</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Published</div>
                    <div className="text-gray-300">{formatDateShort(item.published_at)}</div>
                  </div>
                </div>

                {item.source_name && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
                    </svg>
                    <div>
                      <div className="text-gray-600 text-xs mb-0.5">Source</div>
                      <div className="text-gray-300">{item.source_name}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Sector</div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${industryColor}`}>{industryLabel1}</span>
                      {item.sub_sector_id && (
                        <span className="text-xs text-gray-400 px-1">
                          {SUB_SECTOR_NAMES[String(item.sub_sector_id)] ?? item.sub_sector_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyst note */}
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">AMORA Note</span>
              </div>
              <p className="text-xs text-amber-200/70 leading-relaxed">
                This development is being tracked across our {industryLabel1} coverage universe. Access full AMORA scoring and competitive analysis in our research reports.
              </p>
              <Link href="/reports" className="mt-3 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                View Reports →
              </Link>
            </div>

            {/* Share */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Share</h3>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-400 hover:text-white transition-all">
                  Copy Link
                </button>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-400 hover:text-white transition-all text-center"
                  >
                    Original
                  </a>
                )}
              </div>
            </div>

          </aside>
        </div>

        {/* Related articles */}
        {item.related && item.related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-800">
            <SectionHeading>Related Articles</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {item.related.map(rel => {
                const relColor = INDUSTRY_COLORS[rel.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
                const relLabel = rel.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <Link
                    key={rel.id}
                    href={`/news/${rel.slug || rel.id}`}
                    className="group block bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 overflow-hidden transition-all hover:-translate-y-0.5"
                  >
                    {rel.cover_image_url ? (
                      <div className="h-32 overflow-hidden">
                        <img src={rel.cover_image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                    <div className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${relColor}`}>{relLabel}</span>
                      <p className="mt-2 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">{rel.title}</p>
                      <p className="mt-2 text-xs text-gray-600">{formatDateShort(rel.published_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
