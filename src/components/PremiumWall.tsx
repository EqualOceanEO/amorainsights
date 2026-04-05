'use client';

import Link from 'next/link';
import SubscribeBox from '@/components/SubscribeBox';

/**
 * PremiumWall — AMORA 全站通用付费墙组件
 *
 * 用于 News、Reports、Companies 详情页中限制免费用户访问付费内容。
 * 统一样式、统一 CTA、统一价格：$19.9/月。
 *
 * Props:
 *  - variant: 'news' | 'report' | 'company'
 *  - title?: 自定义标题（不传则按 variant 选默认文案）
 *  - compact?: 紧凑模式（用于行内截断）
 *  - blurPreview?: 是否显示模糊预览（默认 true）
 *  - showNewsletter?: 是否显示 Newsletter 替代入口（默认 true）
 */

interface PremiumWallProps {
  variant: 'news' | 'report' | 'company';
  title?: string;
  compact?: boolean;
  blurPreview?: boolean;
  showNewsletter?: boolean;
}

const VARIANT_CONFIG = {
  news: {
    badge: 'Premium Analysis',
    headline: 'Unlock this original analysis',
    desc: 'AMORA original research goes beyond headlines — deep analysis, competitive context, and forward-looking signals.',
    bullets: [
      '✓ Full original analysis',
      '✓ AMORA-scored insights',
      '✓ Competitive context',
      '✓ Weekly deep-dive archive',
    ],
  },
  report: {
    badge: 'Premium Report',
    headline: 'Unlock the full report',
    desc: 'Get the complete report — AMORA scores, competitive matrix, supply chain map, financial projections, and strategic recommendations.',
    bullets: [
      '✓ Full research report',
      '✓ Interactive data charts',
      '✓ AMORA 5-axis score',
      '✓ Quarterly updates',
    ],
  },
  company: {
    badge: 'Pro Intelligence',
    headline: 'Unlock full company profile',
    desc: 'Access detailed funding data, AMORA scores, technology stack, supply chain position, and customer analysis.',
    bullets: [
      '✓ Full funding & valuation',
      '✓ AMORA 5-axis score',
      '✓ Technology & patent data',
      '✓ Customer & partner map',
    ],
  },
};

export default function PremiumWall({
  variant,
  title,
  compact = false,
  blurPreview = true,
  showNewsletter = true,
}: PremiumWallProps) {
  const config = VARIANT_CONFIG[variant];
  const displayTitle = title || config.headline;

  return (
    <div className="my-8 space-y-0">
      {/* Blur preview (optional) */}
      {blurPreview && !compact && (
        <div className="relative rounded-xl overflow-hidden">
          <div
            className="px-6 py-8 bg-gray-900/60 border border-gray-800 rounded-xl select-none pointer-events-none"
            aria-hidden="true"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            }}
          >
            <p className="text-gray-400 text-sm leading-7 mb-4">
              This content includes proprietary analysis with data sourced from public filings,
              expert interviews, and AMORA&apos;s 25-indicator scoring methodology...
            </p>
            <p className="text-gray-400 text-sm leading-7 mb-4">
              Key findings include competitive benchmarking, supply chain mapping,
              regulatory assessment, and forward-looking projections...
            </p>
            <p className="text-gray-400 text-sm leading-7">
              Subscriber access includes downloadable data tables, interactive charts,
              and quarterly update alerts...
            </p>
          </div>
        </div>
      )}

      {/* CTA card */}
      <div
        className={`rounded-xl border border-blue-800/50 bg-gradient-to-b from-blue-950/40 to-gray-950/80 p-8 text-center relative z-10 ${
          compact ? 'p-6' : 'p-8'
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {config.badge}
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
          {compact ? (
            displayTitle
          ) : (
            <>
              {displayTitle}
              <br />
              <span className="text-blue-400">$19.9/month</span>
            </>
          )}
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-2 max-w-sm mx-auto leading-relaxed">
          {config.desc}
        </p>

        {/* Price badge (compact mode) */}
        {compact && (
          <div className="inline-flex items-center gap-1 bg-amber-900/30 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mt-2 mb-3">
            🔒 $19.9/month · Unlock all content
          </div>
        )}

        {/* Value bullets */}
        {!compact && (
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 mb-8 mt-4">
            {config.bullets.map((item) => (
              <li key={item} className="text-gray-400">{item}</li>
            ))}
          </ul>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
          >
            Subscribe Now — $19.9/mo →
          </Link>
          {!compact && (
            <Link
              href="/pricing"
              className="text-sm text-gray-400 hover:text-white transition px-4 py-3"
            >
              View plans
            </Link>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Already subscribed?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>{' '}
          to access.
        </p>
      </div>

      {/* Social proof strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-xs text-gray-600">
        <span>🔒 Cancel anytime</span>
        <span>📦 Instant access</span>
        <span>🌍 500+ analysts trust AMORA</span>
      </div>

      {/* Newsletter hook */}
      {showNewsletter && !compact && (
        <div className="mt-8 pt-8 border-t border-gray-800/60">
          <p className="text-xs text-gray-500 text-center mb-4">
            Not ready to subscribe? Get the weekly briefing — free.
          </p>
          <div className="max-w-sm mx-auto">
            <SubscribeBox source={`${variant}_premium_wall`} compact />
          </div>
        </div>
      )}
    </div>
  );
}
