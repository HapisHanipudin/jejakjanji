import Link from 'next/link';
import { NavLinks } from './NavLinks';

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        {/* Logo placeholder: plain text, replace freely. */}
        <Link href="/" className="logo">
          JejakJanji
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
