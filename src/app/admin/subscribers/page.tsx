'use client';

import { useEffect, useState, useCallback } from 'react';

// We query Supabase directly from client — admin layout already protects this route

type Subscriber = {
  id: number;
  email: string;
  source: string | null;
  confirmed: boolean;
  confirmed_at: string | null;
  unsubscribed: boolean;
  subscribed_at: string;
  plan: string | null;
  plan_status: string | null;
  stripe_customer_id: string | null;
};

type Stats = {
  total: number;
  confirmed: number;
  unsubscribed: number;
  active: number;
  by_source: Record<string, { total: number; confirmed: number; unsubscribed: number }>;
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function statusBadge(r: Subscriber) {
  if (r.unsubscribed) return <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">Unsubscribed</span>;
  if (r.confirmed) return <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Confirmed</span>;
  return <span className="text-xs bg-gray-700/50 text-gray-500 px-2 py-0.5 rounded-full">Pending</span>;
}

function planBadge(plan: string | null, status: string | null) {
  if (!plan) return null;
  const isActive = status === 'active' || status === 'trialing';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
      {plan}{status && status !== 'active' ? ` · ${status}` : ''}
    </span>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  const colors: Record<string, string> = {
    website: 'bg-gray-800 text-gray-400',
    subscribe_page: 'bg-purple-900/30 text-purple-400',
    dashboard: 'bg-yellow-900/30 text-yellow-400',
    report: 'bg-cyan-900/30 text-cyan-400',
  };
  const cls = colors[source ?? ''] ?? 'bg-gray-800 text-gray-400';
  return <span className={`text-xs px-2 py-0.5 rounded ${cls}`}>{source ?? 'direct'}</span>;
}

function EditModal({ sub, onClose, onSave }: {
  sub: Subscriber;
  onClose: () => void;
  onSave: (updated: Subscriber) => void;
}) {
  const [form, setForm] = useState({
    source: sub.source ?? '',
    confirmed: sub.confirmed,
    unsubscribed: sub.unsubscribed,
    plan: sub.plan ?? '',
    plan_status: sub.plan_status ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/subscribers/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: form.source || null,
          confirmed: form.confirmed,
          unsubscribed: form.unsubscribed,
          plan: form.plan || null,
          plan_status: form.plan_status || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Save failed'); return; }
      onSave({ ...sub, ...json.data });
      onClose();
    } catch (e) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Edit Subscriber</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-800/50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="text-sm text-white font-mono">{sub.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500/30" />
              <span className="text-sm text-gray-300">Confirmed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.unsubscribed} onChange={(e) => setForm({ ...form, unsubscribed: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500/30" />
              <span className="text-sm text-gray-300">Unsubscribed</span>
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Source</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">direct</option>
              <option value="website">website</option>
              <option value="subscribe_page">subscribe_page</option>
              <option value="dashboard">dashboard</option>
              <option value="report">report</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">none</option>
                <option value="basic">basic</option>
                <option value="pro">pro</option>
                <option value="enterprise">enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Plan Status</label>
              <select value={form.plan_status} onChange={(e) => setForm({ ...form, plan_status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">none</option>
                <option value="active">active</option>
                <option value="trialing">trialing</option>
                <option value="past_due">past_due</option>
                <option value="canceled">canceled</option>
              </select>
            </div>
          </div>
          {sub.stripe_customer_id && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">Stripe Customer ID</p>
              <p className="text-xs text-gray-400 font-mono">{sub.stripe_customer_id}</p>
            </div>
          )}
          {sub.confirmed_at && (
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">Confirmed At</p>
              <p className="text-xs text-gray-400">{fmtDateTime(sub.confirmed_at)}</p>
            </div>
          )}
          {error && <p className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl">
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg font-medium transition-colors ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'unsubscribed'>('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState<Subscriber | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statsTab, setStatsTab] = useState<'overview' | 'sources'>('overview');
  const PAGE_SIZE = 30;

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q: search, filter });
    const res = await fetch(`/api/admin/subscribers/list?${params}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.data ?? []);
      setTotal(json.total ?? 0);
    }
    setLoading(false);
  }, [page, search, filter]);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/admin/subscribers');
    if (res.ok) {
      const json = await res.json();
      setStats(json);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async (sub: Subscriber) => {
    const res = await fetch(`/api/admin/subscribers/${sub.id}`, { method: 'DELETE' });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== sub.id));
      setTotal((t) => t - 1);
    }
    setDeleting(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/subscribers/export');
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const sourceEntries = stats ? Object.entries(stats.by_source).sort((a, b) => b[1].total - a[1].total) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Email Subscribers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} total subscribers</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Stats tabs */}
      {stats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            {(['overview', 'sources'] as const).map((tab) => (
              <button key={tab} onClick={() => setStatsTab(tab)}
                className={`px-5 py-3 text-xs font-medium capitalize transition-colors ${statsTab === tab ? 'text-white border-b-2 border-blue-500 -mb-px' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-5">
            {statsTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total', value: stats.total, color: 'text-white' },
                  { label: 'Confirmed', value: stats.confirmed, color: 'text-green-400' },
                  { label: 'Unsubscribed', value: stats.unsubscribed, color: 'text-red-400' },
                  { label: 'Active', value: stats.active, color: 'text-blue-400' },
                ].map((k) => (
                  <div key={k.label} className="bg-gray-800/50 rounded-xl p-4">
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
            )}
            {statsTab === 'sources' && (
              <div className="space-y-2">
                {sourceEntries.map(([src, s]) => (
                  <div key={src} className="flex items-center gap-3 text-sm">
                    <div className="w-28 flex-shrink-0">
                      <SourceBadge source={src} />
                    </div>
                    <div className="flex-1 bg-gray-800/40 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.round((s.total / stats.total) * 100)}%` }} />
                    </div>
                    <div className="w-36 text-right text-gray-500 text-xs">
                      {s.total.toLocaleString()} total · {s.confirmed} confirmed · {s.unsubscribed} unsub
                    </div>
                  </div>
                ))}
                {sourceEntries.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No data</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text" placeholder="Search email…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {(['all', 'confirmed', 'unsubscribed'] as const).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors capitalize ${filter === f ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
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
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Subscribed</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No subscribers found</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-4 py-3 text-white font-mono text-xs max-w-[200px] truncate">{r.email}</td>
                    <td className="px-4 py-3"><SourceBadge source={r.source} /></td>
                    <td className="px-4 py-3">{statusBadge(r)}</td>
                    <td className="px-4 py-3">{planBadge(r.plan, r.plan_status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(r.subscribed_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(r)}
                          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleting(r)}
                          className="p-1.5 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} total</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && <EditModal sub={editing} onClose={() => setEditing(null)} onSave={(updated) => {
        setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      }} />}
      {deleting && (
        <ConfirmModal
          title="Delete Subscriber"
          message={`Remove "${deleting.email}" from the subscribers list? This cannot be undone.`}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
          danger
        />
      )}
    </div>
  );
}
