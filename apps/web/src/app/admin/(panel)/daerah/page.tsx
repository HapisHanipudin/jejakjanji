import type { Metadata } from 'next';
import { RegionEditForm, RegionForm } from '@/components/AdminForms';
import { ErrorState } from '@/components/States';
import { getDaerahList } from '@/lib/data';

export const metadata: Metadata = { title: 'Daerah' };

export default async function AdminRegionsPage() {
  const regions = await getDaerahList();
  if (!regions.ok) return <ErrorState pesan={regions.pesan} />;
  return (
    <>
      <h1>Daerah</h1>
      <p className="lead">
        Status &quot;aktif&quot; menampilkan data daerah ke publik. Belum dikurasi berarti cakupan
        data belum disiapkan, bukan penilaian atas daerahnya.
      </p>
      <div className="admin-stack">
        {regions.data.data.map((r) => (
          <RegionEditForm key={`${r.kode}-${r.statusKurasi}-${r.nama}`} region={r} />
        ))}
        <RegionForm regions={regions.data.data} />
      </div>
    </>
  );
}
