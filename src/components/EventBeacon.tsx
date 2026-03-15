'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/components/AnalyticsProvider';

/**
 * Fires a single analytics event on mount.
 * Use this in Server Components that need to emit client-side events.
 */
export function EventBeacon({
  eventName,
  category,
  properties,
}: {
  eventName: string;
  category?: string;
  properties?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(eventName, { category, properties });
  }, [eventName, category, properties]);

  return null;
}
