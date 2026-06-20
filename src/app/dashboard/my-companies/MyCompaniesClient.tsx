'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserCompany, Company, IndustrySlug } from '@/lib/db';

interface Props {
  userCompanies: UserCompany[];
  platformCompanies: Company[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
  userId: number;
}

export default function MyCompaniesClient({
  userCompanies: initialUserCompanies,
  platformCompanies,
  industryMeta,
  allIndustrySlugs,
  userId,
}: Props) {
  const router = useRouter();
  const [userCompanies, setUserCompanies] = useState(initialUserCompanies);
  const [activeTab, setActiveTab] = useState<'my' | 'platform' | 'add'>('my');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', name_cn: '', industry_slug: 'ai' as IndustrySlug, sub_sector: '',
    description: '', founded_year: '', country: 'China', hq_city: '', hq_province: '',
    website: '', employee_count: '', funding_stage: '', funding_total_usd: '',
    valuation_usd: '', revenue_range: '', business_model: '',
    core_products: '', tech_route: '', key_partners: '', primary_use_cases: '', competitors: '',
  });
  const [editId, setEditId] = useState<number | null>(null);

  const filteredPlatform = platformCompanies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter === 'all' || c.industry_slug === industryFilter;
    return matchSearch && matchIndustry;
  });

  const filteredMy = userCompanies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter === 'all' || c.industry_slug === industryFilter;
    return matchSearch && matchIndustry;
  });

  function resetForm() {
    setForm({
      name: '', name_cn: '', industry_slug: 'ai', sub_sector: '',
      description: '', founded_year: '', country: 'China', hq_city: '', hq_province: '',
      website: '', employee_count: '', funding_stage: '', funding_total_usd: '',
      valuation_usd: '', revenue_range: '', business_model: '',
      core_products: '', tech_route: '', key_partners: '', primary_use_cases: '', competitors: '',
    });
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        name_cn: form.name_cn || null,
        industry_slug: form.industry_slug,
        sub_sector: form.sub_sector || null,
        description: form.description || null,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        country: form.country,
        hq_city: form.hq_city || null,
        hq_province: form.hq_province || null,
        website: form.website || null,
        employee_count: form.employee_count ? parseInt(form.employee_count) : null,
        funding_stage: form.funding_stage || null,
        funding_total_usd: form.funding_total_usd ? parseFloat(form.funding_total_usd) : null,
        valuation_usd: form.valuation_usd ? parseFloat(form.valuation_usd) : null,
        revenue_range: form.revenue_range || null,
        business_model: form.business_model || null,
        core_products: form.core_products || null,
        tech_route: form.tech_route || null,
        key_partners: form.key_partners || null,
        primary_use_cases: form.primary_use_cases || null,
        competitors: form.competitors || null,
      };

      const url = editId
        ? `/api/user-companies/${editId}`
        : '/api/user-companies';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      const saved = await res.json();
      const data = saved.data || saved;

      if (editId) {
        setUserCompanies((prev) => prev.map((c) => (c.id === editId ? data : c)));
      } else {
        setUserCompanies((prev) => [data, ...prev]);
      }
      resetForm();
      setActiveTab('my');
    } catch (err) {
      alert('Failed to save company. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this company? This cannot be undone.')) return;
    setLoading(true);
    try {
      await fetch(`/api/user-companies/${id}`, { method: 'DELETE' });
      setUserCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(company: UserCompany) {
    setForm({
      name: company.name,
      name_cn: company.name_cn || '',
      industry_slug: company.industry_slug,
      sub_sector: company.sub_sector || '',
      description: company.description || '',
      founded_year: company.founded_year?.toString() || '',
      country: company.country,
      hq_city: company.hq_city || '',
      hq_province: company.hq_province || '',
      website: company.website || '',
      employee_count: company.employee_count?.toString() || '',
      funding_stage: company.funding_stage || '',
      funding_total_usd: company.funding_total_usd?.toString() || '',
      valuation_usd: company.valuation_usd?.toString() || '',
      revenue_range: company.revenue_range || '',
      business_model: company.business_model || '',
      core_products: company.core_products || '',
      tech_route: company.tech_route || '',
      key_partners: company.key_partners || '',
      primary_use_cases: company.primary_use_cases || '',
      competitors: company.competitors || '',
    });
    setEditId(company.id);
    setShowForm(true);
    setActiveTab('add');
  }

  function copyToForm(company: Company) {
    setForm({
      name: company.name,
      name_cn: company.name_cn || '',
      industry_slug: company.industry_slug,
      sub_sector: company.sub_sector || '',
      description: company.description || '',
      founded_year: company.founded_year?.toString() || '',
      country: company.country,
      hq_city: company.hq_city || '',
      hq_province: company.hq_province || '',
      website: company.website || '',
      employee_count: company.employee_count?.toString() || '',
      funding_stage: company.funding_stage || '',
      funding_total_usd: company.funding_total_usd?.toString() || '',
      valuation_usd: company.valuation_usd?.toString() || '',
      revenue_range: '',
      business_model: '',
      core_products: company.core_products || '',
      tech_route: company.tech_route || '',
      key_partners: company.key_partners || '',
      primary_use_cases: company.primary_use_cases || '',
      competitors: '',
    });
    setEditId(null);
    setShowForm(true);
    setActiveTab('add');
  }

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Companies</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your company profiles and track competitors.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); setActiveTab('add'); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
        >
          + Add Company
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
        {(['my', 'platform', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'my' ? `My Companies (${userCompanies.length})` : tab === 'platform' ? 'Platform Directory' : showForm ? (editId ? 'Edit' : 'New') : 'New'}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      {(activeTab === 'my' || activeTab === 'platform') && (
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="all">All Industries</option>
            {allIndustrySlugs.map((slug) => (
              <option key={slug} value={slug}>{industryMeta[slug].icon} {industryMeta[slug].name}</option>
            ))}
          </select>
        </div>
      )}

      {/* My Companies Tab */}
      {activeTab === 'my' && (
        <div className="space-y-3">
          {filteredMy.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No companies yet</p>
              <p className="text-sm">Add your first company or browse the platform directory.</p>
            </div>
          ) : (
            filteredMy.map((company) => (
              <div key={company.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      {company.name_cn && <span className="text-gray-500 text-sm">{company.name_cn}</span>}
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {industryMeta[company.industry_slug]?.icon} {industryMeta[company.industry_slug]?.name}
                      </span>
                    </div>
                    {company.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{company.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {company.country && <span>📍 {company.country}{company.hq_city ? `, ${company.hq_city}` : ''}</span>}
                      {company.founded_year && <span>🏗️ Est. {company.founded_year}</span>}
                      {company.employee_count && <span>👥 {company.employee_count.toLocaleString()} employees</span>}
                      {company.funding_stage && <span>💰 {company.funding_stage}</span>}
                      {company.funding_total_usd && <span>💵 ${(company.funding_total_usd / 1e6).toFixed(1)}M</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(company)}
                      className="text-xs text-gray-400 hover:text-blue-400 px-2 py-1 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Platform Directory Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-3">
          {filteredPlatform.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No companies match your filters.</div>
          ) : (
            filteredPlatform.map((company) => (
              <div key={company.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      {company.name_cn && <span className="text-gray-500 text-sm">{company.name_cn}</span>}
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {industryMeta[company.industry_slug]?.icon} {industryMeta[company.industry_slug]?.name}
                      </span>
                    </div>
                    {company.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{company.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {company.country && <span>📍 {company.country}{company.hq_city ? `, ${company.hq_city}` : ''}</span>}
                      {company.founded_year && <span>🏗️ Est. {company.founded_year}</span>}
                      {company.amora_total_score && (
                        <span className="text-blue-400">⭐ AMORA {company.amora_total_score}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToForm(company)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
                  >
                    + Add to My Companies
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Form Tab */}
      {activeTab === 'add' && showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">{editId ? 'Edit Company' : 'Add New Company'}</h2>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. DeepRoute.ai" />
            </div>
            <div>
              <label className={labelClass}>Chinese Name</label>
              <input type="text" value={form.name_cn} onChange={(e) => setForm({ ...form, name_cn: e.target.value })} className={inputClass} placeholder="e.g. 元戎启行" />
            </div>
            <div>
              <label className={labelClass}>Industry *</label>
              <select required value={form.industry_slug} onChange={(e) => setForm({ ...form, industry_slug: e.target.value as IndustrySlug })} className={inputClass}>
                {allIndustrySlugs.map((slug) => (
                  <option key={slug} value={slug}>{industryMeta[slug].icon} {industryMeta[slug].name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Sub-sector</label>
              <input type="text" value={form.sub_sector} onChange={(e) => setForm({ ...form, sub_sector: e.target.value })} className={inputClass} placeholder="e.g. Autonomous Driving" />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>HQ City</label>
              <input type="text" value={form.hq_city} onChange={(e) => setForm({ ...form, hq_city: e.target.value })} className={inputClass} placeholder="e.g. Shenzhen" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Founded Year</label>
              <input type="number" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} className={inputClass} placeholder="e.g. 2019" />
            </div>
            <div>
              <label className={labelClass}>Employees</label>
              <input type="number" value={form.employee_count} onChange={(e) => setForm({ ...form, employee_count: e.target.value })} className={inputClass} placeholder="e.g. 500" />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://" />
            </div>
            <div>
              <label className={labelClass}>HQ Province</label>
              <input type="text" value={form.hq_province} onChange={(e) => setForm({ ...form, hq_province: e.target.value })} className={inputClass} placeholder="e.g. Guangdong" />
            </div>
          </div>

          {/* Funding Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Funding Stage</label>
              <select value={form.funding_stage} onChange={(e) => setForm({ ...form, funding_stage: e.target.value })} className={inputClass}>
                <option value="">—</option>
                <option value="Seed">Seed</option>
                <option value="Angel">Angel</option>
                <option value="Pre-A">Pre-A</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C">Series C</option>
                <option value="Series D+">Series D+</option>
                <option value="Pre-IPO">Pre-IPO</option>
                <option value="IPO">IPO</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Funding (USD)</label>
              <input type="number" step="any" value={form.funding_total_usd} onChange={(e) => setForm({ ...form, funding_total_usd: e.target.value })} className={inputClass} placeholder="e.g. 300000000" />
            </div>
            <div>
              <label className={labelClass}>Valuation (USD)</label>
              <input type="number" step="any" value={form.valuation_usd} onChange={(e) => setForm({ ...form, valuation_usd: e.target.value })} className={inputClass} placeholder="e.g. 1000000000" />
            </div>
            <div>
              <label className={labelClass}>Revenue Range</label>
              <select value={form.revenue_range} onChange={(e) => setForm({ ...form, revenue_range: e.target.value })} className={inputClass}>
                <option value="">—</option>
                <option value="<1M">&lt;$1M</option>
                <option value="1M-10M">$1M - $10M</option>
                <option value="10M-100M">$10M - $100M</option>
                <option value="100M-500M">$100M - $500M</option>
                <option value="500M+">$500M+</option>
              </select>
            </div>
          </div>

          {/* Business */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} placeholder="Brief company description..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Model</label>
              <input type="text" value={form.business_model} onChange={(e) => setForm({ ...form, business_model: e.target.value })} className={inputClass} placeholder="e.g. B2B SaaS" />
            </div>
            <div>
              <label className={labelClass}>Core Products</label>
              <input type="text" value={form.core_products} onChange={(e) => setForm({ ...form, core_products: e.target.value })} className={inputClass} placeholder="e.g. L4 autonomous driving system" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tech Route</label>
              <input type="text" value={form.tech_route} onChange={(e) => setForm({ ...form, tech_route: e.target.value })} className={inputClass} placeholder="e.g. Vision-only, LiDAR fusion" />
            </div>
            <div>
              <label className={labelClass}>Key Partners</label>
              <input type="text" value={form.key_partners} onChange={(e) => setForm({ ...form, key_partners: e.target.value })} className={inputClass} placeholder="e.g. BYD, SAIC" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary Use Cases</label>
              <input type="text" value={form.primary_use_cases} onChange={(e) => setForm({ ...form, primary_use_cases: e.target.value })} className={inputClass} placeholder="e.g. Robotaxi, urban delivery" />
            </div>
            <div>
              <label className={labelClass}>Competitors</label>
              <input type="text" value={form.competitors} onChange={(e) => setForm({ ...form, competitors: e.target.value })} className={inputClass} placeholder="Comma-separated names" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-lg transition font-medium"
            >
              {loading ? 'Saving...' : editId ? 'Update Company' : 'Create Company'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
