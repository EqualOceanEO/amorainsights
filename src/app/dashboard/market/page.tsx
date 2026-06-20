import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanies, getDashboardStats, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import MarketClient from './MarketClient';

export default async function MarketPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  let companies: Awaited<ReturnType<typeof getCompanies>> = { data: [], total: 0, page: 1, pageSize: 200, totalPages: 0 };
  let stats = { reportsCount: 0, companiesCount: 0, newsTodayCount: 0 };

  try {
    [companies, stats] = await Promise.all([
      getCompanies({ pageSize: 200 }),
      getDashboardStats(),
    ]);
  } catch { /* graceful degradation */ }

  return (
    <MarketClient
      companies={companies.data}
      stats={stats}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
    />
  );
}
