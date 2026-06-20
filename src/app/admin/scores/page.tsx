'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

type Dimension = 'A' | 'M' | 'O' | 'R' | 'F';
type YoyDirection = 'UP' | 'DOWN' | 'FLAT' | '';

interface Metric {
  key: string;
  label: string;
  dimension: Dimension;
}

interface ScoreRow {
  id?: number;
  report_id: number;
  dimension: Dimension;
  metric_key: string;
  score: number | null;         // 1–10, null = not scored
  yoy_direction: YoyDirection;
  qualitative_note: string;
  data_source_tier: 'HIGH' | 'MED' | 'LOW';
  is_data_missing: boolean;
}

interface ReportOption {
  id: number;
  title: string;
  industry_slug: string;
  production_status: string;
  scoring_frozen: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DIMENSIONS: { key: Dimension; label: string; color: string; fullName: string }[] = [
  { key: 'A', label: 'Advancement', fullName: 'Advancement (技术壁垒)', color: '#3b82f6' },
  { key: 'M', label: 'Mastery',     fullName: 'Mastery (人才优势)',      color: '#8b5cf6' },
  { key: 'O', label: 'Operations',  fullName: 'Operations (商业落地)',   color: '#10b981' },
  { key: 'R', label: 'Reach',       fullName: 'Reach (全球化能力)',      color: '#f59e0b' },
  { key: 'F', label: 'Affinity',    fullName: 'Affinity (可持续能力)',   color: '#ef4444' },
];

const DIM_COLOR: Record<Dimension, string> = {
  A: '#3b82f6',
  M: '#8b5cf6',
  O: '#10b981',
  R: '#f59e0b',
  F: '#ef4444',
};

const DIM_BG: Record<Dimension, string> = {
  A: 'bg-blue-900/20 border-blue-800/40',
  M: 'bg-purple-900/20 border-purple-800/40',
  O: 'bg-emerald-900/20 border-emerald-800/40',
  R: 'bg-amber-900/20 border-amber-800/40',
  F: 'bg-red-900/20 border-red-800/40',
};

const DIM_TEXT: Record<Dimension, string> = {
  A: 'text-blue-400',
  M: 'text-purple-400',
  O: 'text-emerald-400',
  R: 'text-amber-400',
  F: 'text-red-400',
};

const TIER_OPTS: ('HIGH' | 'MED' | 'LOW')[] = ['HIGH', 'MED', 'LOW'];
const TIER_COLOR: Record<string, string> = {
  HIGH: 'bg-green-900/40 text-green-400 border-green-700',
  MED:  'bg-gray-800 text-gray-400 border-gray-600',
  LOW:  'bg-red-900/40 text-red-400 border-red-800',
};

// ─── Radar Chart (pure SVG) ────────────────────────────────────────────────

function RadarChart({ scores }: { scores: ScoreRow[] }) {
  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 100;
  const dims = DIMENSIONS;
  const n = dims.length;

  // Average score per dimension (1–10) → normalize to 0–1
  function dimAvg(dim: Dimension): number {
    const rows = scores.filter((s) => s.dimension === dim && s.score !== null && !s.is_data_missing);
    if (rows.length === 0) return 0;
    const avg = rows.reduce((sum, s) => sum + (s.score ?? 0), 0) / rows.length;
    return (avg - 1) / 9; // normalize 1–10 → 0–1
  }

  function polarToXY(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  }

  const angleStep = 360 / n;

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Axis endpoints
  const axes = dims.map((d, i) => ({
    ...d,
    angle: i * angleStep,
    end: polarToXY(i * angleStep, R),
    labelPos: polarToXY(i * angleStep, R + 22),
    value: dimAvg(d.key),
  }));

  // Score polygon
  const polyPts = axes
    .map((a) => {
      const pt = polarToXY(a.angle, a.value * R);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  // Overall score (0–10)
  const overall = dims.reduce((sum, d) => {
    const rows = scores.filter((s) => s.dimension === d.key && s.score !== null && !s.is_data_missing);
    if (rows.length === 0) return sum;
    return sum + rows.reduce((a, s) => a + (s.score ?? 0), 0) / rows.length;
  }, 0) / n;

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} className="overflow-visible">
        {/* Grid rings */}
        {rings.map((r) => {
          const pts = dims
            .map((_, i) => {
              const pt = polarToXY(i * angleStep, r * R);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={r}
              points={pts}
              fill="none"
              stroke="#374151"
              strokeWidth={r === 1.0 ? 1 : 0.5}
              strokeDasharray={r === 1.0 ? undefined : '3,3'}
            />
          );
        })}

        {/* Axes */}
        {axes.map((a) => (
          <line
            key={a.key}
            x1={CX}
            y1={CY}
            x2={a.end.x}
            y2={a.end.y}
            stroke="#374151"
            strokeWidth={0.5}
          />
        ))}

        {/* Score polygon fill */}
        <polygon
          points={polyPts}
          fill="rgba(59,130,246,0.15)"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {axes.map((a) => {
          const pt = polarToXY(a.angle, a.value * R);
          return (
            <circle
              key={a.key}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill={DIM_COLOR[a.key]}
              stroke="#111827"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels */}
        {axes.map((a) => {
          const lp = a.labelPos;
          const score = (a.value * 9 + 1).toFixed(1);
          return (
            <g key={a.key + '-label'}>
              <text
                x={lp.x}
                y={lp.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={600}
                fill={DIM_COLOR[a.key]}
              >
                {a.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="#6b7280"
              >
                {a.value > 0 ? score : '—'}
              </text>
            </g>
          );
        })}

        {/* Ring labels (2.5 / 5.0 / 7.5) */}
        {[0.25, 0.5, 0.75].map((r) => (
          <text
            key={r}
            x={CX + 3}
            y={CY - r * R + 1}
            fontSize={7}
            fill="#4b5563"
            dominantBaseline="middle"
          >
            {(r * 9 + 1).toFixed(0)}
          </text>
        ))}
      </svg>

      {/* Overall score badge */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 mb-1">Overall AMORA Score</p>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {overall > 0 ? overall.toFixed(1) : '—'}
          </span>
          {overall > 0 && <span className="text-gray-500 text-sm">/ 10</span>}
        </div>
      </div>

      {/* Per-dimension mini scores */}
      <div className="mt-4 w-full space-y-1.5">
        {DIMENSIONS.map((d) => {
          const rows = scores.filter((s) => s.dimension === d.key && s.score !== null && !s.is_data_missing);
          const avg = rows.length > 0
            ? rows.reduce((sum, s) => sum + (s.score ?? 0), 0) / rows.length
            : null;
          const pct = avg ? ((avg - 1) / 9) * 100 : 0;
          return (
            <div key={d.key} className="flex items-center gap-2">
              <span className="text-[10px] w-20 text-right shrink-0" style={{ color: DIM_COLOR[d.key] }}>
                {d.label}
              </span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: DIM_COLOR[d.key] }}
                />
              </div>
              <span className="text-[10px] text-gray-500 w-8 text-right">
                {avg ? avg.toFixed(1) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Score Input Row ────────────────────────────────────────────────────────

function MetricRow({
  metric,
  row,
  frozen,
  onChange,
}: {
  metric: Metric;
  row: ScoreRow;
  frozen: boolean;
  onChange: (updates: Partial<ScoreRow>) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);

  function setScore(v: number | null) {
    if (frozen) return;
    onChange({ score: v });
  }

  return (
    <div className={`rounded-lg border px-4 py-3 space-y-2 ${
      row.is_data_missing ? 'opacity-50' : ''
    } ${DIM_BG[metric.dimension]}`}>
      {/* Top row: label + tier + missing toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-300 flex-1 min-w-0 truncate">
          {metric.label}
        </span>

        {/* Data source tier */}
        <div className="flex gap-1">
          {TIER_OPTS.map((t) => (
            <button
              key={t}
              type="button"
              disabled={frozen}
              onClick={() => onChange({ data_source_tier: t })}
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border transition ${
                row.data_source_tier === t
                  ? TIER_COLOR[t]
                  : 'bg-transparent text-gray-700 border-gray-800 hover:border-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Missing data toggle */}
        <button
          type="button"
          disabled={frozen}
          onClick={() => onChange({ is_data_missing: !row.is_data_missing })}
          title={row.is_data_missing ? 'Mark data available' : 'Mark data missing'}
          className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
            row.is_data_missing
              ? 'bg-red-900/40 text-red-400 border-red-800'
              : 'bg-transparent text-gray-700 border-gray-800 hover:border-gray-600'
          }`}
        >
          N/A
        </button>
      </div>

      {/* Score slider + value */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          disabled={frozen || row.is_data_missing}
          value={row.score ?? 5}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          className="flex-1 h-1.5 accent-blue-500"
        />
        <input
          type="number"
          min={1}
          max={10}
          step={0.5}
          disabled={frozen || row.is_data_missing}
          value={row.score ?? ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= 10) setScore(v);
          }}
          className="w-14 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500"
          placeholder="—"
        />

        {/* Score colour chip */}
        {row.score !== null && !row.is_data_missing && (
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              backgroundColor:
                row.score >= 8 ? '#10b981' :
                row.score >= 6 ? '#3b82f6' :
                row.score >= 4 ? '#f59e0b' : '#ef4444',
            }}
          >
            {row.score.toFixed(0)}
          </span>
        )}

        {/* YoY direction */}
        <div className="flex gap-0.5">
          {(['UP', 'FLAT', 'DOWN'] as YoyDirection[]).map((dir) => (
            <button
              key={dir}
              type="button"
              disabled={frozen}
              onClick={() => onChange({ yoy_direction: row.yoy_direction === dir ? '' : dir })}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center border transition ${
                row.yoy_direction === dir
                  ? dir === 'UP'   ? 'bg-emerald-900/60 text-emerald-400 border-emerald-700'
                  : dir === 'DOWN' ? 'bg-red-900/60 text-red-400 border-red-700'
                  :                  'bg-gray-700 text-gray-300 border-gray-500'
                  : 'bg-transparent text-gray-700 border-gray-800 hover:border-gray-600'
              }`}
            >
              {dir === 'UP' ? '↑' : dir === 'DOWN' ? '↓' : '→'}
            </button>
          ))}
        </div>

        {/* Note toggle */}
        <button
          type="button"
          onClick={() => setNoteOpen((o) => !o)}
          className={`text-xs px-1.5 py-0.5 rounded border transition ${
            row.qualitative_note
              ? 'text-blue-400 border-blue-700 bg-blue-900/20'
              : 'text-gray-700 border-gray-800 hover:border-gray-600 hover:text-gray-400'
          }`}
        >
          {noteOpen ? '▾' : '✎'}
        </button>
      </div>

      {/* Qualitative note (collapsible) */}
      {noteOpen && (
        <textarea
          rows={2}
          disabled={frozen}
          value={row.qualitative_note}
          onChange={(e) => onChange({ qualitative_note: e.target.value })}
          maxLength={200}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Qualitative note (max 200 chars)…"
        />
      )}
    </div>
  );
}

// ─── Dimension Card ─────────────────────────────────────────────────────────

function DimensionCard({
  dim,
  metrics,
  scores,
  frozen,
  onChange,
}: {
  dim: typeof DIMENSIONS[number];
  metrics: Metric[];
  scores: ScoreRow[];
  frozen: boolean;
  onChange: (key: string, updates: Partial<ScoreRow>) => void;
}) {
  const [open, setOpen] = useState(true);

  const dimRows = scores.filter((s) => s.dimension === dim.key);
  const scored = dimRows.filter((s) => s.score !== null && !s.is_data_missing);
  const avg = scored.length > 0
    ? scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length
    : null;

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      {/* Dimension header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800/80 transition text-left"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: DIM_COLOR[dim.key] }}
        />
        <span className={`text-sm font-semibold ${DIM_TEXT[dim.key]}`}>{dim.fullName}</span>
        <div className="flex-1" />

        {/* Avg score pill */}
        {avg !== null && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${DIM_COLOR[dim.key]}22`,
              color: DIM_COLOR[dim.key],
            }}
          >
            avg {avg.toFixed(1)}
          </span>
        )}

        <span className="text-gray-600 text-xs">
          {scored.length}/{metrics.length} scored
        </span>
        <span className="text-gray-600 text-sm">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-3 py-3 space-y-2 bg-gray-900/30">
          {metrics.map((m) => {
            const row = dimRows.find((s) => s.metric_key === m.key);
            if (!row) return null;
            return (
              <MetricRow
                key={m.key}
                metric={m}
                row={row}
                frozen={frozen}
                onChange={(upd) => onChange(m.key, upd)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Report Picker ─────────────────────────────────────────────────────────

function ReportPicker({
  reports,
  selectedId,
  onSelect,
}: {
  reports: ReportOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex items-center gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search reports…"
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-52"
      />
      <select
        value={selectedId ?? ''}
        onChange={(e) => onSelect(parseInt(e.target.value))}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 max-w-xs"
      >
        <option value="">— Select a report —</option>
        {filtered.map((r) => (
          <option key={r.id} value={r.id}>
            [{r.production_status}] {r.title}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Empty state helper ─────────────────────────────────────────────────────

function makeBlankScores(reportId: number, metrics: Metric[]): ScoreRow[] {
  return metrics.map((m) => ({
    report_id: reportId,
    dimension: m.dimension,
    metric_key: m.key,
    score: null,
    yoy_direction: '',
    qualitative_note: '',
    data_source_tier: 'MED',
    is_data_missing: false,
  }));
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function ScoresPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reports, setReports] = useState<ReportOption[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);

  const [selectedId, setSelectedId] = useState<number | null>(
    searchParams.get('report_id') ? parseInt(searchParams.get('report_id')!) : null
  );
  const [frozen, setFrozen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loadingScores, setLoadingScores] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load reports list
  useEffect(() => {
    fetch('/api/admin/reports?page=1&limit=200')
      .then((r) => r.json())
      .then((json) => setReports(json.data ?? []));
  }, []);

  // Load metrics definition once
  useEffect(() => {
    fetch('/api/admin/scores?report_id=0')
      .then((r) => r.json())
      .then((json) => {
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch(() => {});
  }, []);

  // Load scores for selected report
  const loadScores = useCallback(async (reportId: number) => {
    setLoadingScores(true);
    setError('');
    const res = await fetch(`/api/admin/scores?report_id=${reportId}`);
    const json = await res.json();

    const allMetrics: Metric[] = json.metrics ?? metrics;
    if (allMetrics.length > 0 && metrics.length === 0) setMetrics(allMetrics);

    const existing: Record<string, ScoreRow> = {};
    (json.data ?? []).forEach((r: ScoreRow) => {
      existing[r.metric_key] = r;
    });

    const merged: ScoreRow[] = allMetrics.map((m: Metric) => ({
      ...{
        report_id: reportId,
        dimension: m.dimension,
        metric_key: m.key,
        score: null,
        yoy_direction: '' as YoyDirection,
        qualitative_note: '',
        data_source_tier: 'MED' as const,
        is_data_missing: false,
      },
      ...(existing[m.key] ?? {}),
    }));

    setScores(merged);
    setLoadingScores(false);
  }, [metrics]);

  useEffect(() => {
    if (!selectedId) return;
    const rep = reports.find((r) => r.id === selectedId);
    setFrozen(rep?.scoring_frozen ?? false);
    loadScores(selectedId);
  }, [selectedId, reports, loadScores]);

  function handleSelect(id: number) {
    setSelectedId(id);
    router.replace(`/admin/scores?report_id=${id}`, { scroll: false });
  }

  function updateScore(metricKey: string, updates: Partial<ScoreRow>) {
    if (frozen) return;
    setScores((prev) =>
      prev.map((s) => (s.metric_key === metricKey ? { ...s, ...updates } : s))
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!selectedId || frozen) return;
    setSaving(true);
    setError('');
    try {
      // Only send rows that have been touched (score set or is_data_missing true)
      const payload = scores
        .filter((s) => s.score !== null || s.is_data_missing)
        .map((s) => ({
          report_id: s.report_id,
          dimension: s.dimension,
          metric_key: s.metric_key,
          score: s.score,
          yoy_direction: s.yoy_direction || null,
          qualitative_note: s.qualitative_note || null,
          data_source_tier: s.data_source_tier,
          is_data_missing: s.is_data_missing,
        }));

      if (payload.length === 0) {
        setError('No scores to save yet — set at least one score first.');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Save failed');
        return;
      }

      setSaved(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  // Completion stats
  const totalMetrics = scores.length;
  const scoredCount = scores.filter((s) => s.score !== null || s.is_data_missing).length;
  const completionPct = totalMetrics > 0 ? Math.round((scoredCount / totalMetrics) * 100) : 0;

  const selectedReport = reports.find((r) => r.id === selectedId);

  return (
    <div className="h-full flex flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Scores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AMORA 5-dimension · 25 metric scoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReportPicker
            reports={reports}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {!selectedId ? (
        /* No report selected */
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">Select a report to start scoring</p>
        </div>
      ) : loadingScores ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Loading scores…
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* ── Left: Scoring cards ──────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Report header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {selectedReport?.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedReport?.industry_slug} · {selectedReport?.production_status}
                  {frozen && (
                    <span className="ml-2 text-blue-400">🔒 Scoring frozen</span>
                  )}
                </p>
              </div>

              {/* Completion bar */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-28 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${completionPct}%`,
                      backgroundColor: completionPct === 100 ? '#10b981' : '#3b82f6',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {scoredCount}/{totalMetrics}
                </span>
              </div>
            </div>

            {/* Dimension cards */}
            {DIMENSIONS.map((dim) => {
              const dimMetrics = metrics.filter((m) => m.dimension === dim.key);
              return (
                <DimensionCard
                  key={dim.key}
                  dim={dim}
                  metrics={dimMetrics}
                  scores={scores}
                  frozen={frozen}
                  onChange={updateScore}
                />
              );
            })}

            {/* Save bar */}
            <div className="sticky bottom-0 pb-4 pt-2">
              <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-4">
                {error && (
                  <p className="text-xs text-red-400 flex-1">{error}</p>
                )}
                {saved && !error && (
                  <p className="text-xs text-emerald-400 flex-1">✓ Saved successfully</p>
                )}
                {!saved && !error && (
                  <p className="text-xs text-gray-500 flex-1">
                    {scoredCount > 0
                      ? `${scoredCount} metric${scoredCount !== 1 ? 's' : ''} ready to save`
                      : 'Start scoring to enable save'}
                  </p>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || frozen || scoredCount === 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-lg text-sm transition shrink-0"
                >
                  {saving ? 'Saving…' : frozen ? '🔒 Frozen' : 'Save Scores'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Radar chart sidebar ───────────────────────────────── */}
          <div className="w-72 shrink-0 border-l border-gray-800 overflow-y-auto px-5 py-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Live Preview
            </p>
            <RadarChart scores={scores} />

            {/* Metric key reference */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Score Guide
              </p>
              <div className="space-y-1">
                {[
                  { range: '8–10', label: 'Top-tier',  color: '#10b981' },
                  { range: '6–7',  label: 'Strong',     color: '#3b82f6' },
                  { range: '4–5',  label: 'Average',    color: '#f59e0b' },
                  { range: '1–3',  label: 'Weak',       color: '#ef4444' },
                ].map((g) => (
                  <div key={g.range} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="text-xs text-gray-400">
                      <span className="font-mono">{g.range}</span>
                      <span className="text-gray-600 ml-1">— {g.label}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-2">Data Source Tier</p>
                {TIER_OPTS.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${TIER_COLOR[t]}`}>
                      {t}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t === 'HIGH' ? 'Official / audited data' : t === 'MED' ? 'Credible 3rd-party' : 'Estimated / unverified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function ScoresPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm h-screen">
        Loading…
      </div>
    }>
      <ScoresPageInner />
    </Suspense>
  );
}
