const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#]\w+)=["']?(.*?)["']?\s*$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL;
const SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', SUPABASE_URL);
console.log('Key prefix:', SERVICE_KEY ? SERVICE_KEY.substring(0, 20) + '...' : 'missing');

async function main() {
  const freeHtml = fs.readFileSync('public/HRI-2026-Free-Preview-v2.0-en.html', 'utf8');
  const proHtml = fs.readFileSync('public/HRI-2026-AMORA-Report-v5.0-en.html', 'utf8');

  console.log('Free HTML size:', freeHtml.length);
  console.log('Pro HTML size:', proHtml.length);

  // Update report id=44
  const res1 = await fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.44', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      html_content: proHtml,
      html_free: freeHtml
    })
  });

  if (!res1.ok) {
    const err = await res1.text();
    console.error('UPDATE FAILED:', res1.status, err.substring(0, 300));
  } else {
    console.log('UPDATE OK:', res1.status);
  }
}

main().catch(e => console.error(e));
