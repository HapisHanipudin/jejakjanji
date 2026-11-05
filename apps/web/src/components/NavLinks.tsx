'use client';

import Link from 'next/link';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { usePathname } from 'next/navigation';
import type { Daerah } from '@jejakjanji/shared';
import { regionForPath, regionPath } from '@/lib/regions';

const ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/program', label: 'Program' },
  { href: '/pelacak', label: 'Pelacak' },
  { href: '/metodologi', label: 'Metodologi' },
];

export function NavLinks({ regions, children }: { regions: Daerah[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const region = regionForPath(pathname, regions);
  const items = region
    ? ITEMS.map((item) => ({
        ...item,
        href: regionPath(region.slug, item.href === '/' ? '' : item.href),
      }))
    : [
        { href: '/', label: 'Beranda' },
        { href: '/metodologi', label: 'Metodologi' },
      ];
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  return (
    <>
      <button
        ref={toggle}
        type="button"
        className="btn nav-toggle"
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>
      <div
        id={menuId}
        className="header-menu"
        data-open={open || undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        {children}
        <nav className="nav" aria-label="Menu utama">
          <ul>
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    (i.label === 'Beranda' ? pathname === i.href : active(i.href))
                      ? 'page'
                      : undefined
                  }
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
