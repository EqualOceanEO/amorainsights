import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  getReports,
  INDUSTRY_META,
  ALL_INDUSTRY_SLUGS,
  type IndustrySlug,
  type Report,
} from '@/lib/db';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(dateStr);
}

// ─── Filter bar (client island not needed — use URL params) ───────────────────

interface SearchParams {
  industry?: string;
  premium?: string;
  page?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const industryFilter = ALL_INDUSTRY_SLUGS.includes(params.industry as IndustrySlug)
    ? (params.industry as IndustrySlug)
    : undefined;
  const premiumFilter =
    params.premium === 'true' ? true : params.premium === 'false' ? false : undefined;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  // Fetch data — degrade gracefully if DB not ready
  let reports: Report[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    const result = await getReports({
      page,
      pageSize: 12,
      industrySlug: industryFilter,
      isPremium: premiumFilter,
    });
    reports = result.data;
    totalPages = result.totalPages;
    total = result.total;
  } catch {
    // DB not yet seeded — show empty state
  }

  // Build filter URL helper
  function filterUrl(overrides: Partial<SearchParams & { page: string }>) {
    const merged = {
      ...(industryFilter ? { industry: industryFilter } : {}),
      ...(premiumFilter !== undefined ? { premium: String(premiumFilter) } : {}),
      page: String(page),
      ...overrides,
    };
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined))
    ).toString();
    return `/reports${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/reports" className="text-white font-medium">Reports</Link>
            <Link href="/companies" className="hover:text-white transition">Companies</Link>
          </nav>
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
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

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Industry filter */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={filterUrl({ industry: undefined, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !industryFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Industries
            </Link>
            {ALL_INDUSTRY_SLUGS.map((slug) => {
              const meta = INDUSTRY_META[slug];
              return (
                <Link
                  key={slug}
                  href={filterUrl({ industry: slug, page: '1' })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    industryFilter === slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span className="hidden sm:inline">{meta.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Premium filter */}
          <div className="flex gap-2 ml-auto">
            <Link
              href={filterUrl({ premium: undefined, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                premiumFilter === undefined
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              All
            </Link>
            <Link
              href={filterUrl({ premium: 'false', page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                premiumFilter === false
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              Free
            </Link>
            <Link
              href={filterUrl({ premium: 'true', page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                premiumFilter === true
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>⭐</span>
              <span>Premium</span>
            </Link>
          </div>
        </div>

        {/* ── Report Grid ─────────────────────────────────────────────────── */}
        {reports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={filterUrl({ page: String(page - 1) })}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={filterUrl({ page: String(page + 1) })}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState hasFilters={!!industryFilter || premiumFilter !== undefined} />
        )}
      </main>
    </div>
  );
}

// ─── Report Card Component ────────────────────────────────────────────────────

function ReportCard({ report }: { report: Report }) {
  const meta = INDUSTRY_META[report.industry_slug];

  return (
    <Link
      href={`/reports/${report.slug}`}
      className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 flex flex-col transition cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
          {meta.icon} {meta.name}
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
            <span
              key={tag}
              className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded"
            >
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-5xl mb-4">📊</div>
      {hasFilters ? (
        <>
          <p className="text-lg font-medium text-gray-400 mb-2">No reports match these filters</p>
          <p className="text-sm mb-6">Try removing a filter to see more results.</p>
          <Link
            href="/reports"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition"
          >
            Clear filters
          </Link>
        </>
      ) : (
        <>
          <p className="text-lg font-medium text-gray-400 mb-2">Reports coming soon</p>
          <p className="text-sm">
            Database is being seeded. Check back shortly.
          </p>
        </>
      )}
    </div>
  );
}
