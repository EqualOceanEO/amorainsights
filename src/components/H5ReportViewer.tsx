'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/db';
import type { SubscriptionTier } from '@/components/ChartBlock';

// ── Chapter Definitions ───────────────────────────────────────────────────────

interface ChapterMeta {
  key: string;
  label: string;
  label_cn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  order: number;
  free: boolean;
  badge: string;
  tagline: string;       // short description shown on divider
  accentGradient: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    key: 'm',
    label: 'Mapping',
    label_cn: '产业链生态',
    color: '#00d4ff',
    bgColor: 'rgba(0,212,255,0.08)',
    borderColor: 'rgba(0,212,255,0.3)',
    accentGradient: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    order: 1,
    free: true,
    badge: 'FREE',
    tagline: '中美产业链全景 · 卡脖子清单 · 供应链时间线',
  },
  {
    key: 'a',
    label: 'Advancement',
    label_cn: '技术先进性',
    color: '#ff006e',
    bgColor: 'rgba(255,0,110,0.08)',
    borderColor: 'rgba(255,0,110,0.3)',
    accentGradient: 'linear-gradient(135deg, #ff006e 0%, #cc0057 100%)',
    order: 2,
    free: false,
    badge: 'PRO',
    tagline: '世界模型 · 端到端控制 · 硬件代际演进',
  },
  {
    key: 'o',
    label: 'Operations',
    label_cn: '商业化运营',
    color: '#06d6a0',
    bgColor: 'rgba(6,214,160,0.08)',
    borderColor: 'rgba(6,214,160,0.3)',
    accentGradient: 'linear-gradient(135deg, #06d6a0 0%, #05a882 100%)',
    order: 3,
    free: false,
    badge: 'PRO',
    tagline: '四大应用场景 · 客户结构真相 · ROI 评估',
  },
  {
    key: 'r',
    label: 'Reach',
    label_cn: '市场容量',
    color: '#ffbe0b',
    bgColor: 'rgba(255,190,11,0.08)',
    borderColor: 'rgba(255,190,11,0.3)',
    accentGradient: 'linear-gradient(135deg, #ffbe0b 0%, #e5a800 100%)',
    order: 4,
    free: false,
    badge: 'PRO',
    tagline: '三情景预测 · 2035 规模测算 · 全球化策略',
  },
  {
    key: 'a2',
    label: 'Assets',
    label_cn: '资本价值',
    color: '#9775fa',
    bgColor: 'rgba(151,117,250,0.08)',
    borderColor: 'rgba(151,117,250,0.3)',
    accentGradient: 'linear-gradient(135deg, #9775fa 0%, #7c5ce4 100%)',
    order: 5,
    free: false,
    badge: 'PRO',
    tagline: '核心财务对比 · 估值矩阵 · AMORA 评分卡',
  },
];

// ── Parsing ───────────────────────────────────────────────────────────────────

interface ParsedChapter {
  bodyHTML: string;
  cssText: string;
}

function parseChapterHTML(fullHTML: string): ParsedChapter {
  const styleMatches = fullHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const cssText = styleMatches.map((s) => s.replace(/<\/?style[^>]*>/gi, '')).join('\n');
  const bodyMatch = fullHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHTML = bodyMatch ? bodyMatch[1] : fullHTML;
  if (!bodyMatch) {
    bodyHTML = fullHTML
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head\b[\s\S]*?<\/head>/i, '')
      .replace(/<body[^>]*>/i, '')
      .replace(/<\/body>/i, '');
  }
  return { bodyHTML: bodyHTML.trim(), cssText };
}

// ── Chapter Divider ───────────────────────────────────────────────────────────

