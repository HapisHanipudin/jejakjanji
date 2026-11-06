'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const DESKTOP = '(min-width: 1025px)';
/** Gap kept above the sticky panel: var(--space-5), 1.5rem. */
const TOP_REM = 1.5;

/**
 * Side column that sticks on desktop only while it fits in the window. A sticky column taller than
 * the window would hide its lower part until the page ends, and an inner scrollbar is not wanted,
 * so in that case it stays in normal flow and scrolls with the page. Without JavaScript it also
 * stays in normal flow. The CSS (`[data-sticky='true']`) does the sticking; this only decides when.
 */
export function StickyAside({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia(DESKTOP);
    const update = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const fits = desktop.matches && el.offsetHeight + 2 * TOP_REM * rem <= window.innerHeight;
      el.dataset.sticky = fits ? 'true' : 'false';
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    desktop.addEventListener('change', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
