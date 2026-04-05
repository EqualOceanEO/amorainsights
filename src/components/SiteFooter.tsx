import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/60 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none">
              {/* Axis Mark SVG Icon */}
              <svg width="28" height="34" viewBox="0 0 45 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="footer-bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa"/>
                    <stop offset="100%" stopColor="#0072ff"/>
                  </linearGradient>
                </defs>
                <rect x="0"  y="34" width="7" height="18" rx="2" fill="url(#footer-bar-grad)" opacity="0.40"/>
                <rect x="9"  y="24" width="7" height="28" rx="2" fill="url(#footer-bar-grad)" opacity="0.65"/>
                <rect x="18" y="8"  width="7" height="44" rx="2" fill="url(#footer-bar-grad)" opacity="1.0"/>
                <rect x="27" y="24" width="7" height="28" rx="2" fill="url(#footer-bar-grad)" opacity="0.65"/>
                <rect x="36" y="34" width="7" height="18" rx="2" fill="url(#footer-bar-grad)" opacity="0.40"/>
                <circle cx="21.5" cy="5" r="3" fill="#00d4aa" opacity="0.75"/>
              </svg>

              {/* Wordmark */}
              <div className="flex flex-col items-start gap-px leading-none">
                <span className="text-[14px] font-bold tracking-tight text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.025em' }}>
                  AMORA
                </span>
                <span className="text-[7px] font-medium tracking-[0.12em] uppercase text-blue-400" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  insights
                </span>
              </div>
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
