'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SubscribeBox from '@/components/SubscribeBox';
import { INDUSTRY_HIERARCHY } from '@/lib/industries';
import { supabase } from '@/lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Report {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  industry_slug: string;
  sub_sector: string | null;
  author: string | null;
  tags: string[];
  is_premium: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
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
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function normalizeReport(item: any): Report {
  let tags: string[] = [];
  if (Array.isArray(item.tags)) {
    tags = item.tags;
  } else if (typeof item.tags === 'string' && item.tags.length > 0) {
    try { tags = JSON.parse(item.tags); } catch {
      tags = item.tags.split(' ').filter(Boolean);
    }
  }
  return { ...item, tags };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-24 bg-gray-800 rounded-full" />
        <div className="h-4 w-16 bg-gray-800 rounded-full" />
      </div>
      <div className="h-5 bg-gray-800 rounded w-4/5 mb-2" />
      <div className="h-4 bg-gray-800 rounded w-3/5 mb-4" />
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: Report }) {
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === report.industry_slug);
  const industryLabel = group?.level1.label ?? report.industry_slug;

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 flex flex-col transition cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full truncate">
          {industryLabel}
        </span>
        {report.is_premium ? (
          <span className="text-xs font-semibold bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            ⭐ Premium
          </span>
        ) : (
          <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full shrink-0">
            Free
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white group-hover:text-blue-300 transition leading-snug mb-2 line-clamp-2">
        {report.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
        {report.summary}
      </p>

      {/* Tags */}
      {report.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {report.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {report.tags.length > 3 && (
            <span className="text-xs text-gray-600">+{report.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800 pt-3 mt-auto">
        <span>{report.author ?? 'AMORA Research'}</span>
        <span>{timeAgo(report.published_at)}</span>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export default function ReportsPage() {
  const [reports, setReports]     = useState<Report[]>([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [industry, setIndustry]   = useState('');
  const [industryL2, setL2]       = useState('');
  const [premium, setPremium]     = useState<'all' | 'free' | 'premium'>('all');
  const [search, setSearch]       = useState('');

  // Level-2 options for selected L1
  const level2Options = INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2 ?? [];

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to   = from + PAGE_SIZE - 1;

      let query = supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .in('production_status', ['published', 'approved'])
        .order('published_at', { ascending: false })
        .range(from, to);

      if (industry) query = query.eq('industry_slug', industry);
      if (industryL2) query = query.contains('tags', [industryL2]);
      if (premium === 'free')    query = query.eq('is_premium', false);
      if (premium === 'premium') query = query.eq('is_premium', true);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error, count } = await query;
      if (error) throw error;

      setReports((data ?? []).map(normalizeReport));
      setTotal(count ?? 0);
      setTotalPages(Math.ceil((count ?? 0) / PAGE_SIZE));
    } catch (err) {
      console.error('[ReportsPage] fetch error:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, industry, industryL2, premium, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { setPage(1); }, [industry, industryL2, premium, search]);

  const handleLevel1Change = (id: string) => {
    setIndustry(id);
    setL2('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/reports" />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Research Reports</h1>
          <p className="text-gray-400 mt-1">
            In-depth analysis across six frontier industries.
            {total > 0 && (
              <span className="ml-2 text-gray-500">{total} report{total !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="mb-8 space-y-2">
          {/* Row 1: L1 industry tabs (left) + Free/Premium buttons (right) */}
          <div className="flex items-center gap-2">
            {/* L1 tabs — scrollable */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 min-h-[38px]">
              <button
                onClick={() => handleLevel1Change('')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  industry === ''
                    ? 'bg-blue-500 text-white shadow shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                All
              </button>
              {INDUSTRY_HIERARCHY.map(group => {
                const isActive = industry === group.level1.id;
                return (
                  <button
                    key={group.level1.id}
                    onClick={() => handleLevel1Change(isActive ? '' : group.level1.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-500 text-white shadow shadow-blue-500/30'
                        : 'text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    {group.level1.label}
                  </button>
                );
              })}
            </div>

            {/* Search — fixed width */}
            <div className="relative w-52 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full bg-gray-900/80 border border-gray-700/50 rounded-xl pl-9 pr-8 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:bg-gray-900 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Free / Premium — right-aligned, never wrap */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPremium('all')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  premium === 'all'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPremium(premium === 'free' ? 'all' : 'free')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  premium === 'free'
                    ? 'bg-green-800 text-green-300 border border-green-700'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setPremium(premium === 'premium' ? 'all' : 'premium')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                  premium === 'premium'
                    ? 'bg-amber-800/60 text-amber-300 border border-amber-700'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                <span>⭐</span>
                <span>Premium</span>
              </button>
            </div>
          </div>

          {/* Row 2: L2 sub-sectors — only when L1 selected */}
          {industry && level2Options.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-h-[32px]">
              {level2Options.map(lv2 => {
                const isActive = industryL2 === lv2.name;
                return (
                  <button
                    key={lv2.slug}
                    onClick={() => setL2(isActive ? '' : lv2.name)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                    }`}
                  >
                    {lv2.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Report Grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : reports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {reports.map(report => <ReportCard key={report.id} report={report} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <button
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    ← Previous
                  </button>
                )}
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📊</div>
            {(industry || industryL2 || premium !== 'all') ? (
              <>
                <p className="text-lg font-medium text-gray-400 mb-2">No reports match these filters</p>
                <p className="text-sm mb-6">Try removing a filter to see more results.</p>
                <button
                  onClick={() => { setIndustry(''); setL2(''); setPremium('all'); }}
                  className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-400 mb-2">Reports coming soon</p>
                <p className="text-sm">Database is being seeded. Check back shortly.</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Newsletter ── */}
      <section className="py-16 border-t border-gray-800 bg-gray-950">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-xs tracking-widest text-blue-500 uppercase mb-4">Every Friday</p>
          <h2 className="text-2xl font-bold text-white mb-3">AMORA Weekly</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Six frontier tracks, one briefing a week. No account required.
          </p>
          <div className="max-w-sm mx-auto">
            <SubscribeBox source="reports_page" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
