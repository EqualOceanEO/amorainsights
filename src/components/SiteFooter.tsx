import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/60 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-base font-bold tracking-tight">
              Amora<span className="text-blue-400">Insights</span>
            </Link>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xs">
              Mapping frontier industries. Measuring applications. Benchmarking the world.
            </p>
          </div>

          {/* Research */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Research</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/reports" className="hover:text-white transition">All Reports</Link></li>
              <li><Link href="/reports?industry=ai" className="hover:text-white transition">AI & LLMs</Link></li>
              <li><Link href="/reports?industry=life-sciences" className="hover:text-white transition">Life Sciences</Link></li>
              <li><Link href="/reports?industry=green-tech" className="hover:text-white transition">Green Tech</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Get Started</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {year} AmoraInsights. All rights reserved.
          </p>
          <p className="text-xs text-gray-700 text-center sm:text-right max-w-xl">
            For informational purposes only. Not financial, legal, or investment advice.
            All data sourced from publicly available information. AMORA scores reflect
            internal analytical models and do not constitute endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
}
