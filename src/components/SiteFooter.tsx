import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/60 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 shrink-0 select-none">
              {/* Axis Mark SVG Icon - 横向拉宽变胖 */}
              <svg width="34" height="32" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="footer-bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa"/>
                    <stop offset="100%" stopColor="#0072ff"/>
                  </linearGradient>
                </defs>
                {/* 5 bars - 胖版横向拉伸 */}
                <rect x="0"  y="30" width="8" height="14" rx="2" fill="url(#footer-bar-grad)" opacity="0.40"/>
                <rect x="10" y="22" width="8" height="22" rx="2" fill="url(#footer-bar-grad)" opacity="0.65"/>
                <rect x="20" y="8"  width="8" height="36" rx="2" fill="url(#footer-bar-grad)" opacity="1.0"/>
                <rect x="30" y="22" width="8" height="22" rx="2" fill="url(#footer-bar-grad)" opacity="0.65"/>
                <rect x="40" y="30" width="8" height="14" rx="2" fill="url(#footer-bar-grad)" opacity="0.40"/>
              </svg>

              {/* Wordmark - Inter字体，上下等宽对齐 */}
              <div className="flex flex-col items-start gap-[3px] leading-none">
                <span className="text-[15px] font-semibold text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.08em' }}>
                  AMORA
                </span>
                <span className="text-[8px] font-medium text-blue-400 lowercase" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.55em' }}>
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
