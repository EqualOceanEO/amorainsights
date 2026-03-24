'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { INDUSTRY_COLORS, INDUSTRY_DOT_COLORS } from '@/lib/industries';
import IndustryFilterBar from '@/components/IndustryFilterBar';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content?: string | null;
  industry_id: string;
  industry_slug: string;
  sub_sector_id?: string | null;
  company_id?: number | null;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_premium: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

function formatDateFull(iso: string) {
  const d = new Date(iso + 'T00:00:00'); // avoid timezone shift on date-only strings
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: NewsItem[]) {
  const groups: Record<string, NewsItem[]> = {};
  items.forEach(item => {
    const dateKey = item.published_at?.split('T')[0] ?? item.created_at?.split('T')[0] ?? 'unknown';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function newsHref(item: NewsItem) {
  return `/news/${item.slug || item.id}`;
}

function getIndustryLabel(item: NewsItem) {
  const id = item.industry_id || item.industry_slug || '';
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === id);
  return group?.level1.label || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General';
}

function TimelineNewsCard({ item }: { item: NewsItem }) {
  const industryKey = item.industry_id || item.industry_slug || '';
  const colorClass = INDUSTRY_COLORS[industryKey] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  const industryLabel = getIndustryLabel(item);

  return (
    <Link
      href={newsHref(item)}
      className="group block bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-5">

        {/* Thumbnail */}
        {item.cover_image_url ? (
          <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0">
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full sm:w-32 h-32 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${colorClass}`}>
              {industryLabel}
            </span>
            {item.sub_sector_id && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                {item.sub_sector_id}
              </span>
            )}
            {item.is_premium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                Premium
              </span>
            )}
            {item.is_featured && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                Featured
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug">
            {item.title}
          </h3>

          {item.summary && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{item.summary}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600">
            {item.source_name && <span className="truncate max-w-[140px]">{item.source_name}</span>}
            {item.source_name && item.author && <span>·</span>}
            {item.author && <span className="truncate">{item.author}</span>}
            {item.tags?.length > 0 && (
              <>
                <span>·</span>
                <span className="text-gray-700 truncate">{item.tags.slice(0, 2).join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center self-center">
          <div className="w-8 h-8 rounded-lg bg-gray-800/50 group-hover:bg-blue-500/20 border border-gray-700/50 group-hover:border-blue-500/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-32 h-32 rounded-xl bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/4" />
          <div className="h-5 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [items, setItems]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '24',
        ...(industry && { industry }),
        ...(search   && { search }),
      });
      const res = await fetch(`/api/news?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setItems(json.data ?? []);
      setTotal(json.totalPages ?? 1);
      setTotalCount(json.total ?? 0);
    } catch (err: any) {
      console.error('News fetch error:', err);
      setError(err.message || 'Failed to load news');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, industry, search]);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => { setPage(1); }, [industry, search]);

  const groupedItems = groupByDate(items);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      {/* Sticky header */}
      <div className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Market Intelligence</h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading ? 'Loading…' : `${totalCount.toLocaleString()} articles across frontier industries`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <IndustryFilterBar
            search={search}
            industry={industry}
            showSearch={true}
            searchPlaceholder="Search articles…"
            onSearchChange={setSearch}
            onLevel1Change={setIndustry}
          />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-red-400 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button onClick={fetchNews} className="ml-auto underline hover:no-underline text-xs">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
            <p className="text-sm font-medium">No articles found</p>
            {(search || industry) && (
              <button onClick={() => { setSearch(''); setIndustry(''); }} className="mt-3 text-xs text-blue-500 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-10">
            {groupedItems.map(([dateKey, dateItems]) => (
              <div key={dateKey}>
                {/* Date header row: [axis col 32px] + [content] */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Axis: dot centered in 32px wide column */}
                  <div className="flex-none w-8 flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-gray-950 border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                  </div>
                  {/* Label */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-4">
                      {formatDateFull(dateKey)}
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5 leading-4">
                      {dateItems.length} {dateItems.length === 1 ? 'update' : 'updates'}
                    </p>
                  </div>
                </div>

                {/* Cards column with vertical line on the left axis */}
                <div className="flex gap-3">
                  {/* Axis: vertical line centered in 32px col */}
                  <div className="flex-none w-8 flex justify-center">
                    <div className="w-px bg-gradient-to-b from-blue-500/40 via-blue-500/15 to-transparent" />
                  </div>
                  {/* Cards */}
                  <div className="flex-1 space-y-3 pb-2">
                    {dateItems.map(item => {
                      const itemDot = INDUSTRY_DOT_COLORS[item.industry_id || item.industry_slug || ''] ?? 'bg-gray-600';
                      return (
                        <div key={item.id} className="group">
                          <TimelineNewsCard item={item} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-gray-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
