import Link from 'next/link';
import { NavLinks } from './NavLinks';
import { RegionPicker } from './RegionPicker';
import type { Daerah } from '@jejakjanji/shared';

export function Header({ regions, error }: { regions: Daerah[]; error?: string }) {
  return (
    <header className="site-header">
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
    </header>
  );
}
