'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

interface NewsItem {
  id: number;
  title: string;
  industry_slug: string;
  source_name: string | null;
  published_at: string;
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news?limit=100')
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteNav />
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage News</h1>
          <p className="text-gray-400">Edit news articles and manage content</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No news items found</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-left">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Sector</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-4 py-3 text-white truncate max-w-md">{item.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs uppercase">{item.industry_slug}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.source_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.published_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-medium transition"
                      >
                        Edit
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
