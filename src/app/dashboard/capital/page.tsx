import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanies, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import CapitalClient from './CapitalClient';

export default async function CapitalPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  let companies: Awaited<ReturnType<typeof getCompanies>> = { data: [], total: 0, page: 1, pageSize: 200, totalPages: 0 };

  try {
    companies = await getCompanies({ pageSize: 200 });
  } catch { /* graceful degradation */ }

  return (
    <CapitalClient
      companies={companies.data}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
    />
  );
}
