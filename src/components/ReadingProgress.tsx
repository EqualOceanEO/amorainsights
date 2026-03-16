'use client';

import { useEffect, useState } from 'react';

/**
 * ReadingProgress — sticky top progress bar that tracks scroll depth.
 * Mounts a fixed `#reading-progress` bar at the very top of the viewport.
 * CSS is declared in globals.css so it renders instantly without FOUC.
 */
export default function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const scrollTop = window.scrollY || el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) {
        setWidth(100);
        return;
      }
      setWidth(Math.min(100, (scrollTop / scrollHeight) * 100));
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      id="reading-progress"
      style={{ width: `${width}%` }}
      aria-hidden="true"
    />
  );
}
