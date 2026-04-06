'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/db';
import type { SubscriptionTier } from '@/components/ChartBlock';

interface Chapter {
  key: string;
  label: string;
  label_cn: string;
  color: string;
  bgColor: string;
  order: number;
  free: boolean;
  badge: string;
  description: string;
}

const CHAPTERS: Chapter[] = [
  {
    key: 'm',
    label: 'Mapping',
    label_cn: '产业链生态',
    color: '#00d4ff',
    bgColor: 'rgba(0,212,255,0.1)',
    order: 1,
    free: true,
    badge: 'FREE',
    description: '中美产业链全景图 · 卡脖子清单 · 供应链时间线',
  },
  {
    key: 'a',
    label: 'Advancement',
    label_cn: '技术先进性',
    color: '#ff006e',
    bgColor: 'rgba(255,0,110,0.1)',
    order: 2,
    free: false,
    badge: 'PRO',
    description: '世界模型 · 端到端控制 · 硬件代际演进',
  },
  {
    key: 'o',
    label: 'Operations',
    label_cn: '商业化运营',
    color: '#06d6a0',
    bgColor: 'rgba(6,214,160,0.1)',
    order: 3,
    free: false,
    badge: 'PRO',
    description: '四大应用场景 · 客户结构真相 · ROI 评估',
  },
  {
    key: 'r',
    label: 'Reach',
    label_cn: '市场容量',
    color: '#ffbe0b',
    bgColor: 'rgba(255,190,11,0.1)',
    order: 4,
    free: false,
    badge: 'PRO',
    description: '三情景预测 · 2035 规模测算 · 全球化策略',
  },
  {
    key: 'a2',
    label: 'Assets',
    label_cn: '资本价值',
    color: '#9775fa',
    bgColor: 'rgba(151,117,250,0.1)',
    order: 5,
    free: false,
    badge: 'PRO',
    description: '核心财务对比 · 估值矩阵 · AMORA 评分卡',
  },
];

interface Props {
  report: Report;
  hasAccess: boolean;
  subscriptionTier: SubscriptionTier;
  relatedReports: Report[];
}

