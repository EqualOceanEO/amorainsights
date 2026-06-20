import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserCompanies, getCompanies, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import ScoringClient from './ScoringClient';

export default async function ScoringPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = parseInt((session.user as any).id ?? '0');
  let userCompanies: Awaited<ReturnType<typeof getUserCompanies>> = [];
  let platformCompanies: Awaited<ReturnType<typeof getCompanies>> = { data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 };

  try {
    [userCompanies, platformCompanies] = await Promise.all([
      getUserCompanies(userId),
      getCompanies({ pageSize: 200 }),
    ]);
  } catch { /* graceful degradation */ }

  return (
    <ScoringClient
      userCompanies={userCompanies}
      platformCompanies={platformCompanies.data}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
    />
  );
}
