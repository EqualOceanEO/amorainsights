'use client';

import { useEffect, useState, useCallback } from 'react';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

type Company = {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: IndustrySlug;
  sub_sector: string | null;
  country: string;
  hq_city: string | null;
  hq_province: string | null;
  is_public: boolean;
  is_tracked: boolean;
  ticker: string | null;
  employee_count: number | null;
  tags: string[];
  website: string | null;
  description: string | null;
  founded_year: number | null;
  logo_url: string | null;
  created_at: string;
};

type CompanyForm = {
  name: string;
  name_cn: string;
  industry_slug: string;
  sub_sector: string;
  country: string;
  hq_city: string;
  hq_province: string;
  is_public: boolean;
  is_tracked: boolean;
  ticker: string;
  employee_count: string;
  tags: string;
  website: string;
  description: string;
  founded_year: string;
};

const BLANK_FORM: CompanyForm = {
  name: '', name_cn: '', industry_slug: 'ai', sub_sector: '', country: 'US',
  hq_city: '', hq_province: '', is_public: false, is_tracked: true,
  ticker: '', employee_count: '', tags: '', website: '', description: '', founded_year: '',
};

// ─── Company Drawer ───────────────────────────────────────────────────────────

function CompanyDrawer({
  company,
  onClose,
  onSaved,
}: {
  company: Company | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CompanyForm>(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!company) { setForm(BLANK_FORM); setFullLoaded(true); return; }
    fetch(`/api/admin/companies/${company.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          name:           d.name ?? '',
          name_cn:        d.name_cn ?? '',
          industry_slug:  d.industry_slug ?? 'ai',
          sub_sector:     d.sub_sector ?? '',
          country:        d.country ?? '',
          hq_city:        d.hq_city ?? '',
          hq_province:    d.hq_province ?? '',
          is_public:      d.is_public ?? false,
          is_tracked:     d.is_tracked ?? true,
          ticker:         d.ticker ?? '',
          employee_count: d.employee_count ? String(d.employee_count) : '',
          tags:           (d.tags ?? []).join(', '),
          website:        d.website ?? '',
          description:    d.description ?? '',
          founded_year:   d.founded_year ? String(d.founded_year) : '',
        });
        setFullLoaded(true);
      });
  }, [company]);

  function set<K extends keyof CompanyForm>(k: K, v: CompanyForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags:           form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        employee_count: form.employee_count ? parseInt(form.employee_count) : null,
        founded_year:   form.founded_year ? parseInt(form.founded_year) : null,
        ticker:         form.ticker || null,
        name_cn:        form.name_cn || null,
        sub_sector:     form.sub_sector || null,
        hq_city:        form.hq_city || null,
        hq_province:    form.hq_province || null,
        website:        form.website || null,
        description:    form.description || null,
      };
      const url    = company ? `/api/admin/companies/${company.id}` : '/api/admin/companies';
      const method = company ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Something went wrong');
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">
            {company ? 'Edit Company' : 'New Company'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {!fullLoaded ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Name (EN) *</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Company name" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Name (CN)</label>
                <input value={form.name_cn} onChange={(e) => set('name_cn', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Chinese name" />
              </div>
            </div>

            {/* Industry + Sub-sector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Industry *</label>
                <select value={form.industry_slug} onChange={(e) => set('industry_slug', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  {ALL_INDUSTRY_SLUGS.map((s) => (
                    <option key={s} value={s}>{INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Sub-sector</label>
                <input value={form.sub_sector} onChange={(e) => set('sub_sector', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Foundation Models" />
              </div>
            </div>

            {/* Country + City + Province */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Country *</label>
                <input required value={form.country} onChange={(e) => set('country', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="US, CN, DE…" maxLength={2} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">City</label>
                <input value={form.hq_city} onChange={(e) => set('hq_city', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="San Francisco" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Province / State</label>
                <input value={form.hq_province} onChange={(e) => set('hq_province', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="California" />
              </div>
            </div>

            {/* Ticker + Founded + Employees */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Ticker</label>
                <input value={form.ticker} onChange={(e) => set('ticker', e.target.value.toUpperCase())}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="AAPL" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Founded Year</label>
                <input type="number" value={form.founded_year} onChange={(e) => set('founded_year', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="2015" min={1800} max={2030} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Employees</label>
                <input type="number" value={form.employee_count} onChange={(e) => set('employee_count', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="5000" />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Website</label>
              <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="https://company.com" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Brief company description" />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                Tags <span className="font-normal text-gray-600">(comma-separated)</span>
              </label>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="ai, llm, cloud" />
            </div>

            {/* Toggles */}
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-3 py-3 px-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <button type="button" onClick={() => set('is_public', !form.is_public)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_public ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_public ? 'translate-x-5' : ''}`} />
                </button>
                <div>
                  <p className="text-sm text-white font-medium">Publicly Listed</p>
                  <p className="text-xs text-gray-500">Has stock ticker</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 py-3 px-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <button type="button" onClick={() => set('is_tracked', !form.is_tracked)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_tracked ? 'bg-green-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_tracked ? 'translate-x-5' : ''}`} />
                </button>
                <div>
                  <p className="text-sm text-white font-medium">Tracked</p>
                  <p className="text-xs text-gray-500">Visible on site</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2 pb-4">
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition">
                {loading ? 'Saving…' : company ? 'Save Changes' : 'Add Company'}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  company,
  onCancel,
  onDeleted,
}: {
  company: Company;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/companies/${company.id}`, { method: 'DELETE' });
    onDeleted();
    onCancel();
  }
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Delete Company</h3>
          <p className="text-sm text-gray-400 mb-1">Are you sure you want to delete:</p>
          <p className="text-sm text-white font-medium mb-4">{company.name}</p>
          <p className="text-xs text-red-400 mb-5">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition">
              {loading ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const [drawer, setDrawer] = useState<Company | null | undefined>(undefined);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

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
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} companies</p>
        </div>
        <button
          onClick={() => setDrawer(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shrink-0"
        >
          <span>+</span> New Company
        </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-gray-800 flex gap-3 flex-wrap">
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
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-8 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Industry</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Location</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Ticker</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Employees</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading…</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">No companies found</td></tr>
            ) : (
              companies.map((c) => {
                const meta = INDUSTRY_META[c.industry_slug];
                return (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-8 py-3">
                      <div className="font-medium text-white group-hover:text-blue-300 transition">{c.name}</div>
                      {c.name_cn && <div className="text-xs text-gray-500 mt-0.5">{c.name_cn}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        {meta?.icon ?? '🏢'} {meta?.name ?? c.industry_slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {[c.hq_city, c.country].filter(Boolean).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.is_public ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-700/50 text-gray-500'
                      }`}>
                        {c.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{c.ticker ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {c.employee_count ? c.employee_count.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDrawer(c)}
                          className="text-xs text-gray-500 hover:text-white transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteCompany(c)}
                          className="text-xs text-gray-600 hover:text-red-400 transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Page {page} of {totalPages} ({total.toLocaleString()} total)</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">← Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawer !== undefined && (
        <CompanyDrawer company={drawer} onClose={() => setDrawer(undefined)} onSaved={load} />
      )}

      {/* Delete Modal */}
      {deleteCompany && (
        <DeleteModal company={deleteCompany} onCancel={() => setDeleteCompany(null)} onDeleted={load} />
      )}
    </div>
  );
}
