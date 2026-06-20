'use client';

import { useState, useMemo } from 'react';
import type { IndustrySlug } from '@/lib/db';

interface MappedCompany {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: IndustrySlug;
  sub_sector: string | null;
  country: string;
  hq_city: string | null;
  hq_province: string | null;
  funding_stage: string | null;
  amora_total_score: number | null;
  source: 'platform' | 'user';
  description?: string | null;
}

interface Props {
  companies: MappedCompany[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
}

const SUB_SECTOR_MAP: Record<string, string[]> = {
  ai: ['LLM/Foundation Models', 'Autonomous Driving', 'AI Chip', 'Computer Vision', 'NLP', 'Robotics', 'AI Infrastructure', 'AI Applications'],
  'life-sciences': ['Biotech', 'Pharma', 'MedTech', 'Digital Health', 'Genomics', 'CDMO'],
  'green-tech': ['EV', 'Battery', 'Solar', 'Energy Storage', 'Hydrogen', 'Carbon Capture', 'Smart Grid'],
  manufacturing: ['Industrial Robots', '3D Printing', 'Smart Factory', 'Semiconductor Equipment', 'CNC/Precision', 'Industrial Software'],
  'new-space': ['Launch Vehicles', 'Satellites', 'Ground Systems', 'Space Applications', 'Space Tourism'],
  'advanced-materials': ['Semiconductor Materials', 'Carbon Fiber', 'Nanomaterials', 'Biomaterials', 'Rare Earth', 'Advanced Alloys'],
};

export default function IndustryMappingClient({ companies, industryMeta, allIndustrySlugs }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug>('ai');
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCompanies = useMemo(() => {
    let result = companies.filter((c) => c.industry_slug === selectedIndustry);
    if (selectedSub) {
      result = result.filter((c) => c.sub_sector === selectedSub);
    }
    return result;
  }, [companies, selectedIndustry, selectedSub]);

  const subSectors = SUB_SECTOR_MAP[selectedIndustry] || [];

  // Count companies per sub-sector
  const subCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const industryCompanies = companies.filter((c) => c.industry_slug === selectedIndustry);
    for (const c of industryCompanies) {
      const key = c.sub_sector || 'Uncategorized';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [companies, selectedIndustry]);

  const totalInIndustry = companies.filter((c) => c.industry_slug === selectedIndustry).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Industry Mapping</h1>
        <p className="text-gray-400 text-sm mt-1">Explore the competitive landscape across six frontier industries.</p>
      </div>

      {/* Industry Selector */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {allIndustrySlugs.map((slug) => {
          const meta = industryMeta[slug];
          const count = companies.filter((c) => c.industry_slug === slug).length;
          return (
            <button
              key={slug}
              onClick={() => { setSelectedIndustry(slug); setSelectedSub(null); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                selectedIndustry === slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <span>{meta.icon}</span>
              {meta.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedIndustry === slug ? 'bg-blue-500/30' : 'bg-gray-800'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Industry Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{totalInIndustry}</div>
          <div className="text-xs text-gray-500 mt-1">Companies Mapped</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">{subSectors.length}</div>
          <div className="text-xs text-gray-500 mt-1">Sub-sectors</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">
            {filteredCompanies.filter((c) => c.source === 'platform').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Platform Tracked</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {filteredCompanies.filter((c) => c.source === 'user').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Your Companies</div>
        </div>
      </div>

      {/* Sub-sector Filter */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-400">Sub-sector:</span>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedSub(null)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              !selectedSub ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All ({totalInIndustry})
          </button>
          {subSectors.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub === selectedSub ? null : sub)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                selectedSub === sub ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {sub} ({subCounts[sub] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{filteredCompanies.length} companies found</p>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-xs ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Companies Display */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No companies in this segment</p>
          <p className="text-sm">Try a different sub-sector or add companies from My Companies.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div key={`${company.source}-${company.id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white text-sm">{company.name}</h3>
                  {company.name_cn && <p className="text-xs text-gray-500">{company.name_cn}</p>}
                </div>
                {company.source === 'user' && (
                  <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded">Yours</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500">
                {company.country && <span>{company.country}</span>}
                {company.hq_city && <span>· {company.hq_city}</span>}
                {company.funding_stage && <span>· {company.funding_stage}</span>}
                {company.amora_total_score && (
                  <span className="text-blue-400">· AMORA {company.amora_total_score}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-500 text-xs">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Sub-sector</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">AMORA Score</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCompanies.map((company) => (
                <tr key={`${company.source}-${company.id}`} className="hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{company.name}</span>
                    {company.name_cn && <span className="text-gray-500 ml-1.5 text-xs">{company.name_cn}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{company.sub_sector || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {company.hq_city ? `${company.hq_city}, ${company.country}` : company.country}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{company.funding_stage || '—'}</td>
                  <td className="px-4 py-3">
                    {company.amora_total_score ? (
                      <span className="text-blue-400 font-medium">{company.amora_total_score}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      company.source === 'platform' ? 'bg-gray-800 text-gray-400' : 'bg-blue-900/50 text-blue-300'
                    }`}>
                      {company.source === 'platform' ? 'Platform' : 'Yours'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
