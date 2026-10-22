import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'JejakJanji', template: '%s | JejakJanji' },
  description:
    'Program prioritas RPJMD DKI Jakarta 2025-2029, pagu indikatifnya, dan bukti pelaksanaannya. Setiap angka punya sumber, halaman, dan tanggal cek.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id">
      <body>
        <a href="#konten" className="skip-link">
          Langsung ke konten
        </a>
        <Header />
        <main id="konten" tabIndex={-1}>
          <div className="container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
