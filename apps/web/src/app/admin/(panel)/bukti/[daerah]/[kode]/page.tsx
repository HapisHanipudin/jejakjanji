import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionButton, EvidenceForm } from '@/components/AdminForms';
import { EmptyState, ErrorState } from '@/components/States';
import { getProgram, getSumberList } from '@/lib/data';
import { formatTanggal, namaProgram } from '@/lib/format';

export const metadata: Metadata = { title: 'Kelola bukti' };

const JENIS = { RENCANA: 'Rencana', ANGGARAN: 'Anggaran', PELAKSANAAN: 'Pelaksanaan' } as const;

export default async function AdminEvidencePage({
  params,
  searchParams,
}: PageProps<'/admin/bukti/[daerah]/[kode]'>) {
  const { daerah, kode } = await params;
  const ubah = Number((await searchParams).ubah);
  const [result, sumber] = await Promise.all([getProgram(kode, daerah), getSumberList(daerah)]);
  if (!result.ok) {
    if (result.status === 404) notFound();
    return <ErrorState pesan={result.pesan} />;
  }
  const p = result.data.data;
  const daerahKode = result.data.daerah?.kode;
  if (!p || !daerahKode) notFound();
  const docs = sumber.ok ? sumber.data.data : [];
  const judul = (id: number | null) => docs.find((d) => d.id === id)?.title;
  // ?ubah=<id> opens the edit form for that evidence row; it works without client state.
  const diubah = p.evidence.find((e) => e.id === ubah);

  return (
    <>
      <nav className="breadcrumb" aria-label="Remah roti">
        <ol>
          <li>
            <Link href={`/admin/bukti?daerah=${daerah}`}>Bukti program</Link>
          </li>
          <li aria-current="page">{p.kode}</li>
        </ol>
      </nav>
      <h1>{namaProgram(p.nama)}</h1>
      <p>
        Kode {p.kode}. <Link href={`/${daerah}/program/${p.kode}`}>Lihat halaman publik</Link>
      </p>

      <section className="box" aria-labelledby="verifikasi-title">
        <h2 id="verifikasi-title" className="box-title">
          Verifikasi data program
        </h2>
        <p>
          Status: <strong>{p.verified ? 'Sudah diverifikasi' : 'Belum diverifikasi'}</strong>.
          Tandai setelah nama, indikator, target, dan halaman PDF dicocokkan dengan dokumen sumber.
        </p>
        <ActionButton
          path={`/api/admin/daerah/${daerahKode}/program/${p.kode}`}
          method="PATCH"
          body={{ verified: !p.verified }}
        >
          {p.verified ? 'Batalkan verifikasi' : 'Tandai sudah diverifikasi'}
        </ActionButton>
      </section>

      <section aria-labelledby="bukti-title" style={{ marginBlock: 'var(--space-5)' }}>
        <h2 id="bukti-title">Bukti tercatat</h2>
        {p.evidence.length === 0 ? (
          <EmptyState>Belum ada bukti tercatat untuk program ini.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table-plain">
              <thead>
                <tr>
                  <th scope="col">Jenis</th>
                  <th scope="col">Dokumen sumber</th>
                  <th scope="col" className="num">
                    Halaman PDF
                  </th>
                  <th scope="col">Cakupan pencarian dan catatan</th>
                  <th scope="col">Diperiksa</th>
                  <th scope="col">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {p.evidence.map((e) => (
                  <tr key={e.id}>
                    <th scope="row">{JENIS[e.jenis]}</th>
                    <td>
                      {e.sourceDocumentId == null
                        ? 'Tanpa dokumen (belum diketahui)'
                        : (judul(e.sourceDocumentId) ?? `Dokumen #${e.sourceDocumentId}`)}
                    </td>
                    <td className="num">{e.pageRef ?? '-'}</td>
                    <td>{[e.cakupanPencarian, e.catatan].filter(Boolean).join(' · ') || '-'}</td>
                    <td>{formatTanggal(e.checkedAt)}</td>
                    <td className="btn-row">
                      <Link
                        className="btn"
                        href={`?ubah=${e.id}#ubah-bukti`}
                        scroll={false}
                        aria-current={e.id === ubah ? 'true' : undefined}
                      >
                        Ubah<span className="sr-only"> bukti {JENIS[e.jenis]}</span>
                      </Link>
                      <ActionButton
                        path={`/api/admin/evidence/${e.id}`}
                        method="DELETE"
                        confirmText={`Hapus bukti ${JENIS[e.jenis]} ini? Tindakan ini tidak bisa dibatalkan.`}
                      >
                        Hapus<span className="sr-only"> bukti {JENIS[e.jenis]}</span>
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!sumber.ok && <ErrorState judul="Dokumen sumber belum bisa dimuat" pesan={sumber.pesan} />}
      {diubah ? (
        <EvidenceForm
          key={diubah.id}
          daerahKode={daerahKode}
          programKode={p.kode}
          docs={docs}
          bukti={diubah}
        />
      ) : (
        <EvidenceForm daerahKode={daerahKode} programKode={p.kode} docs={docs} />
      )}
    </>
  );
}
