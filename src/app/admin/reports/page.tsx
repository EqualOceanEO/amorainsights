'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductionStatus =
  | 'draft'
  | 'data_collected'
  | 'review_1'
  | 'review_2'
  | 'review_3'
  | 'published';

type ReportType = 'flagship' | 'standard' | 'brief';
type ReportFormat = 'markdown' | 'html' | 'h5_embed';

interface AdminReport {
  report_format?: ReportFormat;
  id: number;
  title: string;
  slug: string;
  industry_slug: string;
  is_premium: boolean;
  report_type: ReportType;
  report_level: number;
  overall_grade: string | null;
  production_status: ProductionStatus;
  scoring_frozen: boolean;
  data_cutoff_date: string | null;
  published_at: string | null;
  created_at: string;
  word_count: number | null;
}

interface FormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  html_content: string;       // for h5/html format
  report_format: ReportFormat; // markdown | html | h5_embed
  industry_slug: string;
  is_premium: boolean;
  author: string;
  tags: string;
  report_type: ReportType;
  report_level: number;
  overall_grade: string;
  word_count: string;
  production_status: ProductionStatus;
  data_cutoff_date: string;
  scoring_frozen: boolean;
  compliance_tier: string;
  tech_domain: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCTION_STATUS_META: Record<
  ProductionStatus,
  { label: string; color: string; next: ProductionStatus | null }
> = {
  draft:          { label: 'Draft',          color: 'gray',   next: 'data_collected' },
  data_collected: { label: 'Data Collected', color: 'blue',   next: 'review_1' },
  review_1:       { label: 'Review 1',       color: 'amber',  next: 'review_2' },
  review_2:       { label: 'Review 2',       color: 'orange', next: 'review_3' },
  review_3:       { label: 'Review 3',       color: 'purple', next: 'published' },
  published:      { label: 'Published',      color: 'green',  next: null },
};

const STATUS_COLOR: Record<string, string> = {
  gray:   'bg-gray-800 text-gray-400',
  blue:   'bg-blue-900/40 text-blue-400',
  amber:  'bg-amber-900/40 text-amber-400',
  orange: 'bg-orange-900/40 text-orange-400',
  purple: 'bg-purple-900/40 text-purple-400',
  green:  'bg-green-900/40 text-green-400',
};

const INDUSTRY_META: Record<string, { name: string; icon: string }> = {
  'ai':                        { name: 'AI',                       icon: '🤖' },
  'life-sciences':             { name: 'Life Sciences',            icon: '🧬' },
  'green-tech':                { name: 'Green Tech',               icon: '⚡' },
  'manufacturing':             { name: 'Manufacturing',            icon: '🦾' },
  'new-space':                 { name: 'New Space',                icon: '🚀' },
  'advanced-materials':        { name: 'Advanced Materials',       icon: '⚛️' },
};

const ALL_INDUSTRIES = Object.keys(INDUSTRY_META);

const REPORT_TYPES: ReportType[] = ['flagship', 'standard', 'brief'];

const BLANK_FORM: FormData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  html_content: '',
  report_format: 'markdown',
  industry_slug: 'ai',
  is_premium: false,
  author: '',
  tags: '',
  report_type: 'standard',
  report_level: 2,
  overall_grade: '',
  word_count: '',
  production_status: 'draft',
  data_cutoff_date: '',
  scoring_frozen: false,
  compliance_tier: 'STANDARD',
  tech_domain: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProductionStatus }) {
  const meta = PRODUCTION_STATUS_META[status];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[meta.color]}`}>
      {meta.label}
    </span>
  );
}

// ─── Status Flow Stepper ──────────────────────────────────────────────────────

function StatusStepper({
  current,
  onChange,
}: {
  current: ProductionStatus;
  onChange: (s: ProductionStatus) => void;
}) {
  const steps: ProductionStatus[] = [
    'draft', 'data_collected', 'review_1', 'review_2', 'review_3', 'published',
  ];
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => {
        const meta = PRODUCTION_STATUS_META[step];
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
              active
                ? `${STATUS_COLOR[meta.color]} border-current`
                : done
                ? 'bg-gray-800 text-gray-400 border-gray-700'
                : 'bg-gray-900 text-gray-600 border-gray-800 hover:border-gray-600'
            }`}
          >
            {done && <span>✓</span>}
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Report Form Drawer ───────────────────────────────────────────────────────

