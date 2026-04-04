'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { INDUSTRY_HIERARCHY, getLevel2Options } from '@/lib/industries';
import { INDUSTRY_META, type IndustrySlug } from '@/lib/db';

interface SiteNavProps {
  activePath?: string;
}

export default function SiteNav({ activePath }: SiteNavProps) {
  const pathname = usePathname();
  const active = activePath ?? pathname;
  const [ddOpen, setDdOpen] = useState(false);
  const [hoverL1, setHoverL1] = useState<string | null>(null);
  const ddRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function isActive(href: string) {
    if (href === '/') return active === '/';
    return active.startsWith(href);
  }

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDdOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setDdOpen(false), 200);
  }

  const l2 = hoverL1 ? getLevel2Options(hoverL1) : [];
  const l2Meta = hoverL1 ? INDUSTRY_META[hoverL1 as IndustrySlug] : null;

  const navLinks = [
    { href: '/industries', label: 'Industries', isDropdown: true },
    { href: '/news', label: 'News' },
    { href: '/reports', label: 'Reports' },
    { href: '/companies', label: 'Companies' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight shrink-0 select-none">
          Amora<span className="text-blue-400">Insights</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, isDropdown }) =>
            isDropdown ? (
              <div
                key={href}
                ref={ddRef}
                className="relative"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                <button
                  onClick={() => setDdOpen((v) => !v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/industries')
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  {label}
                  <svg className={`w-3.5 h-3.5 transition-transform ${ddOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {ddOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[520px] rounded-xl border border-gray-700/60 bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="flex">
                      {/* L1 column */}
                      <div className="w-[180px] border-r border-gray-800/60 py-2">
                        {INDUSTRY_HIERARCHY.map((g) => (
                          <Link
                            key={g.level1.id}
                            href={`/industries/${g.level1.id}`}
                            onMouseEnter={() => setHoverL1(g.level1.id)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              hoverL1 === g.level1.id
                                ? 'bg-gray-800/80 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                            }`}
                          >
                            <span className="text-base">{INDUSTRY_META[g.level1.id as IndustrySlug]?.icon}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{g.level1.label}</div>
                              <div className="text-[10px] text-gray-600 truncate">
                                {INDUSTRY_META[g.level1.id as IndustrySlug]?.name_cn}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* L2 column */}
                      <div className="flex-1 py-3 px-3">
                        {hoverL1 ? (
                          <>
                            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2 px-2">
                              Sub-sectors
                            </p>
                            <div className="grid grid-cols-1 gap-0.5">
                              {l2.map((sub) => (
                                <Link
                                  key={sub}
                                  href={`/industries/${hoverL1}/${encodeURIComponent(sub)}`}
                                  className="text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-lg px-3 py-2 transition-colors"
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-gray-600">
                            Hover to explore sub-sectors
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-800/60 px-4 py-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">6 frontier industries</span>
                      <Link
                        href="/industries"
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        View all →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/news"
            className="hidden sm:inline text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-gray-800/60"
            title="Admin panel"
          >
            Admin
          </Link>
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-gray-800/60"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
