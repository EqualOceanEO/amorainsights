import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { INDUSTRY_HIERARCHY, INDUSTRY_COLORS } from '@/lib/industries';
import {
  getCompanies,
  ALL_INDUSTRY_SLUGS,
  type IndustrySlug,
  type Company,
} from '@/lib/db';

// ─── Country display helpers ──────────────────────────────────────────────────

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
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Search params ────────────────────────────────────────────────────────────

interface SearchParams {
  industry?: string;
  country?: string;
  public?: string;
  page?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const industryFilter = ALL_INDUSTRY_SLUGS.includes(params.industry as IndustrySlug)
    ? (params.industry as IndustrySlug)
    : undefined;
  const countryFilter = params.country || undefined;
  const publicFilter =
    params.public === 'true' ? true : params.public === 'false' ? false : undefined;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  let companies: Company[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    const result = await getCompanies({
      page,
      pageSize: 24,
      industrySlug: industryFilter,
      country: countryFilter,
      isPublic: publicFilter,
    });
    companies = result.data;
    totalPages = result.totalPages;
    total = result.total;
  } catch {
    // DB not ready — graceful degradation
  }

  // Build filter URL
  function filterUrl(overrides: Partial<SearchParams & { page: string }>) {
    const merged: Record<string, string> = {};
    if (industryFilter) merged.industry = industryFilter;
    if (countryFilter) merged.country = countryFilter;
    if (publicFilter !== undefined) merged.public = String(publicFilter);
    merged.page = String(page);
    Object.assign(merged, overrides);
    // Remove undefined/empty
    Object.keys(merged).forEach((k) => {
      if (merged[k] === undefined || merged[k] === '') delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return `/companies${qs ? `?${qs}` : ''}`;
  }

  // Notable countries in our dataset
  const COUNTRY_OPTIONS = [
    { code: 'US', label: 'USA' },
    { code: 'CN', label: 'China' },
    { code: 'DE', label: 'Germany' },
    { code: 'JP', label: 'Japan' },
    { code: 'GB', label: 'UK' },
    { code: 'FR', label: 'France' },
    { code: 'KR', label: 'Korea' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/companies" />

      <main className="max-w-5xl mx-auto px-5 py-10 flex-1">
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
        <div className="space-y-3 mb-8">
          {/* Industry - Two rows */}
          <div className="flex flex-col gap-2">
            {/* Level 1 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              <Link
                href={filterUrl({ industry: undefined, page: '1' })}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  !industryFilter
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                }`}
              >
                All
              </Link>
              {INDUSTRY_HIERARCHY.map(group => (
                <Link
                  key={group.level1.id}
                  href={filterUrl({ industry: group.level1.id, page: '1' })}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    industryFilter === group.level1.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {group.level1.label}
                </Link>
              ))}
            </div>

            {/* Level 2 (shown when level 1 is selected) */}
            {industryFilter && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {INDUSTRY_HIERARCHY.find(h => h.level1.id === industryFilter)?.level2.map(level2 => (
                  <span
                    key={level2}
                    className="shrink-0 px-3 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-900 border border-gray-700"
                  >
                    {level2}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Country + Listed status */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={filterUrl({ country: undefined, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !countryFilter
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Regions
            </Link>
            {COUNTRY_OPTIONS.map(({ code, label }) => (
              <Link
                key={code}
                href={filterUrl({ country: code, page: '1' })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  countryFilter === code
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{countryFlag(code)}</span>
                <span>{label}</span>
              </Link>
            ))}

            {/* Divider */}
            <span className="w-px bg-gray-700 self-stretch mx-1" />

            <Link
              href={filterUrl({ public: undefined, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === undefined
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              All
            </Link>
            <Link
              href={filterUrl({ public: 'true', page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === true
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              📈 Listed
            </Link>
            <Link
              href={filterUrl({ public: 'false', page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                publicFilter === false
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'
              }`}
            >
              🔒 Private
            </Link>
          </div>
        </div>

        {/* ── Company Grid ───────────────────────────────────────────────── */}
        {companies.length > 0 ? (
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
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🏢</div>
            {(industryFilter || countryFilter || publicFilter !== undefined) ? (
              <>
                <p className="text-lg font-medium text-gray-400 mb-2">No companies match these filters</p>
                <p className="text-sm mb-6">Try removing a filter to see more results.</p>
                <Link
                  href="/companies"
                  className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition"
                >
                  Clear filters
                </Link>
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
            <span
              key={tag}
              className="text-xs bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {company.tags.length > 3 && (
            <span className="text-xs text-gray-700">+{company.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800/60 pt-3 mt-auto">
        <span className="flex items-center gap-1.5">
          {company.hq_city && <span>{company.hq_city}</span>}
          {company.founded_year && (
            <span className="text-gray-700">est. {company.founded_year}</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {company.ticker && (
            <span className="font-mono text-gray-500">{company.ticker}</span>
          )}
          {company.employee_count && (
            <span title={`${company.employee_count.toLocaleString()} employees`}>
              👤 {formatEmployees(company.employee_count)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
