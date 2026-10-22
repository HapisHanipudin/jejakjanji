import { FOOTER_TEXT } from '@/content/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>{FOOTER_TEXT}</p>
      </div>
    </footer>
  );
}