function ChapterDivider({ chapter, index }: { chapter: ChapterMeta; index: number }) {
  return (
    <div
      id={`chapter-${chapter.key}`}
      className="chapter-divider"
      data-chapter-key={chapter.key}
    >
      {/* Decorative top line */}
      <div
        className="h-px w-full mb-0"
        style={{ background: chapter.accentGradient }}
      />
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-5">
        {/* Chapter letter badge */}
        <div
          className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black"
          style={{
            background: chapter.bgColor,
            border: `1px solid ${chapter.borderColor}`,
            color: chapter.color,
            fontSize: 28,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 28 }}>{chapter.key.toUpperCase()}</span>
        </div>

        {/* Chapter info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded font-mono"
              style={{
                background: chapter.bgColor,
                color: chapter.color,
                border: `1px solid ${chapter.borderColor}`,
              }}
            >
              Part {index + 1}
            </span>
            <span className="font-bold text-white text-base">{chapter.label}</span>
            <span className="text-gray-500 text-sm">{chapter.label_cn}</span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                background: chapter.free ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                color: chapter.free ? '#22c55e' : '#fbbf24',
              }}
            >
              {chapter.badge}
            </span>
          </div>
          <p className="text-gray-500 text-xs">{chapter.tagline}</p>
        </div>
      </div>
    </div>
  );
}

// ── Locked Chapter Overlay ────────────────────────────────────────────────────

function LockedOverlay({ chapter }: { chapter: ChapterMeta }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        minHeight: 400,
        background: chapter.bgColor,
        border: `1px solid ${chapter.borderColor}`,
        borderRadius: 12,
      }}
    >
      {/* Blurred preview background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

      {/* Lock content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-20 px-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{
            background: chapter.bgColor,
            border: `1px solid ${chapter.borderColor}`,
            color: chapter.color,
          }}
        >
          🔐
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: chapter.color }}
        >
          Part {chapter.order}: {chapter.label} — PRO Exclusive
        </h3>
        <p className="text-gray-400 text-sm mb-2 max-w-sm">
          {chapter.tagline}
        </p>
        <p className="text-gray-600 text-xs mb-6">
          Upgrade to AMORA Pro to unlock all 5 chapters
        </p>
        <Link
          href="/pricing"
          className="inline-block text-sm font-semibold px-6 py-2.5 rounded-xl text-white transition hover:opacity-90"
          style={{ background: chapter.accentGradient }}
        >
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  );
}

// ── Chapter Content ────────────────────────────────────────────────────────────

function ChapterContentSection({
  chapter,
  content,
  isPremium,
}: {
  chapter: ChapterMeta;
  content: ParsedChapter;
  isPremium: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleIdRef = useRef<string>('');

  // Inject styles
  useEffect(() => {
    const styleId = `hri-style-${chapter.key}`;
    styleIdRef.current = styleId;
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = content.cssText;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [content.cssText, chapter.key]);

  // Anti-copy for premium
  useEffect(() => {
    if (!isPremium) return;
    const el = containerRef.current;
    if (!el) return;

    const prevent = (e: Event) => e.preventDefault();
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'a', 'p', 's', 'u'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key === 'F12') e.preventDefault();
    };

    el.addEventListener('contextmenu', prevent);
    el.addEventListener('selectstart', (e) => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 200) {
        e.preventDefault();
      }
    });
    document.addEventListener('keydown', handler);

    return () => {
      el.removeEventListener('contextmenu', prevent);
      document.removeEventListener('keydown', handler);
    };
  }, [isPremium]);

  return (
    <div
      ref={containerRef}
      className="chapter-content"
      style={{ userSelect: isPremium ? 'none' : 'auto' }}
      dangerouslySetInnerHTML={{ __html: content.bodyHTML }}
    />
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#00d4ff transparent transparent transparent' }}
        />
        <span className="text-gray-500 text-sm">Loading report...</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
}

export default function H5ReportViewer({ report, hasAccess }: Props) {
  const [contents, setContents] = useState<Record<string, ParsedChapter>>({});
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string>('m');
  const [headerVisible, setHeaderVisible] = useState(true);

  const isPro = hasAccess;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch all chapter HTML ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all(
      CHAPTERS.map((ch) =>
        fetch(`/api/hri-chapters/${ch.key}`)
          .then((r) => r.text())
          .then((html) => ({ key: ch.key, html }))
          .catch(() => ({ key: ch.key, html: '' }))
      )
    ).then((results) => {
      const parsed: Record<string, ParsedChapter> = {};
      for (const { key, html } of results) {
        if (html) parsed[key] = parseChapterHTML(html);
      }
      setContents(parsed);
      setLoading(false);
    });
  }, []);

  // ── IntersectionObserver — track which chapter is visible ──────────────
  useEffect(() => {
    if (loading) return;

    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible chapter
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const key = (visible[0].target as HTMLElement).dataset.chapterKey;
          if (key) setActiveChapter(key);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    // Observe chapter dividers
    CHAPTERS.forEach((ch) => {
      const el = document.getElementById(`chapter-${ch.key}`);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-black">
        <div style={{ height: 52 }} />
        <ReportSkeleton />
      </div>
    );
  }

  const currentChapterMeta = CHAPTERS.find((c) => c.key === activeChapter) || CHAPTERS[0];

  return (
    <div className="flex flex-col flex-1 bg-black" ref={scrollRef}>
      {/* ── Sticky Top Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/60">
        <div className="flex items-center h-12 px-4 gap-3 max-w-7xl mx-auto">
          {/* Back */}
          <Link
            href="/reports"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition shrink-0"
          >
            <span>←</span>
            <span className="hidden sm:inline">Reports</span>
          </Link>

          <div className="w-px h-4 bg-gray-700 shrink-0" />

          {/* Report title — always visible */}
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 truncate block">
              Humanoid Robotics Intelligence 2026
            </span>
          </div>

          {/* Current chapter indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-xs font-black"
              style={{
                background: currentChapterMeta.bgColor,
                color: currentChapterMeta.color,
                border: `1px solid ${currentChapterMeta.borderColor}`,
                fontSize: 11,
              }}
            >
              {currentChapterMeta.key.toUpperCase()}
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">
              {currentChapterMeta.label}
            </span>
          </div>

          <div className="w-px h-4 bg-gray-700 shrink-0" />

          {/* Pro badge */}
          <div className="shrink-0">
            {isPro ? (
              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-medium">
                ✓ Pro
              </span>
            ) : (
              <Link
                href="/pricing"
                className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full font-medium hover:bg-amber-800/50 transition"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Chapter progress strip */}
        <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.key;
            const unlocked = ch.free || isPro;
            return (
              <button
                key={ch.key}
                className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium transition whitespace-nowrap"
                style={
                  isActive
                    ? { background: ch.bgColor, color: ch.color, border: `1px solid ${ch.borderColor}` }
                    : unlocked
                    ? { color: '#6b7280', border: '1px solid transparent' }
                    : { color: '#374151', border: '1px solid transparent' }
                }
                onClick={() => {
                  const el = document.getElementById(`chapter-${ch.key}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                title={ch.label_cn}
              >
                {ch.key.toUpperCase()}{!unlocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Report Hero ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 border border-gray-700 rounded-full px-4 py-1">
              AMORA Research · 2026
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {report.title}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
              {report.summary?.slice(0, 200)}...
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs text-gray-600">{report.author}</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">March 2026</span>
            </div>
          </div>

          {/* Chapter overview pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {CHAPTERS.map((ch) => (
              <div
                key={ch.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs"
                style={{
                  background: ch.bgColor,
                  borderColor: ch.borderColor,
                  color: ch.color,
                }}
              >
                <span className="font-black" style={{ fontSize: 11 }}>{ch.key.toUpperCase()}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-300">{ch.label_cn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chapters ────────────────────────────────────────────────────── */}
      <div className="flex-1">
        {CHAPTERS.map((ch, index) => {
          const unlocked = ch.free || isPro;
          const hasContent = !!contents[ch.key];

          return (
            <div key={ch.key}>
              <ChapterDivider chapter={ch} index={index} />

              <div className="max-w-5xl mx-auto px-6 pb-12">
                {hasContent && unlocked ? (
                  <ChapterContentSection
                    chapter={ch}
                    content={contents[ch.key]}
                    isPremium={!ch.free}
                  />
                ) : hasContent && !unlocked ? (
                  <LockedOverlay chapter={ch} />
                ) : (
                  <div className="py-12 text-center text-gray-600 text-sm">
                    Loading {ch.label}...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Report Footer ───────────────────────────────────────────────── */}
      <div className="border-t border-gray-800/50 py-8 text-center">
        <p className="text-xs text-gray-600 mb-2">
          Humanoid Robotics Intelligence 2026 · AMORA Research
        </p>
        {!isPro && (
          <Link
            href="/pricing"
            className="inline-block text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition"
          >
            Unlock All Chapters — Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
