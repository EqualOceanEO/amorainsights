'use client';

import { useState, useEffect } from 'react';
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
  tagline: string;
  accentGradient: string;
  src: string;
  previewHeight: number; // px — how much of iframe is visible as free preview
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
    src: '/hri-report-part-m-mapping-v1.html',
    previewHeight: 520,
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
    src: '/hri-report-part-a-advancement-v1.html',
    previewHeight: 460,
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
    tagline: '出货量 · 客群结构 · 收入规模 · 盈利能力',
    src: '/hri-report-part-o-operations-v1.html',
    previewHeight: 440,
  },
  {
    key: 'r',
    label: 'Reach',
    label_cn: '市场容量',
    color: '#ff9500',
    bgColor: 'rgba(255,149,0,0.08)',
    borderColor: 'rgba(255,149,0,0.3)',
    accentGradient: 'linear-gradient(135deg, #ff9500 0%, #cc7700 100%)',
    order: 4,
    free: false,
    badge: 'PRO',
    tagline: '全球市场 · TAM/SAM/SOM · 增速预测',
    src: '/hri-report-part-r-reach-v1.html',
    previewHeight: 420,
  },
  {
    key: 'a2',
    label: 'Assets',
    label_cn: '资本价值',
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.08)',
    borderColor: 'rgba(168,85,247,0.3)',
    accentGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    order: 5,
    free: false,
    badge: 'PRO',
    tagline: '估值 · 融资 · 资本效率 · AMORA Score 总榜',
    src: '/hri-report-part-a2-assets-v1.html',
    previewHeight: 440,
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
  demoMode?: boolean;
}

// ── Sticky Nav ────────────────────────────────────────────────────────────────

