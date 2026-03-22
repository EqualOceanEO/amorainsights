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
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Industry - Two rows */}
          <div className="flex flex-col gap-2">
            {/* Level 1 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => { setIndustry(''); setIndustryLevel2(''); }}
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

            {/* Level 2 (shown when level 1 is selected) */}
            {industry && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2.map(lv2 => (
                  <button
                    key={lv2}
                    onClick={() => setIndustryLevel2(industryLevel2 === lv2 ? '' : lv2)}
                    className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      industryLevel2 === lv2
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {lv2}
                  </button>
                ))}
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

          {/* Country + Listed status */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCountry('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                country === ''
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Regions
            </button>
            {COUNTRY_OPTIONS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setCountry(country === code ? '' : code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  country === code
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{countryFlag(code)}</span>
                <span>{label}</span>
              </button>
            ))}

            {/* Divider */}
            <span className="w-px bg-gray-700 self-stretch mx-1" />

            <button
              onClick={() => setPublicFilter('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === ''
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPublicFilter(publicFilter === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === 'true'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              📈 Listed
            </button>
            <button
              onClick={() => setPublicFilter(publicFilter === 'false' ? '' : 'false')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === 'false'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              🔒 Private
            </button>
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
          <div className="text-center py-24 text-gray-500">
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
