import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRegion } from '@/lib/data';
import { Icon } from '@/components/Icon';
import { StatePanel } from '@/components/States';
import { RegionEmpty } from '@/components/RegionEmpty';

export default async function RegionLayout({ children, params }: LayoutProps<'/[daerah]'>) {
  const { daerah } = await params;
  const result = await getRegion(daerah);
  if (!result.ok)
    return (
      <div className="section container">
        <StatePanel
          icon="cloud-off"
          title="Data belum dapat dimuat"
          actions={
            <>
              <a className="btn btn-primary" href={`/${encodeURIComponent(daerah)}`}>
                Coba lagi
              </a>
              <Link className="link-strong" href="/">
                Beranda <Icon name="arrow" />
              </Link>
            </>
          }
        >
          <p role="alert">{result.pesan}</p>
          <p>Catatan Pelacak yang tersimpan di browser Anda tidak perlu dihapus.</p>
        </StatePanel>
      </div>
    );
  if (!result.data) notFound();
  if (result.data.statusKurasi === 'BELUM_DIKURASI') return <RegionEmpty region={result.data} />;
  return children;
}
