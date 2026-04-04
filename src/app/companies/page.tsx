'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { INDUSTRY_HIERARCHY, INDUSTRY_COLORS } from '@/lib/industries';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: string;
  sub_sector: string | null;
  description: string | null;
  country: string;
  is_public: boolean;
  tags: string[];
  founded_year: number | null;
  employee_count: number | null;
}

// ─── Country helpers ──────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', CN: '🇨🇳', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧',
  JP: '🇯🇵', KR: '🇰🇷', CA: '🇨🇦', AU: '🇦🇺', IN: '🇮🇳',
  SE: '🇸🇪', IL: '🇮🇱', NL: '🇳🇱', CH: '🇨🇭', SG: '🇸🇬',
  BE: '🇧🇪', FI: '🇫🇮', DK: '🇩🇰', IT: '🇮🇹', ES: '🇪🇸',
  TW: '🇹🇼', RU: '🇷🇺', UA: '🇺🇦', NZ: '🇳🇿', UY: '🇺🇾',
};

function countryFlag(code: string): string {
  return COUNTRY_FLAGS[code] ?? '🌐';
}

function formatEmployees(n: number | null): string {
  if (!n) return '—';
  if (n >= 10000) return `${Math.round(n / 1000)}k+`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const COUNTRY_OPTIONS = [
  { code: 'US', label: 'USA' },
  { code: 'CN', label: 'China' },
  { code: 'DE', label: 'Germany' },
  { code: 'JP', label: 'Japan' },
  { code: 'GB', label: 'UK' },
  { code: 'FR', label: 'France' },
  { code: 'KR', label: 'Korea' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-24 bg-gray-800 rounded-full" />
        <div className="h-4 w-12 bg-gray-800 rounded" />
      </div>
      <div className="h-5 bg-gray-800 rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
      <div className="space-y-1">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: Company }) {
  const group = INDUSTRY_HIERARCHY.find(h => h.level1.id === company.industry_slug);
  const industryLabel = group?.level1.label ?? company.industry_slug;
  const industryColor = INDUSTRY_COLORS[company.industry_slug] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/20';

  return (
    <Link
      href={`/companies/${company.id}`}
      className="group block bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-4 flex flex-col transition"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 truncate ${industryColor}`}>
          <span className="truncate">{industryLabel}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-base">{countryFlag(company.country)}</span>
          {company.is_public ? (
            <span className="text-xs bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
              Listed
            </span>
          ) : (
            <span className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
              Private
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-white group-hover:text-blue-300 transition leading-snug mb-0.5">
        {company.name}
      </h3>
      {company.name_cn && (
        <p className="text-xs text-gray-500 mb-2">{company.name_cn}</p>
      )}

      {/* Sub-sector */}
      {company.sub_sector && (
        <p className="text-xs text-blue-400/70 mb-2">{company.sub_sector}</p>
      )}

      {/* Description */}
      {company.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-3">
          {company.description}
        </p>
      )}

      {/* Tags */}
      {company.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {company.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {company.tags.length > 3 && (
            <span className="text-xs text-gray-700">+{company.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-800/60 text-xs text-gray-600">
        {company.founded_year && (
          <span>Est. {company.founded_year}</span>
        )}
        {company.employee_count && (
          <span>{formatEmployees(company.employee_count)} employees</span>
        )}
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [industry, setIndustry]         = useState('');
  const [industryLevel2, setIndustryLevel2] = useState('');
  const [country, setCountry]           = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [search, setSearch]             = useState('');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '24',
        ...(industry      && { industry }),
        ...(industryLevel2 && { level2: industryLevel2 }),
        ...(country       && { country }),
        ...(publicFilter  && { public: publicFilter }),
        ...(search        && { search }),
      });
      const res  = await fetch(`/api/companies?${params}`);
      const json = await res.json();
      setCompanies(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [page, industry, industryLevel2, country, publicFilter, search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [industry, industryLevel2, country, publicFilter, search]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/companies" />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Database</h1>
          <p className="text-gray-400 mt-1">
            Frontier tech companies tracked across six industries.
            {total > 0 && (
              <span className="ml-2 text-gray-500">
                {total.toLocaleString()} {total !== 1 ? 'companies' : 'company'}
              </span>
            )}
          </p>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="mb-8 space-y-2">
          {/* Row 1: L1 industry tabs (left) + Search (right) */}
          <div className="flex items-center gap-2">
            {/* L1 tabs — scrollable */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 min-h-[38px]">
              <button
                onClick={() => { setIndustry(''); setIndustryLevel2(''); }}
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
                    onClick={() => { setIndustry(isActive ? '' : group.level1.id); setIndustryLevel2(''); }}
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

            {/* Search — fixed width right */}
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
                placeholder="Search companies..."
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
          </div>

          {/* Row 2: L2 sub-sectors — only when L1 selected */}
          {industry && (INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2 ?? []).length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-h-[32px]">
              {(INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2 ?? []).map(lv2 => {
                const isActive = industryLevel2 === lv2.name;
                return (
                  <button
                    key={lv2.slug}
                    onClick={() => setIndustryLevel2(isActive ? '' : lv2.name)}
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

          {/* Row 3: Region + Listed/Private filters */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => setCountry('')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  country === ''
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                All Regions
              </button>
              {COUNTRY_OPTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setCountry(country === code ? '' : code)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                    country === code
                      ? 'bg-gray-700 text-white border border-gray-600'
                      : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                  }`}
                >
                  <span>{countryFlag(code)}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Listed/Private — right-aligned, never wrap */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPublicFilter('')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  publicFilter === ''
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPublicFilter(publicFilter === 'true' ? '' : 'true')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  publicFilter === 'true'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                📈 Listed
              </button>
              <button
                onClick={() => setPublicFilter(publicFilter === 'false' ? '' : 'false')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  publicFilter === 'false'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent border border-gray-700/40 hover:border-gray-600'
                }`}
              >
                🔒 Private
              </button>
            </div>
          </div>
        </div>

        {/* ── Company Grid ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
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
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
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
          <div className="w-full text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🏢</div>
            {(industry || country || publicFilter || search) ? (
              <>
                <p className="text-lg font-medium text-gray-400 mb-2">No companies match these filters</p>
                <p className="text-sm mb-6">Try removing a filter to see more results.</p>
                <button
                  onClick={() => { setIndustry(''); setIndustryLevel2(''); setCountry(''); setPublicFilter(''); setSearch(''); }}
                  className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <p className="text-gray-500">Company database loading…</p>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
