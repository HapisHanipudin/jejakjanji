import type { Metadata } from 'next';
import { SourceForm } from '@/components/AdminForms';
import { EmptyState, ErrorState } from '@/components/States';
import { getDaerahList, getSumberList } from '@/lib/data';
import { formatTanggal } from '@/lib/format';

export const metadata: Metadata = { title: 'Dokumen sumber' };

export default async function AdminSourcesPage() {
  const regions = await getDaerahList();
  if (!regions.ok) return <ErrorState pesan={regions.pesan} />;
  const lists = await Promise.all(
    regions.data.data.map(async (r) => ({ r, docs: await getSumberList(r.slug) })),
  );
  const docs = lists.flatMap(({ r, docs }) =>
    docs.ok ? docs.data.data.map((d) => ({ ...d, daerah: r.nama })) : [],
  );

  return (
    <>
      <h1>Dokumen sumber</h1>
      <p className="lead">Dokumen resmi yang dirujuk angka dan bukti. Saat ini RPJMD dan RKPD.</p>
      {lists.map(({ r, docs }) =>
        docs.ok ? null : <ErrorState key={r.kode} judul={r.nama} pesan={docs.pesan} />,
      )}
      {docs.length === 0 ? (
        <EmptyState>Belum ada dokumen sumber yang tampil.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table-plain">
            <caption className="sr-only">Daftar dokumen sumber</caption>
            <thead>
              <tr>
                <th scope="col">Dokumen</th>
                <th scope="col">Daerah</th>
                <th scope="col">Jenis</th>
                <th scope="col">Versi</th>
                <th scope="col">Diperiksa</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <th scope="row">{d.url ? <a href={d.url}>{d.title}</a> : d.title}</th>
                  <td>{d.daerah}</td>
                  <td>{d.type}</td>
                  <td>{d.version}</td>
                  <td>{formatTanggal(d.checkedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 'var(--space-5)' }}>
        <SourceForm regions={regions.data.data} />
      </div>
    </>
  );
}
