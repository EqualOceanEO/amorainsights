'use client';

import { useState } from 'react';
import type { UserWatchlistItem, NewsItem, IndustrySlug } from '@/lib/db';

interface Props {
  watchlist: UserWatchlistItem[];
  recentNews: NewsItem[];
  industryMeta: Record<IndustrySlug, { name: string; name_cn: string; icon: string }>;
}

export default function AlertsClient({ watchlist, recentNews, industryMeta }: Props) {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'news'>('watchlist');

  const watchedNames = watchlist
    .map((w) => w.company?.name || w.user_company?.name || 'Unknown')
    .filter(Boolean);

  // Simple keyword matching: flag news items that mention watched companies
  const relevantNews = recentNews.filter((n) => {
    const title = n.title?.toLowerCase() || '';
    const summary = n.summary?.toLowerCase() || '';
    return watchedNames.some((name) =>
      title.includes(name.toLowerCase()) || summary.includes(name.toLowerCase())
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor your watchlist companies and latest industry news.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            activeTab === 'watchlist' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          My Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Relevant News ({relevantNews.length})
        </button>
      </div>

      {activeTab === 'watchlist' && (
        <div>
          {watchlist.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              <p className="text-lg mb-2">Watchlist is empty</p>
              <p className="text-sm">Add companies from My Companies or the platform directory to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => {
                const company = item.company || item.user_company;
                const name = company?.name || 'Unknown';
                const nameCn = 'name_cn' in (company || {}) ? (company as any).name_cn : null;
                const industry = 'industry_slug' in (company || {}) ? (company as any).industry_slug : null;
                return (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${item.alert_enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
                        <div>
                          <span className="text-white font-medium">{name}</span>
                          {nameCn && <span className="text-gray-500 ml-2 text-sm">{nameCn}</span>}
                        </div>
                        {industry && (
                          <span className="text-xs text-gray-500">
                            {industryMeta[industry as IndustrySlug]?.icon} {industryMeta[industry as IndustrySlug]?.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {item.alert_enabled ? '🔔 Alerts ON' : '🔕 Alerts OFF'}
                        </span>
                        <span className="text-xs text-gray-600">
                          Added {new Date(item.added_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-2 ml-5">{item.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'news' && (
        <div>
          {relevantNews.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No relevant news found</p>
              <p className="text-sm">News mentioning your watched companies will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relevantNews.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-white">{item.title}</h3>
                      {item.summary && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.summary}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-gray-500 block">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                      {item.industry_slug && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          {industryMeta[item.industry_slug]?.icon} {industryMeta[item.industry_slug]?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
