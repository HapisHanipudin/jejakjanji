import { LABEL_PAGU, type Daerah } from '@jejakjanji/shared';
import { FOOTER_TEXT, KONTAK_KOREKSI } from '@/content/site';
import { FooterNav } from './NavLinks';

/** Figma JJ/Footer 143:51680 / 143:51791: wordmark, quick links, contact, divider, neutrality. */
export function Footer({ regions }: { regions: Daerah[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-brand">JejakJanji</p>
        <FooterNav regions={regions} />
        <p>
          Menemukan kekeliruan? <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>
        </p>
        <hr className="footer-rule" />
        <p className="footer-note">
          {FOOTER_TEXT} {LABEL_PAGU}.
        </p>
      </div>
    </footer>
  );
}
