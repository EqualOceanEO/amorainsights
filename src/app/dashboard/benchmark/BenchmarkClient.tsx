'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { UserCompany, Company, UserBenchmarkGroup, IndustrySlug } from '@/lib/db';

interface Props {
  userCompanies: UserCompany[];
  platformCompanies: Company[];
  benchmarkGroups: UserBenchmarkGroup[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
  allIndustrySlugs: IndustrySlug[];
  userId: number;
}

type SelectableCompany = { id: number; name: string; name_cn: string | null; industry_slug: IndustrySlug; source: 'platform' | 'user'; scores: number[] };

const DIM_LABELS = ['Advancement', 'Mastery', 'Operations', 'Reach', 'Affinity'];
const DIM_KEYS = ['amora_advancement_score', 'amora_mastery_score', 'amora_operations_score', 'amora_reach_score', 'amora_affinity_score'] as const;

export default function BenchmarkClient({ userCompanies, platformCompanies, benchmarkGroups: initialGroups, industryMeta, allIndustrySlugs, userId }: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(groups[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const allSelectable: SelectableCompany[] = useMemo(() => [
    ...platformCompanies.map((c) => ({
      id: c.id, name: c.name, name_cn: c.name_cn, industry_slug: c.industry_slug, source: 'platform' as const,
      scores: DIM_KEYS.map((k) => c[k] as number ?? 0),
    })),
    ...userCompanies.map((c) => ({
      id: c.id, name: c.name, name_cn: c.name_cn, industry_slug: c.industry_slug, source: 'user' as const,
      scores: [0, 0, 0, 0, 0],
    })),
  ], [platformCompanies, userCompanies]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const groupCompanies = useMemo(() => {
    if (!selectedGroup) return [];
    const ids = new Set([...selectedGroup.company_ids, ...selectedGroup.user_company_ids.map((id) => `uc_${id}`)]);
    return allSelectable.filter((c) => {
      if (c.source === 'platform') return selectedGroup.company_ids.includes(c.id);
      return selectedGroup.user_company_ids.includes(c.id);
    });
  }, [selectedGroup, allSelectable]);

  async function createGroup() {
    if (!newGroupName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/benchmark-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim(), description: newGroupDesc.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const group = data.data || data;
      setGroups((prev) => [group, ...prev]);
      setSelectedGroupId(group.id);
      setShowCreate(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch { alert('Failed to create group'); }
    finally { setLoading(false); }
  }

  async function deleteGroup(id: number) {
    if (!confirm('Delete this benchmark group?')) return;
    setLoading(true);
    try {
      await fetch(`/api/benchmark-groups/${id}`, { method: 'DELETE' });
      setGroups((prev) => prev.filter((g) => g.id !== id));
      if (selectedGroupId === id) setSelectedGroupId(groups.find((g) => g.id !== id)?.id ?? null);
    } catch { alert('Failed to delete'); }
    finally { setLoading(false); }
  }

  async function toggleCompany(company: SelectableCompany) {
    if (!selectedGroup) return;
    const isInGroup = company.source === 'platform'
      ? selectedGroup.company_ids.includes(company.id)
      : selectedGroup.user_company_ids.includes(company.id);

    const newCompanyIds = company.source === 'platform'
      ? (isInGroup ? selectedGroup.company_ids.filter((id) => id !== company.id) : [...selectedGroup.company_ids, company.id])
      : selectedGroup.company_ids;
    const newUserCompanyIds = company.source === 'user'
      ? (isInGroup ? selectedGroup.user_company_ids.filter((id) => id !== company.id) : [...selectedGroup.user_company_ids, company.id])
      : selectedGroup.user_company_ids;

    try {
      const res = await fetch(`/api/benchmark-groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_ids: newCompanyIds, user_company_ids: newUserCompanyIds }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const updated = data.data || data;
      setGroups((prev) => prev.map((g) => (g.id === selectedGroup.id ? updated : g)));
    } catch { alert('Failed to update'); }
  }

  const maxPerDim = useMemo(() => {
    const maxes = [0, 0, 0, 0, 0];
    for (const c of groupCompanies) {
      for (let i = 0; i < 5; i++) maxes[i] = Math.max(maxes[i], c.scores[i]);
    }
    return maxes.map((m) => m || 1);
  }, [groupCompanies]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Benchmark</h1>
        <p className="text-gray-400 text-sm mt-1">Compare companies side-by-side across all AMORA dimensions.</p>
      </div>

      {/* Group Selector */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedGroupId === g.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {g.name}
            <span className="ml-2 text-xs opacity-60">
              {(g.company_ids.length + g.user_company_ids.length)} companies
            </span>
          </button>
        ))}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 transition"
        >
          + New Group
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Group Name</label>
            <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Autonomous Driving Leaders" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
            <input type="text" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Brief description" />
          </div>
          <button onClick={createGroup} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition">
            Create
          </button>
          <button onClick={() => setShowCreate(false)}
            className="text-gray-500 hover:text-white text-sm px-3 py-1.5 transition">Cancel</button>
        </div>
      )}

      {selectedGroup ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Select Companies</h3>
                <button onClick={() => deleteGroup(selectedGroup.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition">Delete Group</button>
              </div>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {allSelectable.map((c) => {
                  const isSelected = c.source === 'platform'
                    ? selectedGroup.company_ids.includes(c.id)
                    : selectedGroup.user_company_ids.includes(c.id);
                  return (
                    <button
                      key={`${c.source}-${c.id}`}
                      onClick={() => toggleCompany(c)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                        isSelected ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30' : 'hover:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <span>
                        {c.name}
                        {c.name_cn && <span className="text-gray-600 ml-1 text-xs">{c.name_cn}</span>}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-blue-400' : 'text-gray-600'}`}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comparison Panel */}
          <div className="lg:col-span-2">
            {groupCompanies.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
                <p className="text-lg mb-2">No companies selected</p>
                <p className="text-sm">Add companies from the panel to start comparing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bar chart comparison */}
                {DIM_LABELS.map((label, dimIdx) => (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-gray-400 mb-3">{label}</h4>
                    <div className="space-y-2">
                      {groupCompanies.map((c) => (
                        <div key={`${c.source}-${c.id}`} className="flex items-center gap-3">
                          <span className="text-xs text-gray-300 w-28 truncate">{c.name}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all flex items-center justify-end pr-2"
                              style={{ width: `${(c.scores[dimIdx] / maxPerDim[dimIdx]) * 100}%` }}
                            >
                              <span className="text-[10px] text-white font-medium">{c.scores[dimIdx] || '—'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg mb-2">No benchmark groups yet</p>
          <p className="text-sm">Create a group to start comparing companies side-by-side.</p>
        </div>
      )}
    </div>
  );
}