// ── Upgrade Modal ──────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-white mb-2">Pro Content Locked</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          This chapter is exclusive to <strong className="text-amber-400">AMORA Pro</strong> subscribers.
          Unlock all 5 report chapters and get priority updates.
        </p>
        <div className="space-y-2 mb-6">
          {[
            '✅ All 5 report chapters unlocked',
            '✅ Priority report updates',
            '✅ AMORA scoring access',
            '✅ Export to PDF',
          ].map((item) => (
            <div key={item} className="text-sm text-gray-300 flex items-center gap-2">
              <span className="text-green-400">✓</span> {item.slice(2)}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Link
            href="/pricing"
            className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition text-center"
          >
            Upgrade to Pro
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 hover:text-gray-300 text-sm py-1 transition"
          >
            Continue reading free chapter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chapter Iframe ─────────────────────────────────────────────────────────────
function ChapterIframe({
  chapter,
}: {
  chapter: Chapter;
  isPro: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const src = `/api/hri-chapters/${chapter.key}`;

  // Pro chapters are noindex to protect content
  // Free chapters (Mapping) are indexed via the main report page

  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${chapter.color} transparent transparent transparent` }}
            />
            <span className="text-gray-500 text-sm">Loading {chapter.label}...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
          Failed to load chapter. <button className="text-blue-400 ml-2" onClick={() => { setError(false); setLoaded(false); }}>Retry</button>
        </div>
      )}
      <iframe
        src={src}
        className="w-full h-full border-0"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer"
        loading="lazy"
        title={`Part ${chapter.key.toUpperCase()}: ${chapter.label}`}
      />
    </div>
  );
}

// ── Cover Page ────────────────────────────────────────────────────────────────
function CoverPage({ report, isPro, onChapterSelect }: {
  report: Report;
  isPro: boolean;
  onChapterSelect: (key: string) => void;
}) {
  const freeChapter = CHAPTERS[0]; // Mapping is always free

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Report title */}
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 border border-gray-700 rounded-full px-4 py-1">
            AMORA Research · 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {report.title}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            {report.summary?.slice(0, 200)}...
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="text-xs text-gray-600">by {report.author}</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600">March 2026</span>
          </div>
        </div>

        {/* Chapter cards */}
        <div className="space-y-3 mb-10">
          {CHAPTERS.map((ch, i) => {
            const unlocked = ch.free || isPro;
            return (
              <button
                key={ch.key}
                onClick={() => unlocked ? onChapterSelect(ch.key) : undefined}
                disabled={!unlocked}
                className={`
                  w-full text-left rounded-xl p-4 transition-all border
                  ${unlocked
                    ? 'border-gray-800 hover:border-gray-600 hover:bg-gray-900/50 cursor-pointer'
                    : 'border-gray-800/50 opacity-60 cursor-not-allowed'
                  }
                `}
                style={unlocked ? { borderLeftColor: ch.color, borderLeftWidth: 3 } : {}}
              >
                <div className="flex items-start gap-4">
                  {/* Chapter number */}
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: unlocked ? ch.bgColor : 'rgba(255,255,255,0.05)',
                      color: unlocked ? ch.color : '#4b5563',
                    }}
                  >
                    {ch.key.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{ch.label}</span>
                      <span className="text-xs text-gray-500">{ch.label_cn}</span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: ch.free ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                          color: ch.free ? '#22c55e' : '#fbbf24',
                        }}
                      >
                        {ch.free ? 'FREE' : 'PRO'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ch.description}</p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 text-gray-600 mt-0.5">
                    {unlocked ? '→' : '🔒'}
                  </div>
                </div>

                {/* Progress preview bar */}
                {i === 0 && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: '#1f2937' }}>
                    <div className="h-full rounded-full" style={{ width: '100%', background: ch.color }} />
                  </div>
                )}
                {i > 0 && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: '#1f2937' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: unlocked ? '0%' : '0%',
                        background: ch.color,
                        opacity: 0.3,
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Companies Analyzed', value: '9' },
            { label: 'AMORA Dimensions', value: '5' },
            { label: 'Data Points', value: '200+' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA for non-Pro */}
        {!isPro && (
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-800/40 rounded-2xl p-6 text-center">
            <p className="text-amber-300 font-semibold text-sm mb-1">Unlock the Full Report</p>
            <p className="text-gray-400 text-xs mb-4">
              Get all 5 chapters with interactive charts, scoring data, and investment insights.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Start reading free chapter */}
        <div className="text-center mt-6">
          <button
            onClick={() => onChapterSelect(freeChapter.key)}
            className="text-sm text-gray-500 hover:text-gray-300 transition"
          >
            Start with free chapter — Part M: Mapping →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main H5ReportViewer ───────────────────────────────────────────────────────
export default function H5ReportViewer({
  report,
  hasAccess,
  relatedReports,
}: Props) {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isPro = hasAccess;

  const handleChapterSelect = useCallback((key: string) => {
    const chapter = CHAPTERS.find((c) => c.key === key);
    if (!chapter) return;

    if (!chapter.free && !isPro) {
      setShowUpgradeModal(true);
      return;
    }

    setActiveChapter(key);
    setNavOpen(false);

    // Scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isPro]);

  const handleBack = useCallback(() => {
    setActiveChapter(null);
  }, []);

  const currentChapter = CHAPTERS.find((c) => c.key === activeChapter);

  // Close nav on chapter change
  useEffect(() => {
    if (activeChapter) setNavOpen(false);
  }, [activeChapter]);

  return (
    <>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      <div className="flex flex-col flex-1 bg-black">
        {/* ── Top Bar ────────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-30 border-b border-gray-800/60 bg-gray-950/95 backdrop-blur-sm"
          style={{ height: 52 }}
        >
          <div className="flex items-center h-full px-4 gap-3">
            {/* Back / Menu */}
            {activeChapter ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition shrink-0"
              >
                <span>←</span>
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition shrink-0"
              >
                <span>☰</span>
                <span className="hidden sm:inline">Chapters</span>
              </button>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0 text-center">
              <span className="text-xs text-gray-500 truncate">
                {currentChapter
                  ? `Part ${currentChapter.key.toUpperCase()} · ${currentChapter.label}`
                  : 'Humanoid Robotics Intelligence 2026'
                }
              </span>
            </div>

            {/* Badge */}
            <div className="shrink-0">
              {isPro ? (
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-medium">
                  ✓ Pro
                </span>
              ) : (
                <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  Free
                </span>
              )}
            </div>
          </div>

          {/* Chapter nav strip (always visible when not reading a chapter) */}
          {!activeChapter && (
            <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
              {CHAPTERS.map((ch) => {
                const unlocked = ch.free || isPro;
                const isActive = activeChapter === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => unlocked && handleChapterSelect(ch.key)}
                    disabled={!unlocked}
                    className={`
                      shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition whitespace-nowrap
                      ${isActive
                        ? 'ring-1'
                        : unlocked
                        ? 'text-gray-500 hover:text-gray-300'
                        : 'text-gray-700 cursor-not-allowed'
                      }
                    `}
                    style={
                      isActive
                        ? { background: ch.bgColor, color: ch.color, borderColor: ch.color, ringColor: ch.color }
                        : {}
                    }
                    title={ch.label_cn}
                  >
                    {ch.key.toUpperCase()}{!unlocked && ' 🔒'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Content Area ────────────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 52px)' }}>
          {activeChapter ? (
            <ChapterIframe
              chapter={CHAPTERS.find((c) => c.key === activeChapter)!}
              isPro={isPro}
            />
          ) : (
            <CoverPage
              report={report}
              isPro={isPro}
              onChapterSelect={handleChapterSelect}
            />
          )}
        </div>

        {/* ── Bottom nav dots (mobile) ─────────────────────────────────────── */}
        {activeChapter && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 rounded-full px-3 py-1.5 shadow-xl z-20">
            {CHAPTERS.map((ch) => {
              const unlocked = ch.free || isPro;
              return (
                <button
                  key={ch.key}
                  onClick={() => unlocked ? handleChapterSelect(ch.key) : setShowUpgradeModal(true)}
                  className={`w-2 h-2 rounded-full transition-all ${activeChapter === ch.key ? 'scale-150' : 'opacity-50'}`}
                  style={{
                    background: unlocked ? ch.color : '#4b5563',
                    transform: activeChapter === ch.key ? 'scale(1.5)' : 'scale(1)',
                  }}
                  title={ch.label}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
