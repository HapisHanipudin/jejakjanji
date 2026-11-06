import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { RequestTracker } from '@/components/RequestTracker';
import { ErrorState } from '@/components/States';
import { getProgramList, getRegion } from '@/lib/data';
import { namaProgram } from '@/lib/format';

export const metadata: Metadata = { title: 'Pelacak permohonan' };

export default async function PelacakPage({
  searchParams,
  params,
}: PageProps<'/[daerah]/pelacak'>) {
  const { daerah } = await params;
  const regionResult = await getRegion(daerah);
  if (!regionResult.ok || !regionResult.data || regionResult.data.statusKurasi !== 'AKTIF')
    return null;
  const sp = await searchParams;
  const pilih = typeof sp.program === 'string' ? sp.program : undefined;
  const programs = await getProgramList({ daerah });

  return (
    <>
      <PageHeader
        title="Pelacak permohonan informasi"
        lead="Catat permohonan yang sudah Anda kirim ke PPID dan pantau tenggat jawabannya."
      />
      <div className="section container">
        {!programs.ok && (
          <ErrorState judul="Daftar program belum bisa dimuat" pesan={programs.pesan} />
        )}
        <noscript>
          <p className="notice">Pelacak membutuhkan JavaScript karena data disimpan di browser.</p>
        </noscript>
        <RequestTracker
          region={regionResult.data}
          programs={
            programs.ok
              ? programs.data.data.map((p) => ({ kode: p.kode, nama: namaProgram(p.nama) }))
              : []
          }
          pilihAwal={pilih}
        />
      </div>
    </>
  );
}
