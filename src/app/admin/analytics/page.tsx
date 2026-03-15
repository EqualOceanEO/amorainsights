'use client';

import { useEffect, useState } from 'react';

type Overview = {
  summary: {
    totalPageViews: number;
    uniqueSessions: number;
    totalUsers: number;
    totalEvents: number;
  };
  topPages: { path: string; views: number }[];
  dailySeries: { date: string; views: number }[];
  deviceBreakdown: Record<string, number>;
  topCountries: { country: string; views: number }[];
  topEvents: { name: string; count: number }[];
  funnel: { step: string; label: string; users: number }[];
  periodDays: number;
};

const PERIOD_OPTIONS = [7, 14, 30, 90];

function MiniBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; views: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.views), 1);
  const W = 300, H = 60;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.views / max) * H;
    return `${x},${y}`;
  });
  const areaPath = `M0,${H} L${pts.join(' L')} L${W},${H} Z`;
  const linePath = `M${pts.join(' L')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sg)" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  );
}

function FunnelChart({ data }: { data: Overview['funnel'] }) {
  const maxVal = Math.max(...data.map((d) => d.users), 1);
  const STEP_LABELS: Record<string, string> = {
    user_registered: 'Registered',
    user_login: 'Logged In',
    report_view: 'Viewed Report',
    upgrade_click: 'Upgrade Click',
  };
  return (
    <div className="space-y-3">
      {data.map((step, i) => {
        const prev = i > 0 ? data[i - 1].users : step.users;
        const dropRate = prev > 0 ? Math.round(((prev - step.users) / prev) * 100) : 0;
        return (
          <div key={step.step}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{STEP_LABELS[step.step] ?? step.label}</span>
              <div className="flex items-center gap-2">
                {i > 0 && dropRate > 0 && (
                  <span className="text-xs text-red-400">-{dropRate}%</span>
                )}
                <span className="text-xs font-medium text-white">{step.users.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-6 bg-gray-800 rounded overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded transition-all duration-500"
                style={{ width: `${(step.users / maxVal) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-xs text-white/60">
                {maxVal > 0 ? Math.round((step.users / maxVal) * 100) : 0}% of top
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics/overview?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message ?? 'Failed to load analytics');
        setLoading(false);
      });
  }, [days]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm animate-pulse">Loading analytics…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-red-400 text-sm">Failed to load analytics: {error}</div>
        <button
          onClick={() => { setLoading(true); setError(null); fetch(`/api/admin/analytics/overview?days=${days}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch((e:Error)=>{setError(e.message);setLoading(false);}); }}
          className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, topPages, dailySeries, deviceBreakdown, topCountries, topEvents, funnel } = data;
  const totalDevice = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Site-wide traffic & behavior insights</p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                days === d
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Page Views', value: summary.totalPageViews, icon: '👁️', color: 'blue' },
          { label: 'Unique Sessions', value: summary.uniqueSessions, icon: '🔗', color: 'purple' },
          { label: 'Total Users', value: summary.totalUsers, icon: '👤', color: 'green' },
          { label: 'Events Tracked', value: summary.totalEvents, icon: '⚡', color: 'amber' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{kpi.icon}</span>
              <span className="text-xs text-gray-400">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Last {days} days</div>
          </div>
        ))}
      </div>

      {/* Daily Sparkline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Daily Page Views</h2>
          <span className="text-xs text-gray-500">Last {days} days</span>
        </div>
        <Sparkline data={dailySeries} />
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{dailySeries[0]?.date?.slice(5)}</span>
          <span>{dailySeries[Math.floor(dailySeries.length / 2)]?.date?.slice(5)}</span>
          <span>{dailySeries[dailySeries.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Top Pages</h2>
          <div className="space-y-3">
            {topPages.length === 0 && (
              <p className="text-xs text-gray-500">No data yet</p>
            )}
            {topPages.map((p) => {
              const maxViews = topPages[0]?.views ?? 1;
              return (
                <div key={p.path} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-300 truncate max-w-[160px]" title={p.path}>
                      {p.path}
                    </span>
                    <span className="text-xs text-white font-medium shrink-0">{p.views}</span>
                  </div>
                  <MiniBar value={p.views} max={maxViews} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Top Events</h2>
          <div className="space-y-3">
            {topEvents.length === 0 && (
              <p className="text-xs text-gray-500">No events tracked yet</p>
            )}
            {topEvents.map((e) => {
              const maxCount = topEvents[0]?.count ?? 1;
              return (
                <div key={e.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-300 truncate max-w-[160px]">{e.name}</span>
                    <span className="text-xs text-white font-medium shrink-0">{e.count}</span>
                  </div>
                  <MiniBar value={e.count} max={maxCount} color="bg-purple-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Devices</h2>
          <div className="space-y-3">
            {Object.entries(deviceBreakdown).map(([device, count]) => {
              const pct = Math.round((count / totalDevice) * 100);
              const icon = device === 'mobile' ? '📱' : device === 'tablet' ? '📟' : '💻';
              return (
                <div key={device} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 capitalize">{icon} {device}</span>
                    <span className="text-xs text-white">{pct}%</span>
                  </div>
                  <MiniBar value={count} max={totalDevice} color="bg-green-500" />
                </div>
              );
            })}
            {Object.keys(deviceBreakdown).length === 0 && (
              <p className="text-xs text-gray-500">No data yet</p>
            )}
          </div>

          {/* Countries */}
          <h2 className="text-sm font-semibold text-white mt-6 mb-4">Top Countries</h2>
          <div className="space-y-2">
            {topCountries.slice(0, 5).map((c) => (
              <div key={c.country} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{c.country}</span>
                <span className="text-white font-medium">{c.views}</span>
              </div>
            ))}
            {topCountries.length === 0 && (
              <p className="text-xs text-gray-500">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h2>
        <FunnelChart data={funnel} />
        {funnel.every((f) => f.users === 0) && (
          <p className="text-xs text-gray-500 mt-3">
            Funnel will populate as users trigger events: user_registered, user_login, report_view, upgrade_click
          </p>
        )}
      </div>
    </div>
  );
}
