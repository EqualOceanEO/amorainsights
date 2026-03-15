'use client';

import { useEffect, useState, useCallback } from 'react';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';

type Company = {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: IndustrySlug;
  sub_sector: string | null;
  country: string;
  hq_city: string | null;
  is_public: boolean;
  is_tracked: boolean;
  ticker: string | null;
  employee_count: number | null;
  tags: string[];
  created_at: string;
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: '20', q: search, industry_slug: industry });
    const res = await fetch(`/api/admin/companies?${params}`);
    if (!res.ok) { setLoading(false); return; }
    const json = await res.json();
    setCompanies(json.data ?? []);
    setTotal(json.total ?? 0);
    setTotalPages(json.totalPages ?? 1);
    setLoading(false);
  }, [page, search, industry]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, industry]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Companies</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} tracked companies</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Industries</option>
          {ALL_INDUSTRY_SLUGS.map((s) => (
            <option key={s} value={s}>{INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Industry</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Ticker</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Employees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No companies found</td></tr>
              ) : (
                companies.map((c) => {
                  const meta = INDUSTRY_META[c.industry_slug];
                  return (
                    <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{c.name}</div>
                        {c.name_cn && <div className="text-xs text-gray-500 mt-0.5">{c.name_cn}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          {meta.icon} {meta.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {[c.hq_city, c.country].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.is_public
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-gray-700/50 text-gray-500'
                        }`}>
                          {c.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{c.ticker ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">
                        {c.employee_count ? c.employee_count.toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages} ({total.toLocaleString()} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
