import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

// Self-hosted at build time by next/font; exposed as --font-jakarta for tokens.css.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'JejakJanji', template: '%s | JejakJanji' },
  description:
    'Program prioritas RPJMD DKI Jakarta 2025-2029, pagu indikatifnya, dan bukti pelaksanaannya. Setiap angka punya sumber, halaman, dan tanggal cek.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        <a href="#konten" className="skip-link">
          Langsung ke konten
        </a>
        <Header />
        {/* Pages own their full-width bands; each band wraps its content in .container. */}
        <main id="konten" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
