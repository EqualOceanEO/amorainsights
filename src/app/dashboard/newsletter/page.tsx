import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewsletterClient from './NewsletterClient';

export default async function NewsletterPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect('/dashboard');

  return <NewsletterClient />;
}
