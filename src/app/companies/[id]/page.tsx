import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCompanyById, getCompanies, INDUSTRY_META, type Company } from '@/lib/db';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', CN: '🇨🇳', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧',
  JP: '🇯🇵', KR: '🇰🇷', CA: '🇨🇦', AU: '🇦🇺', IN: '🇮🇳',
  SE: '🇸🇪', IL: '🇮🇱', NL: '🇳🇱', CH: '🇨🇭', SG: '🇸🇬',
  BE: '🇧🇪', FI: '🇫🇮', DK: '🇩🇰', IT: '🇮🇹', ES: '🇪🇸',
  TW: '🇹🇼', RU: '🇷🇺', UA: '🇺🇦', NZ: '🇳🇿', UY: '🇺🇾',
  NO: '🇳🇴',
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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  
  let company: Company | null = null;
  try {
    company = await getCompanyById(companyId);
  } catch {
    // DB not ready
  }
  
  if (!company) {
    return { title: 'Company Not Found' };
  }
  
  return {
    title: `${company.name} | AMORA Insights`,
    description: company.description ?? `${company.name} - ${company.industry_slug} company tracked by AMORA Insights`,
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  
  if (isNaN(companyId)) {
    notFound();
  }
  
  let company: Company | null = null;
  let relatedCompanies: Company[] = [];
  
  try {
    company = await getCompanyById(companyId);
    if (company) {
      // Get related companies in same industry
      const result = await getCompanies({
        industrySlug: company.industry_slug,
        pageSize: 6,
      });
      relatedCompanies = result.data.filter((c) => c.id !== companyId).slice(0, 5);
    }
  } catch {
    // DB not ready — graceful degradation
  }
  
  if (!company) {
    notFound();
  }
  
  const industry = INDUSTRY_META[company.industry_slug] ?? {
    name: company.industry_slug,
    icon: '🏢',
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/companies" />
      
      <main className="max-w-7xl mx-auto px-5 py-10 flex-1">
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/companies" className="hover:text-blue-400 transition">
                Companies
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link 
                href={`/companies?industry=${company.industry_slug}`} 
                className="hover:text-blue-400 transition flex items-center gap-1"
              >
                <span>{industry.icon}</span>
                <span>{industry.name}</span>
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-300 truncate">{company.name}</li>
          </ol>
        </nav>
        
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>{company.name}</span>
                <span className="text-2xl">{countryFlag(company.country)}</span>
              </h1>
              {company.name_cn && (
                <p className="text-lg text-gray-400 mt-1">{company.name_cn}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {company.is_public ? (
                <span className="bg-emerald-900/40 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                  📈 Listed
                </span>
              ) : (
                <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-sm">
                  🔒 Private
                </span>
              )}
              {company.ticker && (
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-mono">
                  {company.ticker}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
            {company.sub_sector && (
              <span className="text-blue-400/70">{company.sub_sector}</span>
            )}
            {company.hq_city && (
              <span>{company.hq_city}{company.hq_province && `, ${company.hq_province}`}</span>
            )}
            {company.founded_year && (
              <span>Est. {company.founded_year}</span>
            )}
            {company.employee_count && (
              <span>👤 {formatEmployees(company.employee_count)} employees</span>
            )}
            {company.exchange && (
              <span>📍 {company.exchange}</span>
            )}
          </div>
        </div>
        
        {/* ── Description ──────────────────────────────────────────────────── */}
        {company.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-300">About</h2>
            <p className="text-gray-300 leading-relaxed">{company.description}</p>
          </div>
        )}
        
        {company.description_cn && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-300">公司简介</h2>
            <p className="text-gray-300 leading-relaxed">{company.description_cn}</p>
          </div>
        )}
        
        {/* ── Tags ───────────────────────────────────────────────────────────── */}
        {company.tags && company.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wider">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* ── Quick Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Industry</div>
            <div className="font-medium flex items-center gap-2">
              <span>{industry.icon}</span>
              <span>{industry.name}</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Headquarters</div>
            <div className="font-medium">
              {company.hq_city || '—'}
              {company.hq_city && company.country && `, ${countryFlag(company.country)}`}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Founded</div>
            <div className="font-medium">{company.founded_year || '—'}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Employees</div>
            <div className="font-medium">{formatEmployees(company.employee_count)}</div>
          </div>
        </div>
        
        {/* ── External Links ────────────────────────────────────────────────── */}
        {company.website && (
          <div className="mb-10">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <span>🌐</span>
              <span>Visit Website</span>
              <span className="text-xs opacity-70">↗</span>
            </a>
          </div>
        )}
        
        {/* ── Related Companies ──────────────────────────────────────────────── */}
        {relatedCompanies.length > 0 && (
          <div className="border-t border-gray-800 pt-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>🏢</span>
              <span>More in {industry.name}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCompanies.map((related) => (
                <RelatedCompanyCard key={related.id} company={related} />
              ))}
            </div>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}

// ─── Related Company Card ─────────────────────────────────────────────────

function RelatedCompanyCard({ company }: { company: Company }) {
  const industry = INDUSTRY_META[company.industry_slug] ?? {
    name: company.industry_slug,
    icon: '🏢',
  };
  
  return (
    <Link
      href={`/companies/${company.id}`}
      className="block bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-4 transition group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded-full">
          {industry.icon} {industry.name}
        </span>
        <span className="text-base">{countryFlag(company.country)}</span>
      </div>
      
      <h3 className="font-semibold text-white group-hover:text-blue-300 transition mb-1">
        {company.name}
      </h3>
      {company.name_cn && (
        <p className="text-xs text-gray-500 mb-2">{company.name_cn}</p>
      )}
      
      {company.sub_sector && (
        <p className="text-xs text-blue-400/70">{company.sub_sector}</p>
      )}
      
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
        {company.hq_city && <span>{company.hq_city}</span>}
        {company.founded_year && <span className="text-gray-700">est. {company.founded_year}</span>}
      </div>
    </Link>
  );
}
