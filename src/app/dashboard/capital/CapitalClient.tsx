'use client';

import { useState, useMemo } from 'react';
import type { Company, IndustrySlug } from '@/lib/db';

interface Props {
  companies: Company[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
}

export default function CapitalClient({ companies, industryMeta, allIndustrySlugs }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | 'all'>('all');
  const [sortBy, setSortBy] = useState<'funding' | 'valuation'>('funding');

  const filtered = useMemo(() => {
    let result = companies.filter((c) => c.funding_total_usd || c.valuation_usd);
    if (selectedIndustry !== 'all') result = result.filter((c) => c.industry_slug === selectedIndustry);
    result.sort((a, b) => {
      const aVal = sortBy === 'funding' ? (a.funding_total_usd || 0) : (a.valuation_usd || 0);
      const bVal = sortBy === 'funding' ? (b.funding_total_usd || 0) : (b.valuation_usd || 0);
      return bVal - aVal;
    });
    return result;
  }, [companies, selectedIndustry, sortBy]);

  // Top investors
  const topInvestors = useMemo(() => {
    const investorMap: Record<string, { count: number; totalFunding: number }> = {};
    for (const c of filtered) {
      const investors = c.lead_investors?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      for (const inv of investors) {
        if (!investorMap[inv]) investorMap[inv] = { count: 0, totalFunding: 0 };
        investorMap[inv].count++;
        investorMap[inv].totalFunding += c.funding_total_usd || 0;
      }
    }
    return Object.entries(investorMap)
      .sort((a, b) => b[1].totalFunding - a[1].totalFunding)
      .slice(0, 15);
  }, [filtered]);

  const totalFunding = filtered.reduce((sum, c) => sum + (c.funding_total_usd || 0), 0);
  const totalValuation = filtered.reduce((sum, c) => sum + (c.valuation_usd || 0), 0);

  // Funding by industry
  const fundingByIndustry = useMemo(() => {
    const map: Record<string, number> = {};
    for (const slug of allIndustrySlugs) {
      map[slug] = companies
        .filter((c) => c.industry_slug === slug)
        .reduce((sum, c) => sum + (c.funding_total_usd || 0), 0);
    }
    return map;
  }, [companies, allIndustrySlugs]);

  const maxFunding = Math.max(...Object.values(fundingByIndustry), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Capital Flows</h1>
        <p className="text-gray-400 text-sm mt-1">Track investment trends, top investors, and capital allocation.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">
            ${(totalFunding / 1e9).toFixed(1)}B
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Funding</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            ${(totalValuation / 1e9).toFixed(1)}B
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Valuation</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">{filtered.length}</div>
          <div className="text-xs text-gray-500 mt-1">Funded Companies</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            ${filtered.length > 0 ? ((totalFunding / filtered.length) / 1e6).toFixed(1) : 0}M
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg per Company</div>
        </div>
      </div>

      {/* Funding by Industry */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Funding by Industry</h2>
        <div className="space-y-3">
          {allIndustrySlugs.map((slug) => {
            const amount = fundingByIndustry[slug] || 0;
            return (
              <div key={slug} className="flex items-center gap-3">
                <span className="text-sm w-8">{industryMeta[slug].icon}</span>
                <span className="text-sm text-gray-300 w-36">{industryMeta[slug].name}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${(amount / maxFunding) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-medium">
                      ${(amount / 1e9).toFixed(1)}B
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Investors */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Investors</h3>
          <div className="space-y-2">
            {topInvestors.map(([name, data], idx) => (
              <div key={name} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-5">{idx + 1}</span>
                  <span className="text-sm text-white">{name}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>{data.count} deals</span>
                  <span>${(data.totalFunding / 1e9).toFixed(1)}B</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Funded Companies */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Funded Companies</h3>
          <div className="space-y-2">
            {filtered.slice(0, 15).map((c, idx) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-5">{idx + 1}</span>
                  <div>
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{industryMeta[c.industry_slug]?.icon}</span>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{c.funding_stage || '—'}</span>
                  <span className="text-blue-400">
                    {c.funding_total_usd ? `$${(c.funding_total_usd / 1e6).toFixed(0)}M` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