function ReportDrawer({
  report,
  onClose,
  onSaved,
}: {
  report: AdminReport | null; // null = new
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormData>(() => {
    if (!report) return BLANK_FORM;
    return {
      title: report.title,
      slug: report.slug,
      summary: '',
      content: '',
      html_content: '',
      report_format: 'markdown',
      industry_slug: report.industry_slug,
      is_premium: report.is_premium,
      author: '',
      tags: '',
      report_type: report.report_type,
      report_level: report.report_level,
      overall_grade: report.overall_grade ?? '',
      word_count: report.word_count ? String(report.word_count) : '',
      production_status: report.production_status,
      data_cutoff_date: report.data_cutoff_date ?? '',
      scoring_frozen: report.scoring_frozen,
      compliance_tier: 'STANDARD',
      tech_domain: '',
    };
  });

  const [loading, setLoading] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [error, setError] = useState('');
  const [uploadingH5, setUploadingH5] = useState(false);
  const [h5FileName, setH5FileName] = useState<string>('');

  // Load full report data when editing
  useEffect(() => {
    if (!report) { setFullLoaded(true); return; }
    fetch(`/api/admin/reports/${report.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          summary: data.summary ?? '',
          content: data.content ?? '',
          html_content: data.html_content ?? '',
          report_format: data.report_format ?? 'markdown',
          industry_slug: data.industry_slug ?? 'ai',
          is_premium: data.is_premium ?? false,
          author: data.author ?? '',
          tags: (data.tags ?? []).join(', '),
          report_type: data.report_type ?? 'standard',
          report_level: data.report_level ?? 2,
          overall_grade: data.overall_grade ?? '',
          word_count: data.word_count ? String(data.word_count) : '',
          production_status: data.production_status ?? 'draft',
          data_cutoff_date: data.data_cutoff_date ?? '',
          scoring_frozen: data.scoring_frozen ?? false,
          compliance_tier: data.compliance_tier ?? 'STANDARD',
          tech_domain: data.tech_domain ?? '',
        });
        setFullLoaded(true);
      });
  }, [report]);

  function set(field: keyof FormData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        word_count: form.word_count ? parseInt(form.word_count) : null,
        overall_grade: form.overall_grade || null,
        data_cutoff_date: form.data_cutoff_date || null,
        tech_domain: form.tech_domain || null,
        author: form.author || null,
        content: form.content || null,
        html_content: form.html_content || null,
      };
      const url  = report ? `/api/admin/reports/${report.id}` : '/api/admin/reports';
      const method = report ? 'PATCH' : 'POST';
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

  // Upload H5 .html file and populate html_content
  async function handleH5Upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingH5(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/reports', { method: 'PUT', body: fd });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Upload failed');
        return;
      }
      const json = await res.json();
      set('html_content', json.html_content);
      set('report_format', 'html');
      setH5FileName(file.name);
    } catch {
      setError('Upload error');
    } finally {
      setUploadingH5(false);
      // Reset input so same file can be re-uploaded
      e.target.value = '';
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">
            {report ? 'Edit Report' : 'New Report'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {!fullLoaded ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!report) set('slug', slugify(e.target.value));
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Report title"
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
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                Summary * <span className="text-gray-600 font-normal">(public teaser)</span>
              </label>
              <textarea
                required
                rows={3}
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="1–2 sentences shown in the card and free preview"
              />
            </div>

            {/* Report Format Selector */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Report Format</label>
              <div className="flex gap-2">
                {(['markdown', 'html'] as ReportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => set('report_format', fmt)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                      form.report_format === fmt
                        ? fmt === 'html'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {fmt === 'html' ? '🌐 H5 / HTML' : '📝 Markdown'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content — conditional on format */}
            {form.report_format === 'markdown' ? (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Full Content <span className="text-gray-600 font-normal">(Markdown, paid-wall)</span>
                </label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y font-mono"
                  placeholder="Full report content in Markdown…"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  H5 Report File <span className="text-gray-600 font-normal">(.html, max 10 MB)</span>
                </label>
                {/* Drop zone / upload button */}
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  form.html_content
                    ? 'border-purple-600 bg-purple-900/10'
                    : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'
                }`}>
                  <input
                    type="file"
                    accept=".html,text/html"
                    className="hidden"
                    onChange={handleH5Upload}
                    disabled={uploadingH5}
                  />
                  {uploadingH5 ? (
                    <span className="text-sm text-gray-400 animate-pulse">Uploading…</span>
                  ) : form.html_content ? (
                    <div className="text-center">
                      <span className="text-2xl block mb-1">✅</span>
                      <span className="text-xs text-purple-300 font-mono">{h5FileName || 'HTML loaded'}</span>
                      <span className="text-xs text-gray-600 block mt-0.5">
                        {(form.html_content.length / 1024).toFixed(0)} KB · Click to replace
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl block mb-1">📂</span>
                      <span className="text-sm text-gray-400">Click to upload .html file</span>
                      <span className="text-xs text-gray-600 block mt-0.5">or drag & drop</span>
                    </div>
                  )}
                </label>
                {form.html_content && (
                  <p className="mt-1.5 text-xs text-gray-600">
                    This report will be rendered in a sandboxed iframe on the front end.
                  </p>
                )}
              </div>
            )}

            {/* Row: Industry + Premium */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Industry *</label>
                <select
                  value={form.industry_slug}
                  onChange={(e) => set('industry_slug', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {ALL_INDUSTRIES.map((s) => (
                    <option key={s} value={s}>
                      {INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Access</label>
                <div className="flex gap-2 mt-1">
                  {[false, true].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => set('is_premium', v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                        form.is_premium === v
                          ? v
                            ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                            : 'bg-green-600/20 border-green-500 text-green-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500'
                      }`}
                    >
                      {v ? '⭐ Premium' : '🔓 Free'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row: Type + Level + Grade */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Report Type</label>
                <select
                  value={form.report_type}
                  onChange={(e) => set('report_type', e.target.value as ReportType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Level</label>
                <select
                  value={form.report_level}
                  onChange={(e) => set('report_level', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>L1 — Brief</option>
                  <option value={2}>L2 — Standard</option>
                  <option value={3}>L3 — Flagship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Grade</label>
                <select
                  value={form.overall_grade}
                  onChange={(e) => set('overall_grade', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">—</option>
                  {['A', 'B', 'C', 'D'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Author + Word Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Author</label>
                <input
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="AMORA Research"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Word Count</label>
                <input
                  type="number"
                  value={form.word_count}
                  onChange={(e) => set('word_count', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="8000"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                Tags <span className="text-gray-600 font-normal">(comma-separated)</span>
              </label>
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="ai, llm, foundation-models"
              />
            </div>

            {/* Row: Data Cutoff + Compliance Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Data Cutoff Date <span className="text-gray-600 font-normal">(CLO required)</span>
                </label>
                <input
                  type="date"
                  value={form.data_cutoff_date}
                  onChange={(e) => set('data_cutoff_date', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Compliance Tier</label>
                <select
                  value={form.compliance_tier}
                  onChange={(e) => set('compliance_tier', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="SENSITIVE_TECH">Sensitive Tech</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>
            </div>

            {/* Production Status */}
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">Production Status</label>
              <StatusStepper
                current={form.production_status}
                onChange={(s) => set('production_status', s)}
              />
            </div>

            {/* Scoring Frozen */}
            <div className="flex items-center gap-3 py-3 px-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => set('scoring_frozen', !form.scoring_frozen)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  form.scoring_frozen ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    form.scoring_frozen ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-white font-medium">Scoring Frozen</p>
                <p className="text-xs text-gray-500">Lock scoring schema after first two reports are calibrated</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                {loading ? 'Saving…' : report ? 'Save Changes' : 'Create Report'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  report,
  onCancel,
  onDeleted,
}: {
  report: AdminReport;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/reports/${report.id}`, { method: 'DELETE' });
    onDeleted();
    onCancel();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-base font-semibold text-white mb-2">Delete Report</h3>
          <p className="text-sm text-gray-400 mb-1">
            Are you sure you want to delete:
          </p>
          <p className="text-sm text-white font-medium mb-4 line-clamp-2">{report.title}</p>
          <p className="text-xs text-red-400 mb-5">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // UI state
  const [drawerReport, setDrawerReport] = useState<AdminReport | null | undefined>(undefined); // undefined = closed
  const [deleteReport, setDeleteReport] = useState<AdminReport | null>(null);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(page),
      ...(search ? { search } : {}),
      ...(industryFilter ? { industry: industryFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    const res = await fetch(`/api/admin/reports?${qs}`);
    const json = await res.json();
    setReports(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, search, industryFilter, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Advance status in-line (quick action)
  async function advanceStatus(r: AdminReport) {
    const next = PRODUCTION_STATUS_META[r.production_status].next;
    if (!next) return;
    await fetch(`/api/admin/reports/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ production_status: next }),
    });
    fetchReports();
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} report${total !== 1 ? 's' : ''}` : 'No reports yet'}
          </p>
        </div>
        <button
          onClick={() => setDrawerReport(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shrink-0"
        >
          <span className="text-base leading-none">+</span> New Report
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="px-8 py-4 border-b border-gray-800 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search titles…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-52"
        />

        {/* Industry */}
        <select
          value={industryFilter}
          onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Industries</option>
          {ALL_INDUSTRIES.map((s) => (
            <option key={s} value={s}>{INDUSTRY_META[s].icon} {INDUSTRY_META[s].name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {(Object.keys(PRODUCTION_STATUS_META) as ProductionStatus[]).map((s) => (
            <option key={s} value={s}>{PRODUCTION_STATUS_META[s].label}</option>
          ))}
        </select>

        {(search || industryFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setIndustryFilter(''); setStatusFilter(''); setPage(1); }}
            className="text-xs text-gray-500 hover:text-white transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm">No reports found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-8 py-3 text-xs text-gray-500 font-medium">Title</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Industry</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Grade</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Created</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const ind = INDUSTRY_META[r.industry_slug];
                const statusMeta = PRODUCTION_STATUS_META[r.production_status];
                const hasNext = !!statusMeta.next;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-800/60 hover:bg-gray-800/30 transition group"
                  >
                    {/* Title */}
                    <td className="px-8 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-blue-300 transition">
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-600 font-mono truncate">{r.slug}</p>
                        </div>
                        <div className="flex gap-1 shrink-0 mt-0.5">
                          {r.is_premium && (
                            <span className="text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded">Pro</span>
                          )}
                          {r.scoring_frozen && (
                            <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded" title="Scoring frozen">🔒</span>
                          )}
                          {(r.report_format === 'html' || r.report_format === 'h5_embed') && (
                            <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded" title="H5 HTML report">H5</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-400 text-xs">
                        {ind ? `${ind.icon} ${ind.name}` : r.industry_slug}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-500 text-xs capitalize">{r.report_type}</span>
                      <span className="ml-1 text-gray-700 text-xs">L{r.report_level}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.production_status} />
                        {hasNext && (
                          <button
                            onClick={() => advanceStatus(r)}
                            className="text-xs text-gray-600 hover:text-blue-400 transition"
                            title={`Advance to ${PRODUCTION_STATUS_META[statusMeta.next!].label}`}
                          >
                            →
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3">
                      {r.overall_grade ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-sm ${
                          r.overall_grade === 'A' ? 'bg-green-900/40 text-green-400' :
                          r.overall_grade === 'B' ? 'bg-blue-900/40 text-blue-400' :
                          r.overall_grade === 'C' ? 'bg-amber-900/40 text-amber-400' :
                          'bg-red-900/40 text-red-400'
                        }`}>
                          {r.overall_grade}
                        </span>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {fmtDate(r.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDrawerReport(r)}
                          className="text-xs text-gray-500 hover:text-white transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/admin/scores?report_id=${r.id}`}
                          className="text-xs text-gray-500 hover:text-blue-400 transition px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Scores
                        </Link>
                        <button
                          onClick={() => setDeleteReport(r)}
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

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="px-8 py-4 border-t border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-500 text-xs">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-xs transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-xs transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Drawer ────────────────────────────────────────────────────────── */}
      {drawerReport !== undefined && (
        <ReportDrawer
          report={drawerReport}
          onClose={() => setDrawerReport(undefined)}
          onSaved={fetchReports}
        />
      )}

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      {deleteReport && (
        <DeleteModal
          report={deleteReport}
          onCancel={() => setDeleteReport(null)}
          onDeleted={fetchReports}
        />
      )}
    </div>
  );
}
