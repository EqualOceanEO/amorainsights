'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  industry_slug: string;
  company_id: number | null;
  tags: string[];
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  source_name: string | null;
  author: string | null;
}

interface NewsForm {
  title: string;
  slug: string;
  summary: string;
  content: string;
  source_url: string;
  source_name: string;
  author: string;
  cover_image_url: string;
  industry_slug: string;
  company_id: string;
  tags: string;
  is_premium: boolean;
  is_published: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRY_META: Record<string, { name: string; icon: string }> = {
  'ai':                        { name: 'AI',                       icon: '🤖' },
  'life-sciences':             { name: 'Life Sciences',            icon: '🧬' },
  'green-tech':                { name: 'Green Tech',               icon: '⚡' },
  'manufacturing':             { name: 'Manufacturing',            icon: '🦾' },
  'intelligent-manufacturing': { name: 'Intelligent Manufacturing',icon: '🦾' },
  'new-space':                 { name: 'New Space',                icon: '🚀' },
  'advanced-materials':        { name: 'Advanced Materials',       icon: '⚛️' },
};
const ALL_INDUSTRIES = Object.keys(INDUSTRY_META);

const BLANK_FORM: NewsForm = {
  title: '', slug: '', summary: '', content: '',
  source_url: '', source_name: '', author: '', cover_image_url: '',
  industry_slug: 'ai', company_id: '',
  tags: '', is_premium: false, is_published: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── News Drawer ──────────────────────────────────────────────────────────────

function NewsDrawer({
  item,
  onClose,
  onSaved,
}: {
  item: NewsItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<NewsForm>(BLANK_FORM);
  const [loading, setLoading] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) { setForm(BLANK_FORM); setFullLoaded(true); return; }
    fetch(`/api/admin/news/${item.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          title:           d.title ?? '',
          slug:            d.slug ?? '',
          summary:         d.summary ?? '',
          content:         d.content ?? '',
          source_url:      d.source_url ?? '',
          source_name:     d.source_name ?? '',
          author:          d.author ?? '',
          cover_image_url: d.cover_image_url ?? '',
          industry_slug:   d.industry_slug ?? 'ai',
          company_id:      d.company_id ? String(d.company_id) : '',
          tags:            (d.tags ?? []).join(', '),
          is_premium:      d.is_premium ?? false,
          is_published:    d.is_published ?? false,
        });
        setFullLoaded(true);
      });
  }, [item]);

  function set<K extends keyof NewsForm>(k: K, v: NewsForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags:       form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        company_id: form.company_id ? parseInt(form.company_id) : null,
        summary:    form.summary || null,
        content:    form.content || null,
        source_url: form.source_url || null,
        source_name: form.source_name || null,
        author:     form.author || null,
        cover_image_url: form.cover_image_url || null,
      };
      const url    = item ? `/api/admin/news/${item.id}` : '/api/admin/news';
      const method = item ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Something went wrong');
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">
            {item ? 'Edit Article' : 'New Article'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {!fullLoaded ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => { set('title', e.target.value); if (!item) set('slug', slugify(e.target.value)); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Article headline"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => set('slug', slugify(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="url-friendly-slug"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Summary</label>
              <textarea
                rows={3}
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="1–2 sentence summary"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Content</label>
              <textarea
                rows={8}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y"
                placeholder="Full article body…"
              />
            </div>

            {/* Industry + Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Industry *</label>
                <select
                  value={form.industry_slug}
                  onChange={(e) => set('industry_slug', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {ALL_INDUSTRIES.map((s) => (
                    <option key={s} value={s}>{INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Company ID</label>
                <input
                  type="number"
                  value={form.company_id}
                  onChange={(e) => set('company_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Company ID (optional)"
                />
              </div>
            </div>

            {/* Source + Author */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Source Name</label>
                <input
                  value={form.source_name}
                  onChange={(e) => set('source_name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Reuters, Bloomberg…"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Author</label>
                <input
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Source URL</label>
              <input
                type="url"
                value={form.source_url}
                onChange={(e) => set('source_url', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="https://…"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Cover Image URL</label>
              <input
                type="url"
                value={form.cover_image_url}
                onChange={(e) => set('cover_image_url', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="https://…/image.jpg"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                Tags <span className="font-normal text-gray-600">(comma-separated)</span>
              </label>
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="ai, llm, funding"
              />
            </div>

            {/* Premium + Published toggles */}
            <div className="flex gap-4">
              {/* Premium */}
              <div className="flex-1 flex items-center gap-3 py-3 px-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => set('is_premium', !form.is_premium)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_premium ? 'bg-amber-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_premium ? 'translate-x-5' : ''}`} />
                </button>
                <div>
                  <p className="text-sm text-white font-medium">Premium</p>
                  <p className="text-xs text-gray-500">Pro subscribers only</p>
                </div>
              </div>

              {/* Published */}
              <div className="flex-1 flex items-center gap-3 py-3 px-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => set('is_published', !form.is_published)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_published ? 'translate-x-5' : ''}`} />
                </button>
                <div>
                  <p className="text-sm text-white font-medium">Published</p>
                  <p className="text-xs text-gray-500">Visible on site</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2 pb-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                {loading ? 'Saving…' : item ? 'Save Changes' : 'Create Article'}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  item,
  onCancel,
  onDeleted,
}: {
  item: NewsItem;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/news/${item.id}`, { method: 'DELETE' });
    onDeleted();
    onCancel();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Delete Article</h3>
          <p className="text-sm text-gray-400 mb-1">Are you sure you want to delete:</p>
          <p className="text-sm text-white font-medium mb-4 line-clamp-2">{item.title}</p>
          <p className="text-xs text-red-400 mb-5">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition">
              {loading ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  const [drawer, setDrawer] = useState<NewsItem | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<NewsItem | null>(null);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page) });
    if (search)          qs.set('q', search);
    if (industry)        qs.set('industry', industry);
    if (publishedFilter) qs.set('published', publishedFilter);
    const res = await fetch(`/api/admin/news?${qs}`);
    const json = await res.json();
    setItems(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, search, industry, publishedFilter]);

  useEffect(() => { load(); }, [load]);

  // Quick publish toggle
  async function togglePublish(item: NewsItem) {
    await fetch(`/api/admin/news/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    load();
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">News</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} article${total !== 1 ? 's' : ''}` : 'No articles yet'}
          </p>
        </div>
        <button
          onClick={() => setDrawer(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shrink-0"
        >
          <span>+</span> New Article
        </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-gray-800 flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search titles…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-48"
        />
        <select
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Industries</option>
          {ALL_INDUSTRIES.map((s) => (
            <option key={s} value={s}>{INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}</option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => { setPublishedFilter(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        {(search || industry || publishedFilter) && (
          <button
            onClick={() => { setSearch(''); setIndustry(''); setPublishedFilter(''); setPage(1); }}
            className="text-xs text-gray-500 hover:text-white transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p className="text-2xl mb-2">📰</p>
            <p className="text-sm">No articles found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-8 py-3 text-xs text-gray-500 font-medium">Title</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Industry</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Source</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const ind = INDUSTRY_META[item.industry_slug];
                return (
                  <tr key={item.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition group">
                    <td className="px-8 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-blue-300 transition">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-700 font-mono truncate">{item.slug}</p>
                        </div>
                        {item.is_premium && (
                          <span className="shrink-0 text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded mt-0.5">Pro</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-400 text-xs">
                        {ind ? `${ind.icon} ${ind.name}` : item.industry_slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {item.source_name ?? item.author ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition ${
                          item.is_published
                            ? 'bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400'
                            : 'bg-gray-800 text-gray-500 hover:bg-green-900/40 hover:text-green-400'
                        }`}
                        title={item.is_published ? 'Click to unpublish' : 'Click to publish'}
                      >
                        {item.is_published ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {fmtDate(item.published_at ?? item.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDrawer(item)}
                          className="text-xs text-gray-500 hover:text-white transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <a
                          href={`/news/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-blue-400 transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          View
                        </a>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="text-xs text-gray-600 hover:text-red-400 transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-4 border-t border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-500 text-xs">Page {page} of {totalPages} · {total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-xs transition">← Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-xs transition">Next →</button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawer !== undefined && (
        <NewsDrawer item={drawer} onClose={() => setDrawer(undefined)} onSaved={load} />
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <DeleteModal item={deleteItem} onCancel={() => setDeleteItem(null)} onDeleted={load} />
      )}
    </div>
  );
}
