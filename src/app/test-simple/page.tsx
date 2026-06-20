'use client';

import { useState } from 'react';

export default function TestSimplePage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px' }}>
      <h1>Test Simple Page</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>

      <hr style={{ margin: '20px 0', borderColor: '#333' }} />

      <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
        <h2>Direct HTML Render</h2>
        <div style={{ background: '#171717', padding: '20px', borderRadius: '6px' }}>
          <h3 style={{ color: '#fff' }}>Test Content</h3>
          <p style={{ color: '#a3a3a3' }}>This is directly rendered HTML, not in an iframe.</p>
          <p style={{ color: '#a3a3a3' }}>If you can see this, React is working!</p>
        </div>
      </div>

      <hr style={{ margin: '20px 0', borderColor: '#333' }} />

      <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
        <h2>dangerouslySetInnerHTML</h2>
        <div
          style={{ background: '#171717', padding: '20px', borderRadius: '6px' }}
          dangerouslySetInnerHTML={{
            __html: `
              <h3 style="color: #fff">Injected HTML</h3>
              <p style="color: #a3a3a3">This is HTML injected via dangerouslySetInnerHTML.</p>
            `
          }}
        />
      </div>
    </div>
  );
}
