'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { INDUSTRY_HIERARCHY, getLevel2Options } from '@/lib/industries';
import { INDUSTRY_META, type IndustrySlug } from '@/lib/db';

interface SessionUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  subscriptionTier?: string;
  isAdmin?: boolean;
}

interface SiteNavProps {
  activePath?: string;
}

export default function SiteNav({ activePath }: SiteNavProps) {
  const pathname = usePathname();
  const active = activePath ?? pathname;
  const [ddOpen, setDdOpen] = useState(false);
  const [hoverL1, setHoverL1] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoggedIn = !!user;
  const isPro = user?.subscriptionTier === 'pro';
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  // Fetch session on mount, then cross-check tier from DB directly
  // (JWT may cache stale subscriptionTier; DB is always authoritative)
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        // If logged in, fetch tier directly from DB to avoid stale JWT cache
        if (user?.email) {
          try {
            const tierRes = await fetch('/api/user/tier');
            if (tierRes.ok) {
              const { tier } = await tierRes.json();
              user.subscriptionTier = tier;
            }
          } catch { /* non-critical, keep session value */ }
        }
        setUser(user);
      }
    } catch {
      // Silent fail — stay logged out
    } finally {
      setSessionLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Re-fetch session when pathname changes (e.g., after login/signup)
  useEffect(() => {
    fetchSession();
  }, [pathname, fetchSession]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
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

  const navLinks = [
    { href: '/industries', label: 'Industries', isDropdown: true },
    { href: '/news', label: 'News' },
    { href: '/reports', label: 'Reports' },
    { href: '/companies', label: 'Companies' },
    { href: '/about', label: 'About' },
  ];

  // Don't render CTA buttons until session is loaded to prevent flash
  const showCta = sessionLoaded;

  return (
    <header className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 select-none">
          {/* Axis Mark SVG Icon */}
          <svg width="32" height="30" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="nav-bar-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4aa"/>
                <stop offset="100%" stopColor="#0072ff"/>
              </linearGradient>
            </defs>
            <rect x="0"  y="30" width="8" height="14" rx="2" fill="url(#nav-bar-grad)" opacity="0.40"/>
            <rect x="10" y="22" width="8" height="22" rx="2" fill="url(#nav-bar-grad)" opacity="0.65"/>
            <rect x="20" y="8"  width="8" height="36" rx="2" fill="url(#nav-bar-grad)" opacity="1.0"/>
            <rect x="30" y="22" width="8" height="22" rx="2" fill="url(#nav-bar-grad)" opacity="0.65"/>
            <rect x="40" y="30" width="8" height="14" rx="2" fill="url(#nav-bar-grad)" opacity="0.40"/>
          </svg>

          {/* Wordmark: AMORA only */}
          <span className="text-[22px] font-bold text-white leading-none" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.10em' }}>
            AMORA
          </span>
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
                            <span className="font-medium truncate">{g.level1.label}</span>
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
                              {l2.map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/industries/${hoverL1}/${item.slug}`}
                                  className="text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-lg px-3 py-2 transition-colors"
                                >
                                  {item.name}
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showCta && isLoggedIn ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/60 transition-colors"
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isPro ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                {/* Pro badge */}
                {isPro && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/20 hidden sm:inline">
                    PRO
                  </span>
                )}
                {/* Chevron */}
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-gray-700/60 bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-black/40 overflow-hidden py-1">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-800/60">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>

                    {!isPro && (
                      <Link href="/pricing" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upgrade to Pro
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-800/60 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : showCta ? (
            <>
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
                Start Free
              </Link>
            </>
          ) : (
            // Placeholder to prevent layout shift while session loads
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 rounded-lg bg-gray-800/40" />
              <div className="w-20 h-8 rounded-lg bg-gray-800/40" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
