import { LABEL_PAGU } from '@jejakjanji/shared';
import { FOOTER_TEXT, KONTAK_KOREKSI } from '@/content/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-brand">JejakJanji</p>
        <p>{FOOTER_TEXT}</p>
        <p>
          Menemukan kekeliruan? Hubungi <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>.{' '}
          {LABEL_PAGU}.
        </p>
      </div>
    </footer>
  );
}
