// End-to-end test: call the actual subscribe API on production
const EMAIL = 'test-amora-' + Date.now() + '@resend.dev';

console.log('Testing with email:', EMAIL);

const res = await fetch('https://amorainsights.com/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, source: 'e2e_test' })
}).then(r => r.json());

console.log('=== PRODUCTION API RESPONSE ===');
console.log(JSON.stringify(res, null, 2));
