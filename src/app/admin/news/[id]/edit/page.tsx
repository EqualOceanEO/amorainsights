'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SiteNav from '@/components/SiteNav';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  industry_slug: string;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string;
}

const INDUSTRY_OPTIONS = [
  'ai', 'ai-semiconductors', 'semiconductors-materials', 'autonomous-vehicles',
  'green-tech', 'life-sciences', 'new-space', 'advanced-materials',
  'humanoid-robots', 'ai-agents', 'launch-vehicles', 'gene-editing',
  'ev-batteries', 'energy-storage',
];

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    summary: '',
    content: '',
    industry_slug: 'ai',
    source_name: '',
    source_url: '',
    author: '',
    cover_image_url: '',
    tags: [],
    is_premium: false,
    is_featured: false,
    published_at: new Date().toISOString(),
  });

  // Load existing news item
  useEffect(() => {
    if (!params?.id) return;
    
    fetch(`/api/news/${params.id}/edit`)
      .then(r => r.json())
      .then(data => {
        setItem(data);
        setFormData(data);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load news item');
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags: tags.length > 0 ? tags : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/news/${params?.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      router.push(`/news/${item?.id}`);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteNav />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit News</h1>
          <p className="text-gray-400">Update the news article details and content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary || ''}
              onChange={(e) => handleChange('summary', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Brief summary of the news..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Full Content
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
              placeholder="Full article content. Use double line breaks for paragraphs."
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Industry Sector <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.industry_slug || 'ai'}
              onChange={(e) => handleChange('industry_slug', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {INDUSTRY_OPTIONS.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Source Name
              </label>
              <input
                type="text"
                value={formData.source_name || ''}
                onChange={(e) => handleChange('source_name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Source URL
              </label>
              <input
                type="url"
                value={formData.source_url || ''}
                onChange={(e) => handleChange('source_url', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.cover_image_url || ''}
              onChange={(e) => handleChange('cover_image_url', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              defaultValue={(formData.tags || []).join(', ')}
              onChange={handleTagsChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g., AI, Tech, News"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium || false}
                onChange={(e) => handleChange('is_premium', e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Premium</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>

          {/* Published date */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Published Date
            </label>
            <input
              type="datetime-local"
              value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('published_at', new Date(e.target.value).toISOString())}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
