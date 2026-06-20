'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// ── Lightweight session ID (client-side, persisted in sessionStorage) ──────
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_amora_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_amora_sid', sid);
  }
  return sid;
}

// ── UTM params from initial landing (persisted for the session) ────────────
function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const stored = sessionStorage.getItem('_amora_utm');
  if (stored) return JSON.parse(stored);
  const sp = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const v = sp.get(k);
    if (v) utms[k] = v;
  }
  if (Object.keys(utms).length) {
    sessionStorage.setItem('_amora_utm', JSON.stringify(utms));
  }
  return utms;
}

// ── Core tracking function ─────────────────────────────────────────────────
async function trackPageView(path: string, referrer: string, durationSec?: number) {
  const utms = getUtmParams();
  await fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      referrer,
      session_id: getSessionId(),
      duration_sec: durationSec,
      ...utms,
    }),
    keepalive: true,
  }).catch(() => {});
}

// ── Global event tracker (callable anywhere in the app) ───────────────────
export async function trackEvent(
  eventName: string,
  options?: {
    category?: string;
    properties?: Record<string, unknown>;
    path?: string;
  }
) {
  await fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_category: options?.category,
      properties: options?.properties,
      path: options?.path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
      session_id: getSessionId(),
    }),
    keepalive: true,
  }).catch(() => {});
}

// Make trackEvent available on window for non-React contexts
if (typeof window !== 'undefined') {
  // @ts-expect-error global extension
  window.__amoraTrack = trackEvent;
}

// ── Provider component ─────────────────────────────────────────────────────
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enterTimeRef = useRef<number>(Date.now());
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');

    if (currentPath === prevPathRef.current) return;

    // Record duration on previous page before tracking new one
    const now = Date.now();
    if (prevPathRef.current) {
      const durationSec = Math.round((now - enterTimeRef.current) / 1000);
      // Update duration of previous view (fire-and-forget)
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: prevPathRef.current,
          session_id: getSessionId(),
          duration_sec: durationSec,
          _update_duration: true,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    enterTimeRef.current = now;
    prevPathRef.current = currentPath;

    trackPageView(currentPath, typeof document !== 'undefined' ? document.referrer : '');
  }, [pathname, searchParams]);

  // Track page unload to capture final duration
  useEffect(() => {
    const handleUnload = () => {
      const durationSec = Math.round((Date.now() - enterTimeRef.current) / 1000);
      navigator.sendBeacon?.(
        '/api/analytics/pageview',
        JSON.stringify({
          path: pathname,
          session_id: getSessionId(),
          duration_sec: durationSec,
          referrer: document.referrer,
          ...getUtmParams(),
        })
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return (
    <>
      {children}
      {/* Vercel official analytics — no config needed, just works */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
