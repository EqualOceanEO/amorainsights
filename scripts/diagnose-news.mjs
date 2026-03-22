import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  const start = Date.now();
  console.log('Testing news_items table query...');

  // 1. Count records
  const { count, error: countError } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError.message);
  } else {
    console.log(`Total news_items: ${count}`);
  }

  console.log(`Count query took ${Date.now() - start}ms`);

  // 2. Simple fetch without count
  const start2 = Date.now();
  const { data, error } = await supabase
    .from('news_items')
    .select('id, title, published_at')
    .order('published_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Fetch error:', error.message);
  } else {
    console.log(`\nTop 5 recent news:`);
    data.forEach(r => console.log(`  ID: ${r.id}, ${r.published_at}: ${r.title?.slice(0,50)}`));
  }

  console.log(`Fetch query took ${Date.now() - start2}ms`);

  // 3. Check if slug column exists
  const start3 = Date.now();
  const { data: schemaTest, error: schemaError } = await supabase
    .from('news_items')
    .select('id, slug')
    .limit(1);

  if (schemaError) {
    console.log(`\nnews_items.slug: NOT EXISTS (${schemaError.message})`);
  } else {
    console.log(`\nnews_items.slug: EXISTS, value: ${schemaTest[0]?.slug}`);
  }

  console.log(`Schema check took ${Date.now() - start3}ms`);
}

diagnose();
