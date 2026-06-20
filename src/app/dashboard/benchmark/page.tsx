import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserCompanies, getCompanies, getUserBenchmarkGroups, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import BenchmarkClient from './BenchmarkClient';

export default async function BenchmarkPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = parseInt((session.user as any).id ?? '0');
  let userCompanies: Awaited<ReturnType<typeof getUserCompanies>> = [];
  let platformCompanies: Awaited<ReturnType<typeof getCompanies>> = { data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 };
  let benchmarkGroups: Awaited<ReturnType<typeof getUserBenchmarkGroups>> = [];

  try {
    [userCompanies, platformCompanies, benchmarkGroups] = await Promise.all([
      getUserCompanies(userId),
      getCompanies({ pageSize: 200 }),
      getUserBenchmarkGroups(userId),
    ]);
  } catch { /* graceful degradation */ }

  return (
    <BenchmarkClient
      userCompanies={userCompanies}
      platformCompanies={platformCompanies.data}
      benchmarkGroups={benchmarkGroups}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
      userId={userId}
    />
  );
}
