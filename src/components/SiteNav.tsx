'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SiteNavProps {
  /** Optional: override active path detection (for SSR pages) */
  activePath?: string;
}

export default function SiteNav({ activePath }: SiteNavProps) {
  const pathname = usePathname();
  const active = activePath ?? pathname;

  function isActive(href: string) {
    if (href === '/') return active === '/';
    return active.startsWith(href);
  }

  return (
    <header className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight shrink-0 select-none">
          Amora<span className="text-blue-400">Insights</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/reports', label: 'Reports' },
            { href: '/companies', label: 'Companies' },
            { href: '/news', label: 'News' },
            { href: '/about', label: 'About' },
          ].map(({ href, label }) => (
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
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
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
