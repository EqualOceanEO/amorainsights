'use client';

import { useState, useMemo } from 'react';
import type { Report, IndustrySlug } from '@/lib/db';

interface Props {
  reports: Report[];
  reportsByIndustry: Record<string, number>;
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
}

export default function ResearchClient({ reports, reportsByIndustry, industryMeta, allIndustrySlugs }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | 'all'>('all');
  const [search, setSearch] = useState('');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'free' | 'premium'>('all');

  const filtered = useMemo(() => {
    let result = reports;
    if (selectedIndustry !== 'all') result = result.filter((r) => r.industry_slug === selectedIndustry);
    if (search) result = result.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
    if (premiumFilter === 'free') result = result.filter((r) => !r.is_premium);
    if (premiumFilter === 'premium') result = result.filter((r) => r.is_premium);
    return result;
  }, [reports, selectedIndustry, search, premiumFilter]);

  const totalReports = Object.values(reportsByIndustry).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Research Library</h1>
        <p className="text-gray-400 text-sm mt-1">Access in-depth reports and analysis across all industries.</p>
      </div>

      {/* Industry Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {allIndustrySlugs.map((slug) => {
          const count = reportsByIndustry[slug] || 0;
          const meta = industryMeta[slug];
          return (
            <button
              key={slug}
              onClick={() => setSelectedIndustry(selectedIndustry === slug ? 'all' : slug)}
              className={`rounded-xl p-4 text-left transition border ${
                selectedIndustry === slug
                  ? 'bg-blue-600/20 border-blue-600/30'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{meta.icon}</div>
              <div className="text-sm font-medium text-white">{meta.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{count} report{count !== 1 ? 's' : ''}</div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-blue-400">{totalReports}</div>
            <div className="text-xs text-gray-500">Total Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">
              {reports.filter((r) => r.is_premium).length}
            </div>
            <div className="text-xs text-gray-500">Premium Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {reports.filter((r) => r.report_format !== 'markdown').length}
            </div>
            <div className="text-xs text-gray-500">Interactive Reports</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" placeholder="Search reports..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
        />
        <select
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value as any)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Access</option>
          <option value="free">Free Only</option>
          <option value="premium">Premium Only</option>
        </select>
      </div>

      {/* Report List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No reports match your filters.</div>
        ) : (
          filtered.map((report) => (
            <div key={report.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{report.title}</h3>
                    {report.is_premium && (
                      <span className="text-[10px] bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded font-medium">PREMIUM</span>
                    )}
                    {report.report_format !== 'markdown' && (
                      <span className="text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">Interactive</span>
                    )}
                  </div>
                  {report.summary && (
                    <p className="text-sm text-gray-400 line-clamp-2">{report.summary}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {report.industry_slug && (
                      <span>{industryMeta[report.industry_slug]?.icon} {industryMeta[report.industry_slug]?.name}</span>
                    )}
                    {report.author && <span>By {report.author}</span>}
                    {report.view_count > 0 && <span>{report.view_count.toLocaleString()} views</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {report.published_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(report.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
