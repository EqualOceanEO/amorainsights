// Attempt to call Supabase's internal query endpoint with service_role key
// This is the same endpoint used by the Supabase Studio dashboard

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';

// Supabase Studio uses the pg-meta API endpoint internally
// This is exposed at: /pg/... for self-hosted, and for cloud projects it's proxied
// The actual query endpoint accessible with service_role is via the REST API RPC path

// Try all possible endpoints
const ENDPOINTS = [
  `${SUPABASE_URL}/pg/query`,                    // self-hosted pg-meta
  `${SUPABASE_URL}/rest/v1/rpc/query`,           // custom RPC
  `${SUPABASE_URL}/graphql/v1`,                  // GraphQL
  `https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query`, // Management API (needs PAT)
];

const testSql = 'SELECT column_name FROM information_schema.columns WHERE table_name = \'news_items\' ORDER BY ordinal_position';

async function tryEndpoint(url, bodyFn) {
  const body = bodyFn(testSql);
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  console.log(`${url}: ${resp.status} -> ${text.substring(0, 200)}`);
  return { status: resp.status, body: text };
}

(async () => {
  for (const endpoint of ENDPOINTS) {
    await tryEndpoint(endpoint, sql => ({ query: sql }));
    await tryEndpoint(endpoint, sql => ({ sql }));
  }
})();
