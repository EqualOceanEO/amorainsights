'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
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
}

const INDUSTRIES = [
  { slug: '', label: 'All' },
  { slug: 'ai', label: 'AI' },
  { slug: 'ai-semiconductors', label: 'AI Chips' },
  { slug: 'semiconductors-materials', label: 'Semiconductors' },
  { slug: 'autonomous-vehicles', label: 'Autonomous Vehicles' },
  { slug: 'green-tech', label: 'Green Tech' },
  { slug: 'life-sciences', label: 'Life Sciences' },
  { slug: 'new-space', label: 'New Space' },
  { slug: 'advanced-materials', label: 'Advanced Materials' },
  { slug: 'humanoid-robots', label: 'Humanoid Robots' },
];

const INDUSTRY_COLORS: Record<string, string> = {
  'ai': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'ai-semiconductors': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'semiconductors-materials': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  'green-tech': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'life-sciences': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'new-space': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'autonomous-vehicles': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  'advanced-materials': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  'humanoid-robots': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  'ai-agents': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function newsHref(item: NewsItem) {
  return `/news/${item.slug || item.id}`;
}

function NewsCard({ item, featured }: { item: NewsItem; featured?: boolean }) {
  const industryColor = INDUSTRY_COLORS[item.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  const industryLabel = INDUSTRIES.find(i => i.slug === item.industry_slug)?.label ?? item.industry_slug;

  if (featured) {
    return (
      <Link href={newsHref(item)} className="group block col-span-2 relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-300">
        {item.cover_image_url ? (
          <div className="relative h-64 overflow-hidden">
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-blue-900/30 to-gray-900" />
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${industryColor}`}>{industryLabel}</span>
            {item.is_premium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Premium</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h2>
          {item.summary && <p className="text-gray-400 text-sm line-clamp-2 mb-4">{item.summary}</p>}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {item.source_name && <span>{item.source_name}</span>}
            {item.author && <><span>·</span><span>{item.author}</span></>}
            <span>·</span>
            <span>{formatDate(item.published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={newsHref(item)} className="group flex flex-col bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      {item.cover_image_url ? (
        <div className="relative h-44 overflow-hidden shrink-0">
          <img
            src={item.cover_image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${industryColor}`}>{industryLabel}</span>
            {item.is_premium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Premium</span>
            )}
          </div>
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 shrink-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${industryColor}`}>{industryLabel}</span>
            {item.is_premium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Premium</span>
            )}
          </div>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">{item.title}</h3>
        {item.summary && <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">{item.summary}</p>}
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-auto">
          {item.source_name && <span className="truncate">{item.source_name}</span>}
          <span className="shrink-0">·</span>
          <span className="shrink-0">{formatDate(item.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [items, setItems]         = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [industry, setIndustry]   = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '12',
        ...(industry && { industry }),
        ...(search   && { search }),
      });
      const res = await fetch(`/api/news?${params}`);
      const json = await res.json();
      setItems(json.data ?? []);
      setTotal(json.totalPages ?? 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, industry, search]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [industry, search]);

  const featured = items.slice(0, 2);
  const rest     = items.slice(2);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      {/* Header */}
      <div className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold mb-1">Market Intelligence</h1>
          <p className="text-gray-400 text-sm">Latest developments across frontier industries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Industry tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {INDUSTRIES.map(ind => (
              <button
                key={ind.slug}
                onClick={() => setIndustry(ind.slug)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  industry === ind.slug
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured row */}
        {!loading && featured.length > 0 && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {featured.map(item => (
              <NewsCard key={item.id} item={item} featured />
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <svg className="w-12 h-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
            <p className="text-sm">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(page === 1 ? rest : items).map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
