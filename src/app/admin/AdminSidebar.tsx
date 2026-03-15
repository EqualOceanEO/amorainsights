'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    section: 'Content',
    items: [
      { href: '/admin/reports',    label: 'Reports',    icon: '📄' },
      { href: '/admin/scores',     label: 'Scores',     icon: '📊' },
      { href: '/admin/companies',  label: 'Companies',  icon: '🏢' },
      { href: '/admin/industries', label: 'Industries', icon: '🗂️' },
    ],
  },
  {
    section: 'Users & Growth',
    items: [
      { href: '/admin/users',       label: 'Users',       icon: '👤' },
      { href: '/admin/analytics',   label: 'Analytics',   icon: '📈' },
      { href: '/admin/subscribers', label: 'Subscribers', icon: '📬' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">AMORA</span>
          <span className="text-gray-500 text-xs font-medium">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-2 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-blue-600/20 text-blue-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800">
        <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
