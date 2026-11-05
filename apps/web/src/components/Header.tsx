'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { NavLinks } from './NavLinks';
import { RegionPicker } from './RegionPicker';
import type { Daerah } from '@jejakjanji/shared';

export function Header({ regions, error }: { regions: Daerah[]; error?: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    if (!marker.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setFloating(!entry.isIntersecting);
    });
    observer.observe(marker.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span ref={marker} className="header-scroll-marker" aria-hidden="true" />
      <header className="site-header" data-floating={floating || undefined}>
        <div className="header-surface">
          <div className="container">
            <Link href="/" className="logo">
              <span className="logo-mark" aria-hidden="true">
                J
              </span>
              JejakJanji
            </Link>
            <RegionPicker regions={regions} error={error} />
            <NavLinks regions={regions} />
          </div>
        </div>
      </header>
    </>
  );
}
