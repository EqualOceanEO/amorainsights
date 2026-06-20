'use client';

/**
 * ChartBlock — AMORA 图表分级交互组件
 *
 * 免费/游客用户: 静态 SVG + 半透明 overlay + 锁图标 + hover tooltip
 *               点击跳转 /pricing（Celine文案）
 * Pro/Enterprise 用户: ECharts 交互版，支持 hover、缩放、PNG 导出
 *
 * Franklyn product spec 2026-03-15
 * Celine copy spec 2026-03-15
 */

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import type { EChartsOption } from 'echarts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface ChartBlockProps {
  /** ECharts option object for the interactive chart */
  option: EChartsOption;
  /** Static SVG string for the locked preview */
  staticSvg?: string;
  /** User's subscription tier — determines render mode */
  subscriptionTier: SubscriptionTier;
  /** Chart title shown above the block */
  title?: string;
  /** Optional caption below the chart */
  caption?: string;
  /** Height in px (default 300) */
  height?: number;
  /** className override */
  className?: string;
}

// ─── Static SVG fallback generator ───────────────────────────────────────────
// If no staticSvg prop is provided, generate a simple bar chart ghost from the
// ECharts option data so the blur preview still looks meaningful.

function generateGhostSvg(option: EChartsOption, height: number): string {
  const w = 480;
  const h = height;
  const pad = 40;
  const chartH = h - pad * 2;
  const chartW = w - pad * 2;

  // Try to extract bar/line series data for a rough preview
  const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const firstSeries = series[0] as { data?: (number | { value: number })[] } | undefined;
  const rawData = firstSeries?.data ?? [65, 40, 80, 55, 90, 45, 70];
  const values = rawData.map((d) => (typeof d === 'number' ? d : (d as { value: number }).value));
  const maxVal = Math.max(...values, 1);

  const barW = Math.floor(chartW / values.length) - 6;
  const bars = values
    .map((v, i) => {
      const bh = Math.floor((v / maxVal) * chartH * 0.85);
      const x = pad + i * (chartW / values.length) + 3;
      const y = pad + chartH - bh;
      const alpha = 0.3 + (i / values.length) * 0.5;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="3" fill="rgba(29,78,216,${alpha})" />`;
    })
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#0F172A" rx="8"/>
  <!-- Ghost bars -->
  ${bars}
  <!-- X axis -->
  <line x1="${pad}" y1="${pad + chartH}" x2="${w - pad}" y2="${pad + chartH}" stroke="#374151" stroke-width="1"/>
</svg>`;
}

// ─── Locked overlay (free users) ─────────────────────────────────────────────

function LockedOverlay({ tier }: { tier: SubscriptionTier }) {
  const ctaHref = tier === 'free' ? '/pricing' : '/pricing#pro';
  const ctaText = tier === 'free' ? 'Start Free →' : 'Upgrade to Pro';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl overflow-hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-[#060D1C]/70 rounded-xl" />

      {/* Card */}
      <div className="relative z-10 text-center px-6 py-5 max-w-xs">
        {/* Lock icon */}
        <div className="w-10 h-10 rounded-full bg-[#1D4ED8]/20 border border-[#1D4ED8]/40 flex items-center justify-center mx-auto mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#3B82F6]">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="text-white font-semibold text-sm mb-1 leading-snug">
          Unlock Interactive Charts
        </p>
        <p className="text-gray-400 text-xs mb-4 leading-relaxed">
          Join AMORA to explore the full data behind this report.
        </p>

        <Link
          href={ctaHref}
          className="inline-block bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors duration-150"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}

// ─── Hover tooltip for blurred SVG area ──────────────────────────────────────

function HoverTooltip() {
  return (
    <div className="
      absolute top-3 right-3 z-20
      opacity-0 group-hover:opacity-100
      transition-opacity duration-200
      bg-[#1D4ED8] text-white text-[11px] font-medium
      px-3 py-1.5 rounded-md whitespace-nowrap
      pointer-events-none
    ">
      📊 Interactive for Pro &amp; Enterprise members
    </div>
  );
}

// ─── ECharts interactive renderer (client-only) ───────────────────────────────

function EChartsRenderer({
  option,
  height,
}: {
  option: EChartsOption;
  height: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chart: ReturnType<typeof import('echarts')['init']> | null = null;

    const init = async () => {
      if (!containerRef.current) return;
      const echarts = await import('echarts');
      const { AMORA_ECHARTS_THEME, AMORA_THEME_NAME } = await import('@/lib/echarts-theme');

      // Register theme once
      echarts.registerTheme(AMORA_THEME_NAME, AMORA_ECHARTS_THEME);

      chart = echarts.init(containerRef.current, AMORA_THEME_NAME, {
        renderer: 'svg',
      });
      chart.setOption({
        ...option,
        toolbox: {
          show: true,
          right: 12,
          top: 8,
          feature: {
            saveAsImage: {
              title: 'Export PNG',
              pixelRatio: 2,
              iconStyle: {
                borderColor: '#4B5563',
              },
            },
          },
          iconStyle: { color: '#6B7280', borderColor: 'transparent' },
          emphasis: { iconStyle: { color: '#3B82F6' } },
        },
      });

      const ro = new ResizeObserver(() => chart?.resize());
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    };

    init();
    return () => chart?.dispose();
  }, [option]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
      className="w-full"
    />
  );
}

// ─── Main ChartBlock component ────────────────────────────────────────────────

export default function ChartBlock({
  option,
  staticSvg,
  subscriptionTier,
  title,
  caption,
  height = 300,
  className = '',
}: ChartBlockProps) {
  const isPremium = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
  const svgContent = staticSvg ?? generateGhostSvg(option, height);

  return (
    <figure className={`my-6 ${className}`}>
      {title && (
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
          {title}
        </p>
      )}

      <div
        className="relative rounded-xl overflow-hidden bg-[#0F172A] border border-gray-800 group"
        style={{ minHeight: height }}
      >
        {isPremium ? (
          /* ── Pro: full interactive ECharts ── */
          <EChartsRenderer option={option} height={height} />
        ) : (
          /* ── Free: static SVG + locked overlay ── */
          <>
            {/* Ghost SVG preview (blurred by overlay backdrop-blur) */}
            <div
              className="w-full select-none pointer-events-none"
              style={{ height }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            {/* Hover tooltip */}
            <HoverTooltip />
            {/* Lock overlay */}
            <LockedOverlay tier={subscriptionTier} />
          </>
        )}
      </div>

      {caption && (
        <figcaption className="text-xs text-gray-600 mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
