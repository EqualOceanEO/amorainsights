import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserWatchlist, getRecentNewsItems, INDUSTRY_META, type IndustrySlug } from '@/lib/db';
import AlertsClient from './AlertsClient';

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = parseInt((session.user as any).id ?? '0');
  let watchlist: Awaited<ReturnType<typeof getUserWatchlist>> = [];
  let recentNews: Awaited<ReturnType<typeof getRecentNewsItems>> = [];

  try {
    [watchlist, recentNews] = await Promise.all([
      getUserWatchlist(userId),
      getRecentNewsItems(20),
    ]);
  } catch { /* graceful degradation */ }

  return (
    <AlertsClient
      watchlist={watchlist}
      recentNews={recentNews}
      industryMeta={INDUSTRY_META}
    />
  );
}
