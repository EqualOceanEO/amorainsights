import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getReports, getReportCountByIndustry, INDUSTRY_META, ALL_INDUSTRY_SLUGS, type IndustrySlug } from '@/lib/db';
import ResearchClient from './ResearchClient';

export default async function ResearchPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  let reports: Awaited<ReturnType<typeof getReports>> = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  let reportsByIndustry: Record<string, number> = {};

  try {
    [reports, reportsByIndustry] = await Promise.all([
      getReports({ pageSize: 50 }),
      getReportCountByIndustry(),
    ]);
  } catch { /* graceful degradation */ }

  return (
    <ResearchClient
      reports={reports.data}
      reportsByIndustry={reportsByIndustry}
      industryMeta={INDUSTRY_META}
      allIndustrySlugs={ALL_INDUSTRY_SLUGS}
    />
  );
}
