import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getDaerahList } from '@/lib/data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollMotion } from '@/components/ScrollMotion';
import './globals.css';

// Self-hosted at build time by next/font; exposed as --font-jakarta for tokens.css.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'JejakJanji', template: '%s | JejakJanji' },
  description:
    'Program prioritas RPJMD daerah, pagu indikatifnya, dan bukti pelaksanaannya. Setiap angka punya sumber, halaman, dan tanggal cek.',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const regions = await getDaerahList();
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        <a href="#konten" className="skip-link">
          Langsung ke konten
        </a>
        <Header
          regions={regions.ok ? regions.data.data : []}
          error={regions.ok ? undefined : regions.pesan}
        />
        {/* Pages own their full-width bands; each band wraps its content in .container. */}
        <main id="konten" tabIndex={-1}>
          {children}
        </main>
        <Footer regions={regions.ok ? regions.data.data : []} />
        <ScrollMotion />
      </body>
    </html>
  );
}
