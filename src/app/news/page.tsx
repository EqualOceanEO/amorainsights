'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { INDUSTRY_HIERARCHY, INDUSTRY_COLORS, INDUSTRY_DOT_COLORS } from '@/lib/industries';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  industry_slug: string;
  industry_level2?: string | null;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupByDate(items: NewsItem[]) {
  const groups: { [date: string]: NewsItem[] } = {};
  items.forEach(item => {
    const dateKey = new Date(item.published_at).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function newsHref(item: NewsItem) {
  return `/news/${item.slug || item.id}`;
}

function TimelineNewsCard({ item }: { item: NewsItem }) {
  const industryColor = INDUSTRY_COLORS[item.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  const industryLabel = item.industry_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Link
      href={newsHref(item)}
      className="group block bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        
        {/* Image */}
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
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${industryColor}`}>
              {industryLabel}
            </span>
            {item.is_premium && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                Premium
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug">
            {item.title}
          </h3>

          {item.summary && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.summary}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600">
            {item.source_name && <span className="truncate">{item.source_name}</span>}
            {item.source_name && item.author && <span>·</span>}
            {item.author && <span className="truncate">{item.author}</span>}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 border border-gray-700 transition-all opacity-0 group-hover:opacity-100">
          <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-32 h-32 rounded-xl bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2 mt-3" />
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [items, setItems]         = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [industry, setIndustry]   = useState('');
  const [industryLevel2, setIndustryLevel2] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '24',
        ...(industry && { industry }),
        ...(industryLevel2 && { level2: industryLevel2 }),
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

  const groupedItems = groupByDate(items);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      {/* Header */}
      <div className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <h1 className="text-3xl font-bold mb-3">Market Intelligence</h1>
          <p className="text-gray-400 text-sm mb-6">Latest developments across frontier industries</p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
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

            {/* Industry filters - Two rows */}
            <div className="flex flex-col gap-2">
              {/* Level 1: Primary industries */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  onClick={() => {
                    setIndustry('');
                    setIndustryLevel2('');
                  }}
                  className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    industry === ''
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  All
                </button>
                {INDUSTRY_HIERARCHY.map(group => (
                  <button
                    key={group.level1.id}
                    onClick={() => {
                      setIndustry(group.level1.id);
                      setIndustryLevel2('');
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      industry === group.level1.id && !industryLevel2
                        ? 'bg-blue-600 text-white'
                        : industry === group.level1.id && industryLevel2
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {group.level1.label}
                  </button>
                ))}
              </div>

              {/* Level 2: Sub-categories (only show when level 1 is selected) */}
              {industry && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2.map(level2 => (
                    <button
                      key={level2}
                      onClick={() => setIndustryLevel2(level2)}
                      className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        industryLevel2 === level2
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {level2}
                    </button>
                  ))}
                  {/* Clear level 2 selection */}
                  {industryLevel2 && (
                    <button
                      onClick={() => setIndustryLevel2('')}
                      className="shrink-0 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-white transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <svg className="w-12 h-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h2" />
            </svg>
            <p className="text-sm">No articles found</p>
          </div>
        ) : (
          // Timeline layout
          <div className="relative">
            
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />

            {/* Timeline groups */}
            <div className="space-y-8 md:space-y-12 pl-8">
              {groupedItems.map(([dateKey, dateItems]) => {
                const dateObj = new Date(dateKey);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum  = dateObj.getDate();
                const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div key={dateKey}>
                    {/* Timeline marker */}
                    <div className="absolute -left-4 top-1 w-7 h-7 rounded-full bg-gray-950 border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    </div>

                    {/* Date header */}
                    <div className="mb-4">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        {monthShort} {dayNum}
                      </div>
                      <h2 className="text-sm font-bold text-white">
                        {formatDateFull(dateKey)}
                      </h2>
                      <div className="text-xs text-gray-600 mt-1">
                        {dateItems.length} {dateItems.length === 1 ? 'update' : 'updates'}
                      </div>
                    </div>

                    {/* Articles for this date */}
                    <div className="space-y-3">
                      {dateItems.map(item => (
                        <div key={item.id} className="relative group">
                          {/* Dot connector */}
                          <div className={`absolute -left-7 top-5 w-3 h-3 rounded-full ${INDUSTRY_DOT_COLORS[item.industry_slug] ?? 'bg-gray-600'} opacity-60 group-hover:opacity-100 transition-opacity`} />
                          <TimelineNewsCard item={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-gray-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Previous
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
