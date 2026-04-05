'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardSidebarProps {
  isAdmin: boolean;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '📊', exact: true },
  { href: '/dashboard/account', label: 'My Account', icon: '👤' },
];

const ADMIN_ITEMS = [
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: '📬' },
  { href: '/admin', label: 'Admin Panel', icon: '🛡️', external: true },
];

export default function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex-col hidden lg:flex">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">AMORA</span>
          <span className="text-gray-500 text-xs font-medium">Dashboard</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="px-2 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
            My Space
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div>
            <p className="px-2 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              Admin Tools
            </p>
            <ul className="space-y-0.5">
              {ADMIN_ITEMS.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                      <svg className="w-3 h-3 ml-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600/20 text-blue-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800">
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </aside>
  );
}
