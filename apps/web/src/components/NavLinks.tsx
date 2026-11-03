'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Daerah } from '@jejakjanji/shared';
import { regionForPath, regionPath } from '@/lib/regions';

const ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/program', label: 'Program' },
  { href: '/pelacak', label: 'Pelacak' },
  { href: '/metodologi', label: 'Metodologi' },
];

export function NavLinks({ regions }: { regions: Daerah[] }) {
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
    <nav className="nav" aria-label="Menu utama">
      <ul>
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={
                (i.label === 'Beranda' ? pathname === i.href : active(i.href)) ? 'page' : undefined
              }
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
