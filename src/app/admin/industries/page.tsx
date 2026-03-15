import { supabase, INDUSTRY_META, ALL_INDUSTRY_SLUGS } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminIndustriesPage() {
  // Get report counts per industry
  const { data: reports } = await supabase
    .from('reports')
    .select('industry_slug, is_premium, compliance_status');

  const { data: companies } = await supabase
    .from('companies')
    .select('industry_slug, is_tracked')
    .eq('is_tracked', true);

  // Aggregate
  type IndustryStat = {
    totalReports: number;
    premiumReports: number;
    freeReports: number;
    publishedReports: number;
    companies: number;
  };

  const stats: Record<string, IndustryStat> = {};
  for (const slug of ALL_INDUSTRY_SLUGS) {
    stats[slug] = { totalReports: 0, premiumReports: 0, freeReports: 0, publishedReports: 0, companies: 0 };
  }

  for (const r of reports ?? []) {
    if (!stats[r.industry_slug]) continue;
    stats[r.industry_slug].totalReports++;
    if (r.is_premium) stats[r.industry_slug].premiumReports++;
    else stats[r.industry_slug].freeReports++;
    if (r.compliance_status === 'APPROVED') stats[r.industry_slug].publishedReports++;
  }
  for (const c of companies ?? []) {
    if (!stats[c.industry_slug]) continue;
    stats[c.industry_slug].companies++;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Industries</h1>
        <p className="text-sm text-gray-400 mt-0.5">Coverage overview across 6 frontier sectors</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_INDUSTRY_SLUGS.map((slug) => {
          const meta = INDUSTRY_META[slug];
          const s = stats[slug];
          return (
            <div key={slug} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{meta.icon}</span>
                  <h3 className="text-base font-semibold text-white mt-1">{meta.name}</h3>
                  <p className="text-xs text-gray-500">{meta.name_cn}</p>
                </div>
                <Link
                  href={`/reports?industry=${slug}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View →
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.totalReports}</div>
                  <div className="text-xs text-gray-500">Total Reports</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.companies}</div>
                  <div className="text-xs text-gray-500">Companies</div>
                </div>
              </div>

              {/* Report breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Free reports</span>
                  <span className="text-gray-300">{s.freeReports}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Premium reports</span>
                  <span className="text-amber-400">{s.premiumReports}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Published</span>
                  <span className="text-green-400">{s.publishedReports}</span>
                </div>
              </div>

              {/* Progress bar: published / total */}
              {s.totalReports > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Publish rate</span>
                    <span className="text-gray-500">{Math.round((s.publishedReports / s.totalReports) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(s.publishedReports / s.totalReports) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
