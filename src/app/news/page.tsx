'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  industry_slug: string;
  company_id: number | null;
  company_ids: number[];
  tags: string[];
  is_premium: boolean;
  published_at: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(d: string | null) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  const industry = INDUSTRY_META[item.industry_slug as IndustrySlug] ?? { name: item.industry_slug, icon: '📰' };

  return (
    <Link href={`/news/${item.slug}`} className="group block">
      <article className="bg-gray-900 border border-gray-800 hover:border-blue-600/40 rounded-xl overflow-hidden transition-all duration-200 h-full flex flex-col">
        {/* Cover image placeholder */}
        {item.cover_image_url ? (
          <div className="aspect-video overflow-hidden bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-4xl opacity-30">{industry.icon}</span>
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {industry.icon} {industry.name}
            </span>
            {item.is_premium && (
              <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">Pro</span>
            )}
            <span className="text-xs text-gray-600 ml-auto">{timeAgo(item.published_at)}</span>
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-3">
            {item.title}
          </h2>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1 mb-3">
              {item.summary}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-3 mt-auto">
            <span>{item.source_name ?? item.author ?? 'AMORA News'}</span>
            {item.tags.length > 0 && (
              <div className="flex gap-1">
                {item.tags.slice(0, 2).map((t) => (
                  <span key={t} className="bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [industry, setIndustry] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (industry) qs.set('industry', industry);
      if (search)   qs.set('q', search);
      const res = await fetch(`/api/news?${qs}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setItems(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, industry, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [industry, search]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/news" />

      <main className="max-w-7xl mx-auto px-5 py-10 flex-1 w-full">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">News & Insights</h1>
          <p className="text-gray-400 mt-1">
            Latest developments across frontier technology sectors.
            {total > 0 && <span className="ml-2 text-gray-600">{total.toLocaleString()} articles</span>}
          </p>
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        <div className="space-y-3 mb-8">
          {/* Industry tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIndustry('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !industry ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Topics
            </button>
            {ALL_INDUSTRY_SLUGS.map((slug) => {
              const meta = INDUSTRY_META[slug];
              return (
                <button
                  key={slug}
                  onClick={() => setIndustry(industry === slug ? '' : slug)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    industry === slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span className="hidden sm:inline">{meta.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Search news…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-3 py-2 text-gray-500 hover:text-white text-sm transition"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                  <div className="h-4 bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-800 rounded w-4/5" />
                  <div className="h-3 bg-gray-800 rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">📰</div>
            <p className="text-lg font-medium text-gray-400 mb-2">
              {search || industry ? 'No articles match your filters' : 'No news yet'}
            </p>
            {(search || industry) && (
              <button
                onClick={() => { setIndustry(''); setSearch(''); setSearchInput(''); }}
                className="mt-4 inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
