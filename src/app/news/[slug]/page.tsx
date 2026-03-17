'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  industry_slug: string;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  cover_image_url: string | null;
  slug: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string;
  related?: NewsItem[];
}

const INDUSTRY_LABELS: Record<string, string> = {
  'ai': 'AI',
  'ai-semiconductors': 'AI Chips',
  'semiconductors-materials': 'Semiconductors',
  'autonomous-vehicles': 'Autonomous Vehicles',
  'green-tech': 'Green Tech',
  'life-sciences': 'Life Sciences',
  'new-space': 'New Space',
  'advanced-materials': 'Advanced Materials',
  'humanoid-robots': 'Humanoid Robots',
  'ai-agents': 'AI Agents',
  'launch-vehicles': 'Launch Vehicles',
  'gene-editing': 'Gene Editing',
  'ev-batteries': 'EV Batteries',
  'energy-storage': 'Energy Storage',
};

const INDUSTRY_COLORS: Record<string, string> = {
  'ai': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'ai-semiconductors': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'semiconductors-materials': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  'autonomous-vehicles': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  'green-tech': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'life-sciences': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'new-space': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'advanced-materials': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  'humanoid-robots': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  'ai-agents': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'launch-vehicles': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'gene-editing': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'ev-batteries': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'energy-storage': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function ContentBlock({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-5">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-gray-300 leading-relaxed text-base">{para.trim()}</p>
      ))}
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
        <div className="max-w-3xl mx-auto px-5 py-16 animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/4" />
          <div className="h-10 bg-gray-800 rounded w-full" />
          <div className="h-10 bg-gray-800 rounded w-3/4" />
          <div className="h-64 bg-gray-800 rounded-2xl mt-8" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
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

  const industryLabel = INDUSTRY_LABELS[item.industry_slug] ?? item.industry_slug;
  const industryColor = INDUSTRY_COLORS[item.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      <article className="max-w-3xl mx-auto px-5 py-12">

        {/* Back */}
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>

        {/* Tags row */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${industryColor}`}>{industryLabel}</span>
          {item.is_premium && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Premium
            </span>
          )}
          {item.tags?.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">{item.title}</h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-800">
          {item.author && <span className="text-gray-300 font-medium">{item.author}</span>}
          {item.source_name && (
            item.source_url
              ? <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">{item.source_name}</a>
              : <span>{item.source_name}</span>
          )}
          <span>{formatDate(item.published_at)}</span>
        </div>

        {/* Cover image */}
        {item.cover_image_url && (
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
            <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Summary callout */}
        {item.summary && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 mb-8">
            <p className="text-blue-200 text-base leading-relaxed font-medium">{item.summary}</p>
          </div>
        )}

        {/* Content */}
        {item.content ? (
          <ContentBlock content={item.content} />
        ) : (
          <div className="text-center py-16 text-gray-600">
            <p className="text-sm">Full article content not available.</p>
            {item.source_url && (
              <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
                Read original article
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Source link */}
        {item.source_url && item.content && (
          <div className="mt-10 pt-6 border-t border-gray-800">
            <a href={item.source_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Read full article on {item.source_name || 'source'}
            </a>
          </div>
        )}
      </article>

      {/* Related articles */}
      {item.related && item.related.length > 0 && (
        <div className="border-t border-gray-800 mt-4">
          <div className="max-w-3xl mx-auto px-5 py-12">
            <h2 className="text-lg font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {item.related.map(rel => (
                <Link
                  key={rel.id}
                  href={`/news/${rel.slug || rel.id}`}
                  className="group block bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 p-4 transition-all"
                >
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${INDUSTRY_COLORS[rel.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                    {INDUSTRY_LABELS[rel.industry_slug] ?? rel.industry_slug}
                  </span>
                  <p className="mt-2 text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">{rel.title}</p>
                  <p className="mt-1.5 text-xs text-gray-600">{formatDate(rel.published_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