function StickyNav({
  activeKey,
  isPro,
  showAll,
  onChapterClick,
}: {
  activeKey: string;
  isPro: boolean;
  showAll: boolean;
  onChapterClick: (key: string) => void;
}) {
  const activeCh = CHAPTERS.find((c) => c.key === activeKey) ?? CHAPTERS[0];
  return (
    <div
      className="shrink-0"
      style={{
        background: 'rgba(6,7,14,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 px-5 h-11">
        <span className="text-sm font-bold text-white shrink-0 tracking-tight">AMORA</span>
        <div className="w-px h-4 bg-gray-700 shrink-0" />
        <span className="text-xs text-gray-400 truncate flex-1 min-w-0">
          Humanoid Robotics Intelligence 2026
          {showAll && (
            <span className="ml-2 bg-yellow-900/50 text-yellow-400 px-1.5 py-0.5 rounded-full text-xs font-bold align-middle">
              DEMO
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-5 h-5 rounded flex items-center justify-center font-black"
            style={{
              background: activeCh.bgColor,
              color: activeCh.color,
              border: `1px solid ${activeCh.borderColor}`,
              fontSize: 10,
            }}
          >
            {activeCh.key.toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">{activeCh.label}</span>
        </div>
        <div className="w-px h-4 bg-gray-700 shrink-0" />
        {showAll ? (
          <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full font-medium shrink-0">
            Demo Mode
          </span>
        ) : isPro ? (
          <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-medium shrink-0">
            Pro
          </span>
        ) : (
          <Link
            href="/pricing"
            className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full font-medium hover:bg-amber-800/50 transition shrink-0"
          >
            Upgrade
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1 px-5 pb-2 overflow-x-auto scrollbar-hide">
        {CHAPTERS.map((ch) => {
          const isActive = activeKey === ch.key;
          return (
            <button
              key={ch.key}
              onClick={() => onChapterClick(ch.key)}
              className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium transition whitespace-nowrap"
              style={
                isActive
                  ? { background: ch.bgColor, color: ch.color, border: `1px solid ${ch.borderColor}` }
                  : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid transparent' }
              }
            >
              {ch.key.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Chapter Divider ────────────────────────────────────────────────────────────

function ChapterDivider({ chapter, index }: { chapter: ChapterMeta }) {
  return (
    <div
      className="flex items-center gap-4 px-4"
      style={{ paddingTop: 12, paddingBottom: 10 }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0"
        style={{
          background: chapter.bgColor,
          border: `1px solid ${chapter.borderColor}`,
          color: chapter.color,
          fontSize: 14,
        }}
      >
        {chapter.key.toUpperCase()}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{ background: chapter.bgColor, color: chapter.color, border: `1px solid ${chapter.borderColor}` }}
        >
          {index + 1}
        </span>
        <span className="font-semibold text-white text-sm">{chapter.label}</span>
        <span className="text-gray-500 text-xs hidden sm:block">{chapter.label_cn}</span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{
            background: chapter.free ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
            color: chapter.free ? '#22c55e' : '#fbbf24',
          }}
        >
          {chapter.badge}
        </span>
      </div>
    </div>
  );
}

// ── Iframe with blur-to-lock overlay ─────────────────────────────────────────

function ChapterIframe({ chapter, isFullAccess, showPreview }: { chapter: ChapterMeta; isFullAccess: boolean; showPreview: boolean }) {
  // When showPreview=true (non-Demo locked chapter): show only previewH
  // When isFullAccess=true (Demo or Pro): show full
  const containerH = isFullAccess ? 900 : chapter.previewHeight;

  return (
    <div
      className="relative mx-3 my-2 rounded-xl overflow-hidden"
      style={{ height: containerH, border: `1px solid ${chapter.borderColor}` }}
    >
      <iframe
        src={chapter.src}
        className="w-full border-0"
        style={{ height: containerH, display: 'block' }}
        title={`Part ${chapter.order}: ${chapter.label}`}
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
      />

      {/* Preview overlay — ALL locked chapters get blur+CTA */}
      {showPreview && !isFullAccess && (
        <>
          {/* Top fade so blur blends into visible content */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(6,7,14,0.55) 35%, rgba(6,7,14,0.97) 72%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />
          {/* CTA zone at bottom */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center pb-6"
            style={{
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(6,7,14,0.9) 25%)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{
                background: chapter.bgColor,
                border: `1px solid ${chapter.borderColor}`,
                color: chapter.color,
              }}
            >
              🔒
            </div>
            <p className="text-xs text-gray-400 mb-1">继续阅读</p>
            <p className="text-sm font-bold mb-4" style={{ color: chapter.color }}>
              {chapter.label_cn}完整章节
            </p>
            <Link
              href="/pricing"
              className="inline-block text-sm font-bold px-8 py-2.5 rounded-xl text-white transition hover:opacity-90"
              style={{
                background: chapter.accentGradient,
                boxShadow: `0 0 28px ${chapter.color}50`,
              }}
            >
              升级解锁全部章节
            </Link>
            <p className="text-xs text-gray-600 mt-2">AMORA Pro · 永久访问 · 包含全部报告</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function H5ReportViewer({ report, hasAccess, demoMode }: Props) {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].key);

  const isPro = hasAccess;
  const showAll = demoMode === true;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          const key = topmost.target.getAttribute('data-chapter-key');
          if (key) setActiveChapter(key);
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    for (const ch of CHAPTERS) {
      const el = document.getElementById(`chapter-${ch.key}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleChapterClick = (key: string) => {
    document.getElementById(`chapter-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Global styles: hide scrollbar but keep functionality */}
      <style>{`
        body { overflow-y: scroll !important; }
        body::-webkit-scrollbar { display: none !important; }
        body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div
        className="flex flex-col"
        style={{
          minHeight: '100vh',
          background: '#06070e',
        }}
      >
        {/* Fixed top nav */}
        <StickyNav
          activeKey={activeChapter}
          isPro={isPro}
          showAll={showAll}
          onChapterClick={handleChapterClick}
        />

        {/* Page-level scrollable content (scrollbar hidden) */}
        <div
          style={{
            flex: 1,
            overflowY: 'scroll',
            scrollBehavior: 'smooth',
            // Completely hide scrollbar across all browsers
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="no-scrollbar"
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none !important; }
            .no-scrollbar { scrollbar-width: none !important; -ms-overflow-style: none !important; }
          `}</style>

          {CHAPTERS.map((ch, index) => {
            const isFullAccess = showAll || ch.free || isPro;
            // showPreview = show blur overlay on non-Demo, non-Pro content
            const showPreview = !showAll && !isPro;
            return (
              <section key={ch.key} id={`chapter-${ch.key}`} data-chapter-key={ch.key}>
                <ChapterDivider chapter={ch} index={index} />
                <ChapterIframe chapter={ch} isFullAccess={isFullAccess} showPreview={showPreview} />
              </section>
            );
          })}

          {/* Footer */}
          <div className="text-center py-8 px-6 border-t border-gray-800/30 mt-2">
            <p className="text-xs text-gray-600 mb-3">
              Humanoid Robotics Intelligence 2026 · AMORA Research
            </p>
            {!isPro && !showAll && (
              <Link
                href="/pricing"
                className="inline-block text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition"
              >
                解锁全部五章 · 升级 Pro
              </Link>
            )}
            {showAll && (
              <p className="text-xs text-yellow-500/50 italic">
                Demo Mode — All chapters unlocked for preview
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
