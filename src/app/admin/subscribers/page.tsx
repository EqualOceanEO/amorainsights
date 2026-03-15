'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';

// We query Supabase directly from client — admin layout already protects this route

type Subscriber = {
  id: number;
  email: string;
  source: string | null;
  confirmed: boolean;
  unsubscribed: boolean;
  subscribed_at: string;
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'unsubscribed'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  useEffect(() => {
    setLoading(true);

    async function load() {
      // Use API route instead of direct Supabase client (no anon key on client)
      const params = new URLSearchParams({ page: String(page), q: search, filter });
      const res = await fetch(`/api/admin/subscribers/list?${params}`);
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      setRows(json.data ?? []);
      setTotal(json.total ?? 0);
      setLoading(false);
    }

    load();
  }, [page, search, filter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Summary stats (derived from visible rows for speed)
  const confirmed = rows.filter((r) => r.confirmed).length;
  const unsubscribed = rows.filter((r) => r.unsubscribed).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Email Subscribers</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} total subscribers</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Confirmed', value: confirmed, color: 'text-green-400' },
          { label: 'Unsubscribed', value: unsubscribed, color: 'text-red-400' },
          { label: 'Active', value: total - unsubscribed, color: 'text-blue-400' },
        ].map((k) => (
          <div key={k.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.value.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {(['all', 'confirmed', 'unsubscribed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">No subscribers found</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-mono text-xs">{r.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                        {r.source ?? 'direct'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.unsubscribed ? (
                        <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">Unsubscribed</span>
                      ) : r.confirmed ? (
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Confirmed</span>
                      ) : (
                        <span className="text-xs bg-gray-700/50 text-gray-500 px-2 py-0.5 rounded-full">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(r.subscribed_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages}</span>
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
