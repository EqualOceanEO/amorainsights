'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_expires_at: string | null;
  acquisition_channel: string | null;
  pageViews: number;
  lastSeen: string | null;
  totalEvents: number;
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-700 text-gray-300',
  pro: 'bg-blue-600/30 text-blue-300',
  enterprise: 'bg-purple-600/30 text-purple-300',
};

function fmt(d: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  const diff = Date.now() - dt.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return dt.toLocaleDateString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '20',
      q: search,
      tier,
    });
    const res = await fetch(`/api/admin/analytics/users?${params}`);
    const json = await res.json();
    setUsers(json.data ?? []);
    setTotal(json.total ?? 0);
    setTotalPages(json.totalPages ?? 1);
    setLoading(false);
  }, [page, search, tier]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, tier]);

  async function patchUser(id: number, updates: Record<string, unknown>) {
    setSaving(true);
    await fetch('/api/admin/analytics/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    setSaving(false);
    setEditingId(null);
    load();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total.toLocaleString()} registered users
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
        >
          📊 Analytics Overview
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Tier</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Page Views</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Events</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Last Seen</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Source</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {(u.name ?? u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {u.name ?? <span className="text-gray-500 italic">No name</span>}
                            {u.is_admin && (
                              <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded font-medium">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <select
                          defaultValue={u.subscription_tier}
                          onChange={(e) => patchUser(u.id, { subscription_tier: e.target.value })}
                          disabled={saving}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="enterprise">enterprise</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TIER_COLORS[u.subscription_tier]}`}>
                          {u.subscription_tier}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${u.pageViews > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {u.pageViews.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${u.totalEvents > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {u.totalEvents.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-sm ${u.lastSeen ? 'text-gray-300' : 'text-gray-600'}`}>
                        {fmt(u.lastSeen)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {u.acquisition_channel ?? '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
                        >
                          Journey →
                        </Link>
                        <button
                          onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-sm">
            <span className="text-gray-500 text-xs">
              Page {page} of {totalPages} ({total.toLocaleString()} users)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
