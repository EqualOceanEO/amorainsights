import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompanies, getUserCompanies, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import IndustryMappingClient from './IndustryMappingClient';

interface MappedCompany {
  id: number;
  name: string;
  name_cn: string | null;
  industry_slug: IndustrySlug;
  sub_sector: string | null;
  country: string;
  hq_city: string | null;
  hq_province: string | null;
  funding_stage: string | null;
  amora_total_score: number | null;
  source: 'platform' | 'user';
  description?: string | null;
}

export default async function IndustryMappingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = parseInt((session.user as any).id ?? '0');
  let platformCompanies: Awaited<ReturnType<typeof getCompanies>> = { data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 };
  let userCompanies: Awaited<ReturnType<typeof getUserCompanies>> = [];

  try {
    [platformCompanies, userCompanies] = await Promise.all([
      getCompanies({ pageSize: 200 }),
      getUserCompanies(userId),
    ]);
  } catch { /* graceful degradation */ }

  // Merge all companies for the mapping view
  const allCompanies: MappedCompany[] = [
    ...platformCompanies.data.map((c) => ({
      id: c.id, name: c.name, name_cn: c.name_cn, industry_slug: c.industry_slug,
      sub_sector: c.sub_sector, country: c.country, hq_city: c.hq_city,
      hq_province: c.hq_province, funding_stage: c.funding_stage,
      amora_total_score: c.amora_total_score, source: 'platform' as const,
    })),
    ...userCompanies.map((c) => ({
      id: c.id, name: c.name, name_cn: c.name_cn, industry_slug: c.industry_slug,
      sub_sector: c.sub_sector, country: c.country, hq_city: c.hq_city,
      hq_province: c.hq_province, funding_stage: c.funding_stage,
      amora_total_score: null, source: 'user' as const,
    })),
  ];

  return (
    <IndustryMappingClient
      companies={allCompanies}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
    />
  );
}
