'use client';

import { useEffect, useState, useCallback } from 'react';

type Order = {
  id: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_invoice_id: string | null;
  email: string;
  amount_usd: number;
  currency: string;
  status: string;
  plan: string | null;
  billing_period: string | null;
  paid_at: string | null;
  created_at: string;
  hosted_invoice_url: string | null;
  description: string | null;
};

type Stats = {
  paidOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
};

function fmtDate(d: string | null) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function fmtDateTime(d: string | null) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    paid:       { cls: 'bg-green-900/30 text-green-400', label: 'Paid' },
    draft:      { cls: 'bg-gray-700/50 text-gray-500', label: 'Draft' },
    open:       { cls: 'bg-yellow-900/30 text-yellow-400', label: 'Open' },
    voided:     { cls: 'bg-red-900/30 text-red-400', label: 'Voided' },
    uncollectible: { cls: 'bg-red-900/20 text-red-300', label: 'Uncollectible' },
  };
  const s = map[status] ?? { cls: 'bg-gray-800 text-gray-500', label: status };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

function periodBadge(period: string | null) {
  if (!period) return null;
  const map: Record<string, { cls: string; label: string }> = {
    first:     { cls: 'bg-blue-900/30 text-blue-400', label: 'First' },
    recurring: { cls: 'bg-purple-900/30 text-purple-400', label: 'Recurring' },
    upgrade:   { cls: 'bg-amber-900/30 text-amber-400', label: 'Upgrade' },
  };
  const p = map[period] ?? { cls: 'bg-gray-800 text-gray-500', label: period };
  return <span className={`text-xs px-2 py-0.5 rounded ${p.cls}`}>{p.label}</span>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const PAGE_SIZE = 30;

  const loadData = useCallback(async (withSync = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        q: search,
        status: statusFilter,
      });
      if (withSync) params.set('sync', 'true');

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data ?? []);
        setTotal(json.total ?? 0);
        setStats(json.stats ?? null);
        if (withSync) {
          setLastSync(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleSync = async () => {
    setSyncing(true);
    await loadData(true);
    setSyncing(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Orders &amp; Invoices</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total.toLocaleString()} total orders
            {lastSync && <span className="ml-2 text-gray-600">Last sync: {lastSync}</span>}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors"
        >
          <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {syncing ? 'Syncing from Stripe...' : 'Sync from Stripe'}
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Paid Orders', value: stats.paidOrders, color: 'text-green-400', icon: '\u2705' },
            { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-blue-400', icon: '\uD83D\uDCB0' },
            { label: 'Active Subs', value: stats.activeSubscriptions, color: 'text-purple-400', icon: '\uD83D\uDD04' },
            { label: 'Avg. Order Value', value: stats.paidOrders > 0
                ? `$${Math.round(stats.totalRevenue / stats.paidOrders)}`
                : '\u2014',
              color: 'text-amber-400', icon: '\uD83D\uDCCA' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{kpi.icon}</span>
                <span className="text-xs text-gray-400">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {['', 'paid', 'draft', 'open', 'voided', 'uncollectible'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors capitalize ${
              statusFilter === s
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Period</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Paid At</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">\uD83D\uDCCB</span>
                      <span>No orders yet</span>
                      <span className="text-xs text-gray-600">
                        Click &quot;Sync from Stripe&quot; to pull invoices
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="text-gray-400 font-mono text-xs">
                        {o.stripe_invoice_id ? o.stripe_invoice_id.slice(-8) : `\u2014`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-mono text-xs max-w-[180px] truncate">
                      {o.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-300">
                        {o.plan ?? '\u2014'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white">
                        ${(Number(o.amount_usd) || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-600 ml-1 uppercase">{o.currency}</span>
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(o.status)}
                    </td>
                    <td className="px-4 py-3">
                      {periodBadge(o.billing_period)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(o.paid_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {o.hosted_invoice_url && (
                          <a
                            href={o.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
                            title="View Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        {o.stripe_customer_id && (
                          <a
                            href={`https://dashboard.stripe.com/customers/${o.stripe_customer_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-purple-400 transition-colors"
                            title="View in Stripe"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </a>
                        )}
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
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {totalPages} &middot; {total.toLocaleString()} orders
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
