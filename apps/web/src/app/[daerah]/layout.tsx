import { notFound } from 'next/navigation';
import { getRegion } from '@/lib/data';
import { ErrorState } from '@/components/States';
import { RegionEmpty } from '@/components/RegionEmpty';

export default async function RegionLayout({ children, params }: LayoutProps<'/[daerah]'>) {
  const { daerah } = await params;
  const result = await getRegion(daerah);
  if (!result.ok)
    return (
      <div className="section container">
        <ErrorState judul="Daerah belum bisa dimuat" pesan={result.pesan} />
      </div>
    );
  if (!result.data) notFound();
  if (result.data.statusKurasi === 'BELUM_DIKURASI') return <RegionEmpty region={result.data} />;
  return children;
}
