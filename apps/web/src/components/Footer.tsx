import { LABEL_PAGU } from '@jejakjanji/shared';
import type { Daerah } from '@jejakjanji/shared';
import { FOOTER_TEXT, KONTAK_KOREKSI } from '@/content/site';
import { NavLinks } from './NavLinks';

export function Footer({ regions }: { regions: Daerah[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-brand">JejakJanji</p>
        <NavLinks regions={regions} variant="footer" />
        <p>
          Menemukan kekeliruan? Hubungi <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>.
        </p>
        <hr className="footer-rule" />
        <p className="footer-note">
          {FOOTER_TEXT} {LABEL_PAGU}.
        </p>
      </div>
    </footer>
  );
}
