'use client';

import { useEffect, useState, useCallback } from 'react';

interface SendResult {
  status: string;
  sent: number;
  failed: number;
  total: number;
}

export default function NewsletterClient() {
  const [stats, setStats] = useState<{ total: number; confirmed: number; unsubscribed: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState('');

  // Form
  const [subject, setSubject] = useState('');
  const [issueNumber, setIssueNumber] = useState('1');
  const [dateLabel, setDateLabel] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });
  const [previewText, setPreviewText] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [closing, setClosing] = useState('');

  // Sections (up to 6 tracks)
  const [sections, setSections] = useState([
    { track: 'AI & LLMs', icon: '🤖', headline: '', body: '', link: '', link_label: '' },
    { track: 'Life Sciences', icon: '🧬', headline: '', body: '', link: '', link_label: '' },
    { track: 'Green Tech', icon: '⚡', headline: '', body: '', link: '', link_label: '' },
    { track: 'Smart Mfg.', icon: '🏭', headline: '', body: '', link: '', link_label: '' },
    { track: 'Space', icon: '🚀', headline: '', body: '', link: '', link_label: '' },
    { track: 'Materials', icon: '🔬', headline: '', body: '', link: '', link_label: '' },
  ]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscribers');
      if (res.ok) {
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          confirmed: data.confirmed ?? 0,
          unsubscribed: data.unsubscribed ?? 0,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  function updateSection(idx: number, field: string, value: string) {
    setSections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function handleSend(testOnly: boolean) {
    if (testOnly && !testEmail.trim()) {
      setError('Please enter a test email address.');
      return;
    }

    const filledSections = sections.filter((s) => s.headline.trim());
    if (!subject.trim() || filledSections.length === 0) {
      setError('Subject and at least one section headline are required.');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          issue_number: parseInt(issueNumber) || 1,
          date_label: dateLabel.trim(),
          preview_text: previewText.trim(),
          sections: filledSections,
          closing: closing.trim() || undefined,
          test_email: testOnly ? testEmail.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (!testOnly) loadStats();
      } else {
        setError(data.error ?? 'Failed to send newsletter.');
      }
    } catch {
      setError('Network error.');
    }

    setSending(false);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <p className="text-gray-400 mt-1">Compose and send AMORA Weekly issues.</p>
      </div>

      {/* Subscriber stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-400' },
            { label: 'Unsubscribed', value: stats.unsubscribed, color: 'text-red-400' },
            { label: 'Active', value: stats.total - stats.unsubscribed, color: 'text-blue-400' },
          ].map((k) => (
            <div key={k.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error / result */}
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm bg-red-900/30 text-red-300 border border-red-800">
          {error}
        </div>
      )}
      {result && (
        <div className="px-4 py-3 rounded-lg text-sm bg-green-900/30 text-green-300 border border-green-800">
          {result.status === 'no_recipients'
            ? 'No active subscribers found.'
            : `Sent to ${result.sent} recipients (${result.failed} failed) out of ${result.total} total.`}
        </div>
      )}

      {/* Compose form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Compose Issue</h2>

        {/* Meta fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="AMORA Weekly — Apr 5, 2026"
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Issue #</label>
            <input
              type="text"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Date Label</label>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Preview Text</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Shown in inbox preview"
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sections */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Track Sections</label>
          <div className="space-y-4">
            {sections.map((sec, idx) => (
              <div key={idx} className="border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sec.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{sec.track}</span>
                </div>
                <input
                  type="text"
                  value={sec.headline}
                  onChange={(e) => updateSection(idx, 'headline', e.target.value)}
                  placeholder="Headline"
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  value={sec.body}
                  onChange={(e) => updateSection(idx, 'body', e.target.value)}
                  placeholder="2-4 sentences..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sec.link}
                    onChange={(e) => updateSection(idx, 'link', e.target.value)}
                    placeholder="Link URL (optional)"
                    className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={sec.link_label}
                    onChange={(e) => updateSection(idx, 'link_label', e.target.value)}
                    placeholder="Link text"
                    className="w-40 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Closing Note (optional)</label>
          <textarea
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            placeholder="A brief closing remark..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Test email */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Test Email (dry run)</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com — only send to this address"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSend(true)}
            disabled={sending || !testEmail.trim()}
            className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-lg transition"
          >
            {sending ? 'Sending...' : 'Send Test'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Send this newsletter to ALL active subscribers? This cannot be undone.')) {
                handleSend(false);
              }
            }}
            disabled={sending}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition"
          >
            {sending ? 'Sending...' : 'Send to All'}
          </button>
        </div>
      </div>
    </div>
  );
}
