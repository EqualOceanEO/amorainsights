const KEY = 're_6r4LL2Fx_3ehX7E2Lrk7eixkbZSHevegh';

// Test send from amorainsights.com
const send = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'AMORA Insights <noreply@amorainsights.com>',
    to: ['test@resend.dev'],
    subject: 'AMORA domain verification test',
    html: '<p>If you see this, amorainsights.com is verified on Resend.</p>'
  })
}).then(r => r.json());

console.log('=== SEND RESULT ===');
console.log(JSON.stringify(send, null, 2));
