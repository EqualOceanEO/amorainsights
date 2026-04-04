import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCompanyById, getCompanies, INDUSTRY_META, type Company } from '@/lib/db';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ShareBar from '@/components/ShareBar';

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
  
  // Helper: Section heading with left accent (from news page)
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 bg-blue-500 rounded-full" />
      <h2 className="text-base font-bold text-white uppercase tracking-wide">{children}</h2>
    </div>
  );
  
  // Helper: Format currency
  const formatCurrency = (amount: number | null, currency: 'USD' | 'CNY') => {
    if (!amount) return '—';
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}亿 ${currency}`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}万 ${currency}`;
    return `${amount.toLocaleString()} ${currency}`;
  };
  
  // Helper: Format valuation date
  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/companies" />
      
      {/* Top gradient bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-5 py-10">
        
        {/* Floating Share Bar — left sidebar on desktop */}
        <div className="hidden xl:block">
          <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
            <ShareBar
              title={company.name}
              summary={company.description ?? ''}
              url={`https://amorainsights.com/companies/${company.id}`}
              variant="floating"
            />
          </div>
        </div>

        {/* Back */}
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-8 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Companies
        </Link>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-10">
          
          {/* ── Main column ── */}
          <article className="min-w-0">
            
            {/* Header */}
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
            
            {/* Description */}
            {company.description && (
              <div className="mb-8">
                <SectionHeading>About</SectionHeading>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed text-base">{company.description}</p>
                </div>
              </div>
            )}
            
            {company.description_cn && (
              <div className="mb-8">
                <SectionHeading>公司简介</SectionHeading>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed text-base">{company.description_cn}</p>
                </div>
              </div>
            )}
            
            {/* Funding & Valuation */}
            {(company.funding_stage || company.funding_total_usd || company.funding_total_cny || company.valuation_usd) && (
              <div className="mb-8">
                <SectionHeading>Funding & Valuation</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {company.funding_stage && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stage</div>
                      <div className="font-medium text-blue-400 capitalize">{company.funding_stage}</div>
                    </div>
                  )}
                  {(company.funding_total_usd || company.funding_total_cny) && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Funding</div>
                      <div className="font-medium">
                        {formatCurrency(company.funding_total_usd, 'USD') !== '—' 
                          ? formatCurrency(company.funding_total_usd, 'USD')
                          : formatCurrency(company.funding_total_cny, 'CNY')}
                      </div>
                    </div>
                  )}
                  {company.valuation_usd && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Valuation</div>
                      <div className="font-medium">{formatCurrency(company.valuation_usd, 'USD')}</div>
                    </div>
                  )}
                  {company.valuation_date && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Valuation Date</div>
                      <div className="font-medium">{formatDate(company.valuation_date)}</div>
                    </div>
                  )}
                </div>
                
                {/* Investors */}
                {(company.lead_investors || company.all_investors) && (
                  <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Investors</div>
                    {company.lead_investors && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-400 mr-2">Lead:</span>
                        <span className="text-sm text-white">{company.lead_investors}</span>
                      </div>
                    )}
                    {company.all_investors && (
                      <div>
                        <span className="text-sm text-gray-400 mr-2">All:</span>
                        <span className="text-sm text-white">{company.all_investors}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Team & Leadership */}
            {(company.ceo_name || company.founders || company.team_background) && (
              <div className="mb-8">
                <SectionHeading>Team & Leadership</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.ceo_name && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">CEO</div>
                      <div className="font-medium">{company.ceo_name}</div>
                    </div>
                  )}
                  {company.founders && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Founders</div>
                      <div className="font-medium">{company.founders}</div>
                    </div>
                  )}
                  {company.team_background && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Team Background</div>
                      <div className="font-medium">{company.team_background}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Products & Technology */}
            {(company.core_products || company.tech_route || company.patent_count) && (
              <div className="mb-8">
                <SectionHeading>Products & Technology</SectionHeading>
                <div className="space-y-4">
                  {company.core_products && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Core Products</div>
                      <p className="text-white">{company.core_products}</p>
                    </div>
                  )}
                  {company.tech_route && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Technology Route</div>
                      <p className="text-white">{company.tech_route}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {company.product_status && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Product Status</div>
                        <div className="font-medium">{company.product_status}</div>
                      </div>
                    )}
                    {company.unit_shipment && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unit Shipment</div>
                        <div className="font-medium">{company.unit_shipment.toLocaleString()}</div>
                      </div>
                    )}
                    {company.patent_count !== null && company.patent_count !== undefined && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Patent Count</div>
                        <div className="font-medium">{company.patent_count.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Supply Chain & Ecosystem */}
            {(company.supply_chain_tier || company.ecosystem_position || company.key_components || company.key_partners) && (
              <div className="mb-8">
                <SectionHeading>Supply Chain & Ecosystem</SectionHeading>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {company.supply_chain_tier && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Supply Chain Tier</div>
                        <div className="font-medium">{company.supply_chain_tier}</div>
                      </div>
                    )}
                    {company.ecosystem_position && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ecosystem Position</div>
                        <div className="font-medium">{company.ecosystem_position}</div>
                      </div>
                    )}
                  </div>
                  {company.key_components && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Components</div>
                      <p className="text-white">{company.key_components}</p>
                    </div>
                  )}
                  {company.key_partners && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Partners</div>
                      <p className="text-white">{company.key_partners}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Use Cases & Customers */}
            {(company.primary_use_cases || company.customer_breakdown) && (
              <div className="mb-8">
                <SectionHeading>Use Cases & Customers</SectionHeading>
                <div className="space-y-4">
                  {company.primary_use_cases && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Primary Use Cases</div>
                      <p className="text-white">{company.primary_use_cases}</p>
                    </div>
                  )}
                  {company.customer_breakdown && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Breakdown</div>
                      <p className="text-white">{company.customer_breakdown}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* AMORA Scores */}
            {(company.amora_advancement_score || company.amora_mastery_score || company.amora_operations_score || 
              company.amora_reach_score || company.amora_affinity_score || company.amora_total_score) && (
              <div className="mb-8">
                <SectionHeading>AMORA Scores</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.amora_advancement_score !== null && company.amora_advancement_score !== undefined && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                      <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Advancement</div>
                      <div className="font-bold text-blue-300 text-xl">{company.amora_advancement_score}/10</div>
                    </div>
                  )}
                  {company.amora_mastery_score !== null && company.amora_mastery_score !== undefined && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Mastery</div>
                      <div className="font-bold text-purple-300 text-xl">{company.amora_mastery_score}/10</div>
                    </div>
                  )}
                  {company.amora_operations_score !== null && company.amora_operations_score !== undefined && (
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Operations</div>
                      <div className="font-bold text-emerald-300 text-xl">{company.amora_operations_score}/10</div>
                    </div>
                  )}
                  {company.amora_reach_score !== null && company.amora_reach_score !== undefined && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                      <div className="text-xs text-orange-400 uppercase tracking-wider mb-1">Reach</div>
                      <div className="font-bold text-orange-300 text-xl">{company.amora_reach_score}/10</div>
                    </div>
                  )}
                  {company.amora_affinity_score !== null && company.amora_affinity_score !== undefined && (
                    <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20 rounded-xl p-4">
                      <div className="text-xs text-teal-400 uppercase tracking-wider mb-1">Affinity</div>
                      <div className="font-bold text-teal-300 text-xl">{company.amora_affinity_score}/10</div>
                    </div>
                  )}
                  {company.amora_total_score !== null && company.amora_total_score !== undefined && (
                    <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 rounded-xl p-4">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Score</div>
                      <div className="font-bold text-gray-300 text-xl">{company.amora_total_score}/10</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* External Links */}
            {company.website && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-sm text-white font-medium transition-all"
                >
                  <span>🌐</span>
                  <span>Visit Website</span>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </article>

          {/* ── Share Bar ── */}
          <div className="mt-8 mb-2">
            <ShareBar
              title={company.name}
              summary={company.description ?? ''}
              url={`https://amorainsights.com/companies/${company.id}`}
              variant="horizontal"
            />
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            
            {/* Company info card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Company Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Headquarters</div>
                    <div className="text-gray-300">
                      {company.hq_city || '—'}
                      {company.hq_city && company.country && `, ${countryFlag(company.country)}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Founded</div>
                    <div className="text-gray-300">{company.founded_year || '—'}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Employees</div>
                    <div className="text-gray-300">{formatEmployees(company.employee_count)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                  </svg>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Industry</div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {industry.icon} {industry.name}
                      </span>
                      {company.sub_sector && (
                        <span className="text-xs text-gray-400 px-1">{company.sub_sector}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Stats</h3>
              <div className="space-y-3">
                {company.funding_stage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stage</span>
                    <span className="text-blue-400 capitalize">{company.funding_stage}</span>
                  </div>
                )}
                {(company.funding_total_usd || company.funding_total_cny) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Funding</span>
                    <span className="text-gray-300">
                      {formatCurrency(company.funding_total_usd, 'USD') !== '—' 
                        ? formatCurrency(company.funding_total_usd, 'USD')
                        : formatCurrency(company.funding_total_cny, 'CNY')}
                    </span>
                  </div>
                )}
                {company.patent_count !== null && company.patent_count !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Patents</span>
                    <span className="text-gray-300">{company.patent_count.toLocaleString()}</span>
                  </div>
                )}
                {company.amora_total_score !== null && company.amora_total_score !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">AMORA Score</span>
                    <span className="text-gray-300 font-medium">{company.amora_total_score}/10</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status</h3>
              <div className="flex flex-col gap-2">
                {company.is_public ? (
                  <span className="text-sm text-emerald-400 flex items-center gap-1">
                    <span>📈</span> Listed
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <span>🔒</span> Private
                  </span>
                )}
                {company.ticker && (
                  <span className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded">
                    {company.ticker}
                  </span>
                )}
              </div>
            </div>
            
            {/* Visit website */}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition font-medium"
              >
                🌐 Visit Website
              </a>
            )}
            
          </aside>
        </div>
        
        {/* ── Related Companies ──────────────────────────────────────────────── */}
        {relatedCompanies.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-800">
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
      </div>
      
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
