'use client';

import { useState, useMemo } from 'react';
import type { Company, IndustrySlug } from '@/lib/db';

interface Props {
  companies: Company[];
  stats: { reportsCount: number; companiesCount: number; newsTodayCount: number };
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
}

export default function MarketClient({ companies, stats, industryMeta, allIndustrySlugs }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = companies;
    if (selectedIndustry !== 'all') result = result.filter((c) => c.industry_slug === selectedIndustry);
    if (search) result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [companies, selectedIndustry, search]);

  // Aggregate stats
  const industryStats = useMemo(() => {
    const map: Record<string, { count: number; totalFunding: number; avgScore: number; publicCount: number }> = {};
    for (const slug of allIndustrySlugs) {
      const ind = companies.filter((c) => c.industry_slug === slug);
      const scores = ind.filter((c) => c.amora_total_score).map((c) => c.amora_total_score!);
      map[slug] = {
        count: ind.length,
        totalFunding: ind.reduce((sum, c) => sum + (c.funding_total_usd || 0), 0),
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        publicCount: ind.filter((c) => c.is_public).length,
      };
    }
    return map;
  }, [companies, allIndustrySlugs]);

  // Funding stage distribution
  const stageDistribution = useMemo(() => {
    const stages: Record<string, number> = {};
    for (const c of filtered) {
      const stage = c.funding_stage || 'Unknown';
      stages[stage] = (stages[stage] || 0) + 1;
    }
    return Object.entries(stages).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const totalFunding = filtered.reduce((sum, c) => sum + (c.funding_total_usd || 0), 0);
  const totalValuation = filtered.reduce((sum, c) => sum + (c.valuation_usd || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Market Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">Funding trends, market structure, and competitive dynamics.</p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.companiesCount.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Tracked Companies</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            ${(totalFunding / 1e9).toFixed(1)}B
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Funding</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">
            ${(totalValuation / 1e9).toFixed(1)}B
          </div>
          <div className="text-xs text-gray-500 mt-1">Combined Valuation</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {companies.filter((c) => c.is_public).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Public Companies</div>
        </div>
      </div>

      {/* Industry Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Industry Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allIndustrySlugs.map((slug) => {
            const s = industryStats[slug];
            return (
              <div key={slug} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{industryMeta[slug].icon}</span>
                  <span className="font-medium text-white text-sm">{industryMeta[slug].name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Companies</div>
                    <div className="text-white font-medium">{s.count}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Avg AMORA</div>
                    <div className="text-blue-400 font-medium">{s.avgScore || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Funding</div>
                    <div className="text-white font-medium">${(s.totalFunding / 1e6).toFixed(0)}M</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Public</div>
                    <div className="text-white font-medium">{s.publicCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as IndustrySlug | 'all')}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Industries</option>
          {allIndustrySlugs.map((slug) => (
            <option key={slug} value={slug}>{industryMeta[slug].icon} {industryMeta[slug].name}</option>
          ))}
        </select>
        <input
          type="text" placeholder="Search companies..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
        />
      </div>

      {/* Funding Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Funding Stage Distribution</h3>
          <div className="space-y-2">
            {stageDistribution.slice(0, 8).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20">{stage}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(count / filtered.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-500 text-xs">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3 text-right">Funding</th>
                <th className="px-4 py-3 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.slice(0, 10).map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-2.5">
                    <span className="text-white text-xs">{c.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{c.funding_stage || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-right text-gray-300">
                    {c.funding_total_usd ? `$${(c.funding_total_usd / 1e6).toFixed(1)}M` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-right text-gray-300">
                    {c.valuation_usd ? `$${(c.valuation_usd / 1e6).toFixed(1)}M` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
