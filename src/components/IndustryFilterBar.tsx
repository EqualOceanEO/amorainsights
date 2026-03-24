'use client';

/**
 * IndustryFilterBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified search + two-level industry filter bar.
 * Used by: /news, /companies, /reports
 *
 * Layout:
 *   [Search input]  [All | AI | Life Sciences | …]
 *                   [sub-sector chips — always reserved, avoids layout jump]
 *
 * The sub-sector row is ALWAYS in the DOM (min-h-[36px]).
 * When a level-1 is selected it fills with chips; otherwise it shows nothing.
 * This eliminates the page "jump" when the second row appears/disappears.
 */

import { INDUSTRY_HIERARCHY } from '@/lib/industries';

interface IndustryFilterBarProps {
  /** Current search query */
  search?: string;
  /** Current level-1 industry id ('' = All) */
  industry: string;
  /** Current level-2 sub-sector label ('' = All) */
  industryLevel2?: string;

  /** Whether to show the search box */
  showSearch?: boolean;
  /** Placeholder text for search box */
  searchPlaceholder?: string;

  /** Extra slot rendered after the filter rows (e.g. Premium toggle for Reports) */
  extra?: React.ReactNode;

  // Callbacks (omit for read-only / URL-driven pages)
  onSearchChange?: (v: string) => void;
  onLevel1Change?: (v: string) => void;
  onLevel2Change?: (v: string) => void;

  /**
   * URL-mode: instead of callbacks, pass URL builders.
   * When provided, level-1 buttons render as <a> tags.
   */
  level1Href?: (id: string) => string;
  /** URL for "All" level-1 button */
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

  return (
    <div className="space-y-2">
      {/* ── Row 1: Search + Level-1 ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-none w-full sm:w-56">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              readOnly={!onSearchChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        )}

        {/* Level-1 tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
          {/* All */}
          {isUrlMode && allHref ? (
            <a
              href={allHref}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                industry === ''
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
              }`}
            >
              All
            </a>
          ) : (
            <button
              onClick={() => { onLevel1Change?.(''); onLevel2Change?.(''); }}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                industry === ''
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
              }`}
            >
              All
            </button>
          )}

          {INDUSTRY_HIERARCHY.map(group => {
            const isActive = industry === group.level1.id;
            const cls = `shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              isActive && !industryLevel2
                ? 'bg-blue-600 text-white'
                : isActive && industryLevel2
                  ? 'bg-gray-800 text-white border border-gray-600'
                  : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
            }`;

            if (isUrlMode && level1Href) {
              return (
                <a key={group.level1.id} href={level1Href(group.level1.id)} className={cls}>
                  {group.level1.label}
                </a>
              );
            }
            return (
              <button
                key={group.level1.id}
                onClick={() => {
                  if (industry === group.level1.id) {
                    // clicking same level-1 → deselect
                    onLevel1Change?.('');
                  } else {
                    onLevel1Change?.(group.level1.id);
                  }
                  onLevel2Change?.('');
                }}
                className={cls}
              >
                {group.level1.label}
              </button>
            );
          })}
        </div>

        {/* Extra slot (e.g. Premium filter for Reports) */}
        {extra && <div className="flex items-center gap-2 flex-none">{extra}</div>}
      </div>

      {/* ── Row 2: Level-2 sub-sectors — ALWAYS in DOM to prevent layout jump ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none min-h-[32px]">
        {level2Options.length > 0 ? (
          <>
            {level2Options.map(lv2 => {
              const isActive = industryLevel2 === lv2;
              if (isUrlMode) {
                // In URL mode, sub-sectors are display-only (not clickable)
                return (
                  <span
                    key={lv2}
                    className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-gray-900 border border-gray-700'
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
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {lv2}
                </button>
              );
            })}
            {/* Clear level-2 button */}
            {industryLevel2 && !isUrlMode && (
              <button
                onClick={() => onLevel2Change?.('')}
                className="shrink-0 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </>
        ) : (
          // Empty placeholder — keeps the row height stable
          <span className="sr-only">No sub-sectors</span>
        )}
      </div>
    </div>
  );
}
