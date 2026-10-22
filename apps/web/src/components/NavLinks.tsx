'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/program', label: 'Program' },
  { href: '/pelacak', label: 'Pelacak' },
  { href: '/metodologi', label: 'Metodologi' },
  { href: '/metodologi#netralitas', label: 'Netralitas' },
];

export function NavLinks() {
  const pathname = usePathname();
  // ponytail: Netralitas is an anchor on /metodologi, so only Metodologi is marked active there.
  const active = (href: string) =>
    href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href);
  return (
    <nav className="nav" aria-label="Menu utama">
      <ul>
        {ITEMS.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={active(i.href) ? 'page' : undefined}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
