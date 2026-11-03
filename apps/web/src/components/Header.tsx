import Link from 'next/link';
import { NavLinks } from './NavLinks';

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true">
            J
          </span>
          JejakJanji
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
