/**
 * Execute schema via Supabase Management API (SQL editor endpoint)
 * Uses service_role JWT to hit /rest/v1/rpc or the pg-meta endpoint
 */
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
console.log('Project ref:', projectRef);

// Use pg-meta API to run SQL (available via supabase management API)
const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const response = await fetch(mgmtUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

const text = await response.text();
console.log('Status:', response.status);
console.log('Response:', text.slice(0, 500));
