'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Plays a one-shot entrance for `[data-reveal]` blocks the first time they scroll into view.
 * Blocks are fully drawn by default (no JS, print, screenshots, reduced motion); blocks
 * already on screen when the page opens are left alone. CSS owns the actual motion.
 */
export function ScrollMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const waiting = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= innerHeight || r.bottom <= 0;
    });
    if (!waiting.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = 'play';
          io.unobserve(e.target);
        }
      },
      { threshold: 0.25 },
    );
    waiting.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
