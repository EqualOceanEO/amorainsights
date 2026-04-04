import Link from 'next/link';
import { INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import { getLevel2Options, INDUSTRY_COLORS } from '@/lib/industries';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function IndustriesIndexPage() {
  const industries = ALL_INDUSTRY_SLUGS.map((slug) => ({
    slug,
    ...INDUSTRY_META[slug],
    subSectors: getLevel2Options(slug),
    colorClass: INDUSTRY_COLORS[slug],
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/industries" />

      {/* Hero */}
      <section className="border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">
            Coverage
          </span>
          <h1 className="text-3xl font-bold text-white mb-3">Six Frontier Industries</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Deep research, company tracking, and daily intelligence across the sectors defining the next decade.
          </p>
        </div>
      </section>

      {/* Industry grid */}
      <main className="max-w-7xl mx-auto px-5 py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-6 flex flex-col transition"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{ind.icon}</span>
                <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                  {ind.name}
                </h2>
              </div>

              {/* Sub-sectors */}
              <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                {ind.subSectors.slice(0, 4).map((item) => (
                  <span
                    key={item.slug}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${ind.colorClass}`}
                  >
                    {item.name}
                  </span>
                ))}
                {ind.subSectors.length > 4 && (
                  <span className="text-[10px] text-gray-600 px-2 py-0.5">
                    +{ind.subSectors.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-800/60">
                <span className="text-xs text-gray-600">{ind.subSectors.length} sub-sectors</span>
                <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium transition">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
