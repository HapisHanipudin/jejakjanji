import type { Metadata } from 'next';
import Link from 'next/link';
import { JAKARTA } from '@jejakjanji/shared';
import { EmptyState, ErrorState } from '@/components/States';
import { getDaerahList, getProgramList } from '@/lib/data';
import { namaProgram } from '@/lib/format';

export const metadata: Metadata = { title: 'Bukti program' };

const TEKS = { ada: 'Ada', belum_diketahui: 'Belum diketahui' } as const;

export default async function AdminEvidenceListPage({ searchParams }: PageProps<'/admin/bukti'>) {
  const sp = await searchParams;
  const daerah = (Array.isArray(sp.daerah) ? sp.daerah[0] : sp.daerah) || JAKARTA.slug;
  const [regions, programs] = await Promise.all([getDaerahList(), getProgramList({ daerah })]);

  return (
    <>
      <h1>Bukti program</h1>
      {regions.ok && regions.data.data.length > 1 && (
        <ul className="admin-nav" aria-label="Pilih daerah">
          {regions.data.data.map((r) => (
            <li key={r.kode}>
              <Link
                href={`/admin/bukti?daerah=${r.slug}`}
                aria-current={r.slug === daerah ? 'page' : undefined}
              >
                {r.nama}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!programs.ok ? (
        <ErrorState pesan={programs.pesan} />
      ) : programs.data.data.length === 0 ? (
        <EmptyState>Belum ada program untuk daerah ini. Impor CSV lebih dulu.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table-plain">
            <caption className="sr-only">Status bukti per program</caption>
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Program</th>
                <th scope="col">Rencana</th>
                <th scope="col">Anggaran</th>
                <th scope="col">Pelaksanaan</th>
              </tr>
            </thead>
            <tbody>
              {programs.data.data.map((p) => (
                <tr key={p.kode}>
                  <td className="kode">{p.kode}</td>
                  <th scope="row">
                    <Link href={`/admin/bukti/${daerah}/${p.kode}`}>{namaProgram(p.nama)}</Link>
                  </th>
                  <td>{TEKS[p.statusBukti.rencana]}</td>
                  <td>{TEKS[p.statusBukti.anggaran]}</td>
                  <td>{TEKS[p.statusBukti.pelaksanaan]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
