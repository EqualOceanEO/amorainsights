import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqppcuccqkxhhrvndsil.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.ZUL3U3nAD9U7M3YR5T3C8d7vV93J0z9F1GvR4C9qQk8'
);

const { data, error } = await sb
  .from('reports')
  .select('id, title, slug, is_premium, report_format, html_content, summary')
  .filter('report_format', 'in', '(html,h5_embed)')
  .limit(10);

console.log('H5 reports:', JSON.stringify(data, null, 2));
console.log('\nError:', error);
