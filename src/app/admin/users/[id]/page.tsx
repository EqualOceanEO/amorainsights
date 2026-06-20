'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type TimelineItem =
  | {
      type: 'pageview';
      time: string;
      path: string;
      referrer: string | null;
      device: string | null;
      country: string | null;
      session_id: string | null;
      duration_sec: number | null;
    }
  | {
      type: 'event';
      time: string;
      event_name: string;
      event_category: string | null;
      properties: Record<string, unknown>;
      path: string | null;
      session_id: string | null;
    };

type UserJourney = {
  user: {
    id: number;
    email: string;
    name: string | null;
    created_at: string;
    is_admin: boolean;
    subscription_tier: string;
    subscription_expires_at: string | null;
    acquisition_channel: string | null;
    conversion_last_touch: string | null;
    last_content_slug: string | null;
  };
  stats: {
    totalPvs: number;
    totalEvents: number;
    sessionCount: number;
    lastSeen: string | null;
    firstSeen: string | null;
  };
  topPages: { path: string; count: number }[];
  timeline: TimelineItem[];
  sessions: { session_id: string; start: string; end: string; pageCount: number }[];
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function durationLabel(sec: number | null) {
  if (!sec) return null;
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

const EVENT_COLORS: Record<string, string> = {
  user_registered: 'bg-green-500/20 text-green-400 border-green-500/30',
  user_login: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  report_view: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  upgrade_click: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  report_unlock: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  subscription_started: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function UserJourneyPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [data, setData] = useState<UserJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'events' | 'pages'>('all');

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/admin/analytics/user/${userId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm animate-pulse">Loading journey…</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">User not found.</div>
    );
  }

  const { user, stats, topPages, timeline, sessions } = data;

  const filteredTimeline = timeline.filter((item) => {
    if (activeSession && item.session_id !== activeSession) return false;
    if (viewMode === 'events') return item.type === 'event';
    if (viewMode === 'pages') return item.type === 'pageview';
    return true;
  });

  const TIER_COLORS: Record<string, string> = {
    free: 'bg-gray-700 text-gray-300',
    pro: 'bg-blue-600/30 text-blue-300',
    enterprise: 'bg-purple-600/30 text-purple-300',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/users" className="hover:text-white transition-colors">Users</Link>
        <span>›</span>
        <span className="text-white">{user.name ?? user.email}</span>
      </div>

      {/* User Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white">{user.name ?? 'No name'}</h1>
              {user.is_admin && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded font-medium">ADMIN</span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TIER_COLORS[user.subscription_tier] ?? 'bg-gray-700 text-gray-300'}`}>
                {user.subscription_tier}
              </span>
            </div>
            <div className="text-gray-400 text-sm mt-0.5">{user.email}</div>
            <div className="text-gray-500 text-xs mt-1">
              User #{user.id} · Joined {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Meta fields */}
          <div className="text-right text-xs text-gray-500 space-y-1 shrink-0">
            {user.acquisition_channel && (
              <div>Source: <span className="text-gray-300">{user.acquisition_channel}</span></div>
            )}
            {user.conversion_last_touch && (
              <div>Last touch: <span className="text-gray-300">{user.conversion_last_touch}</span></div>
            )}
            {user.last_content_slug && (
              <div>Last content: <span className="text-gray-300">{user.last_content_slug}</span></div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-800">
          {[
            { label: 'Page Views', value: stats.totalPvs },
            { label: 'Events', value: stats.totalEvents },
            { label: 'Sessions', value: stats.sessionCount },
            { label: 'First Seen', value: stats.firstSeen ? new Date(stats.firstSeen).toLocaleDateString() : '—' },
            { label: 'Last Seen', value: stats.lastSeen ? fmt(stats.lastSeen) : '—' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pages + Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Most Visited Pages</h2>
          {topPages.length === 0 ? (
            <p className="text-xs text-gray-500">No page views yet</p>
          ) : (
            <div className="space-y-2">
              {topPages.map((p) => {
                const max = topPages[0].count;
                const pct = Math.round((p.count / max) * 100);
                return (
                  <div key={p.path}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-300 truncate max-w-[220px]" title={p.path}>{p.path}</span>
                      <span className="text-xs text-white font-medium">{p.count}x</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-500">No sessions recorded</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sessions.map((s) => {
                const duration = s.end && s.start
                  ? Math.round((new Date(s.end).getTime() - new Date(s.start).getTime()) / 1000)
                  : null;
                const active = activeSession === s.session_id;
                return (
                  <button
                    key={s.session_id}
                    onClick={() => setActiveSession(active ? null : s.session_id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      active ? 'bg-blue-600/20 text-blue-300' : 'bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate">{new Date(s.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span>{s.pageCount} pages</span>
                      {duration && <span className="text-gray-500">{durationLabel(duration)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {activeSession && (
            <button
              onClick={() => setActiveSession(null)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ✕ Clear session filter
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-white">
            Full Journey Timeline
            <span className="ml-2 text-xs text-gray-500 font-normal">
              {filteredTimeline.length} items
              {activeSession ? ' (filtered by session)' : ''}
            </span>
          </h2>
          <div className="flex gap-1">
            {(['all', 'events', 'pages'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors capitalize ${
                  viewMode === m
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filteredTimeline.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">No activity recorded yet</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-800" />

            <div className="space-y-1 max-h-[600px] overflow-y-auto pl-1">
              {filteredTimeline.map((item, idx) => (
                <div key={idx} className="flex gap-3 group">
                  {/* Dot */}
                  <div className={`relative z-10 mt-2.5 w-2.5 h-2.5 rounded-full shrink-0 border-2 ${
                    item.type === 'event'
                      ? 'bg-purple-500 border-purple-400'
                      : 'bg-gray-600 border-gray-500 group-hover:bg-blue-500 group-hover:border-blue-400'
                  } transition-colors`} />

                  {/* Content */}
                  <div className="flex-1 py-2 pr-2">
                    {item.type === 'pageview' ? (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm text-gray-300 font-mono">{item.path}</span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {item.referrer && (
                              <span className="text-xs text-gray-600">from {item.referrer.slice(0, 40)}</span>
                            )}
                            {item.device && (
                              <span className="text-xs text-gray-600">· {item.device}</span>
                            )}
                            {item.country && (
                              <span className="text-xs text-gray-600">· {item.country}</span>
                            )}
                            {item.duration_sec && (
                              <span className="text-xs text-gray-500">· {durationLabel(item.duration_sec)}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 shrink-0">{fmt(item.time)}</span>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`inline-flex px-2 py-0.5 text-xs rounded-md border font-medium ${
                            EVENT_COLORS[item.event_name] ?? 'bg-gray-700/30 text-gray-400 border-gray-700'
                          }`}>
                            ⚡ {item.event_name}
                          </span>
                          {item.event_category && (
                            <span className="ml-2 text-xs text-gray-500">[{item.event_category}]</span>
                          )}
                          {item.path && (
                            <div className="text-xs text-gray-600 mt-0.5">{item.path}</div>
                          )}
                          {item.properties && Object.keys(item.properties).length > 0 && (
                            <div className="text-xs text-gray-600 mt-0.5 font-mono">
                              {JSON.stringify(item.properties).slice(0, 80)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 shrink-0">{fmt(item.time)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
