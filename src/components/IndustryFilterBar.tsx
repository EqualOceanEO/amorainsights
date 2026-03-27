'use client';

/**
 * IndustryFilterBar v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified search + two-level industry filter bar.
 * Key improvements:
 * - Smooth transitions without layout shift
 * - Fixed-height container to prevent page jump
 * - Refined micro-interactions
 * - CSS-only animations (no reflow)
 */

import { INDUSTRY_HIERARCHY } from '@/lib/industries';
import { useState, useRef, useEffect } from 'react';

interface IndustryFilterBarProps {
  search?: string;
  industry: string;
  industryLevel2?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  extra?: React.ReactNode;
  onSearchChange?: (v: string) => void;
  onLevel1Change?: (v: string) => void;
  onLevel2Change?: (v: string) => void;
  level1Href?: (id: string) => string;
  allHref?: string;
}

export default function IndustryFilterBar({
  search = '',
  industry,
  industryLevel2 = '',
  showSearch = true,
  searchPlaceholder = 'Search…',
  extra,
  onSearchChange,
  onLevel1Change,
  onLevel2Change,
  level1Href,
  allHref,
}: IndustryFilterBarProps) {
  const isUrlMode = !!(level1Href || allHref);
  const level2Options = INDUSTRY_HIERARCHY.find(h => h.level1.id === industry)?.level2 ?? [];

  // Track which level-2 was last active (for smooth exit animation)
  const [prevLevel2, setPrevLevel2] = useState('');

  useEffect(() => {
    if (industryLevel2) {
      setPrevLevel2(industryLevel2);
    }
  }, [industryLevel2]);

  const handleLevel1Click = (id: string) => {
    if (industry === id) {
      // Already active — deselect
      onLevel1Change?.('');
    } else {
      onLevel1Change?.(id);
    }
    onLevel2Change?.('');
  };

  return (
    <div className="space-y-3">
      {/* ── Row 1: Search + Level-1 tabs ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative w-full sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Search icon */}
              <svg
                className="w-4 h-4 text-gray-500 transition-colors group-focus-within:text-blue-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              readOnly={!onSearchChange}
              className="w-full bg-gray-900/80 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/70 focus:bg-gray-900 transition-all duration-200"
            />
            {/* Clear search button */}
            {search && onSearchChange && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Level-1 tabs — horizontally scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide flex-1 min-h-[40px]">
          {/* All button */}
          {isUrlMode && allHref ? (
            <a
              href={allHref}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                industry === ''
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              All
            </a>
          ) : (
            <button
              onClick={() => { onLevel1Change?.(''); onLevel2Change?.(''); }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                industry === ''
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              All
            </button>
          )}

          {INDUSTRY_HIERARCHY.map(group => {
            const isActive = industry === group.level1.id;
            return (
              <button
                key={group.level1.id}
                onClick={() => handleLevel1Click(group.level1.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                {group.level1.label}
              </button>
            );
          })}
        </div>

        {/* Extra slot */}
        {extra && <div className="flex items-center gap-2 shrink-0">{extra}</div>}
      </div>

      {/* ── Row 2: Level-2 sub-sectors — ALWAYS rendered, fixed height ── */}
      <div className="min-h-[36px] flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {/* Fade indicators for scrollable content */}
        <div className="absolute left-0 w-6 h-full bg-gradient-to-r from-gray-950 to-transparent pointer-events-none z-10 opacity-0 transition-opacity" />
        <div className="absolute right-0 w-6 h-full bg-gradient-to-l from-gray-950 to-transparent pointer-events-none z-10 opacity-0 transition-opacity" />

        {level2Options.length > 0 ? (
          <>
            {level2Options.map(lv2 => {
              const isActive = industryLevel2 === lv2;
              if (isUrlMode) {
                return (
                  <span
                    key={lv2}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'text-gray-500 bg-transparent border border-transparent'
                    }`}
                  >
                    {lv2}
                  </span>
                );
              }
              return (
                <button
                  key={lv2}
                  onClick={() => onLevel2Change?.(industryLevel2 === lv2 ? '' : lv2)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-500/90 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  {lv2}
                </button>
              );
            })}

            {/* Clear level-2 when one is active */}
            {industryLevel2 && !isUrlMode && (
              <button
                onClick={() => onLevel2Change?.('')}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-700/50 transition-all duration-200 ml-1"
                title="Clear sub-sector filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        ) : (
          /* Empty state placeholder — invisible but maintains height */
          <span className="text-xs text-gray-600 select-none">Select an industry to see sub-sectors</span>
        )}
      </div>
    </div>
  );
}
