import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProgramDetail } from '@jejakjanji/shared';
import { BarChart } from '@/components/BarChart';
import { Money } from '@/components/Money';
import { SourceBox, type SourceDoc } from '@/components/SourceBox';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, ErrorState, PaguLabel } from '@/components/States';
import { BELUM_BUKAN_GAGAL, STATUS_TEKS } from '@/content/site';
import { getBidangList, getProgram, getSumberList } from '@/lib/data';
import { formatAngka, formatTanggal } from '@/lib/format';
import { totalPagu } from '@/lib/pagu';

type Detail = ProgramDetail['data'];

export async function generateMetadata({
  params,
}: PageProps<'/program/[kode]'>): Promise<Metadata> {
  const { kode } = await params;
  return { title: `Program ${decodeURIComponent(kode)}` };
}

export default async function ProgramDetailPage({ params }: PageProps<'/program/[kode]'>) {
  const kode = decodeURIComponent((await params).kode);
  const [res, bidang, sumber] = await Promise.all([
    getProgram(kode),
    getBidangList(),
    getSumberList(),
  ]);
  if (!res.ok && res.status === 404) notFound();
  if (!res.ok) {
    return (
      <>
        <h1>Program {kode}</h1>
        <ErrorState pesan={res.pesan} />
      </>
    );
  }

  const p = res.data.data;
  const label = res.data.label;
  const docs = sumber.ok ? sumber.data.data : [];
  const bidangNama = bidang.ok
    ? bidang.data.data.find((b) => b.kode === p.bidangKode)?.nama
    : undefined;
  const bidangHref = `/program?bidang=${encodeURIComponent(p.bidangKode)}`;

  return (
    <>
      <nav className="breadcrumb" aria-label="Remah roti">
        <ol>
          <li>
            <Link href="/program">Program</Link>
          </li>
          <li>
            <Link href={bidangHref}>{bidangNama ?? `Bidang ${p.bidangKode}`}</Link>
          </li>
          <li aria-current="page">{p.kode}</li>
        </ol>
      </nav>
      <h1>{p.nama}</h1>
      <p className="muted">
        <span className="kode">{p.kode}</span> | {bidangNama ?? p.bidangKode} | {p.sumber.title}
      </p>

      <div className="detail-grid">
        <section className="area-indikator box" aria-labelledby="indikator-title">
          <h2 id="indikator-title">Indikator kinerja</h2>
          <dl>
            <dt className="small muted">Indikator</dt>
            <dd>
              {p.indikator} ({p.satuan})
            </dd>
            <dt className="small muted">Kondisi awal</dt>
            <dd>{p.kondisiAwal}</dd>
            <dt className="small muted">Target 2026</dt>
            <dd>{p.target2026}</dd>
          </dl>
          <SourceBox doc={p.sumber} pages={[p.pageRef]} />
        </section>

        <StatusCard p={p} docs={docs} />

        <PaguSection p={p} label={label} docs={docs} />

        <section className="area-sumber box" aria-labelledby="sumber-title">
          <h2 id="sumber-title">Sumber dan tanggal cek</h2>
          <dl>
            <dt className="small muted">Dokumen</dt>
            <dd>
              {p.sumber.title} ({p.sumber.version})
            </dd>
            <dt className="small muted">Halaman PDF</dt>
            <dd>{p.pageRef}</dd>
            <dt className="small muted">Diperiksa</dt>
            <dd>{formatTanggal(p.sumber.checkedAt)}</dd>
          </dl>
          {p.sumber.url ? (
            <p>
              <a href={`${p.sumber.url}#page=${p.pageRef}`} rel="noopener">
                Buka dokumen sumber (hal. PDF {p.pageRef})
              </a>
            </p>
          ) : (
            <p className="muted small">Tautan dokumen belum tersedia.</p>
          )}
        </section>
      </div>
    </>
  );
}

function PaguSection({ p, label, docs }: { p: Detail; label: string; docs: SourceDoc[] }) {
  const total = totalPagu(p.pagu);
  return (
    <section className="area-pagu box" aria-labelledby="pagu-title">
      <h2 id="pagu-title">Pagu indikatif RPJMD</h2>
      {p.pagu.length === 0 ? (
        <EmptyState>Belum ada data pagu untuk program ini.</EmptyState>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Pagu indikatif per tahun, juta rupiah</caption>
              <thead>
                <tr>
                  <th scope="col">Tahun</th>
                  <th scope="col" className="num">
                    Juta rupiah
                  </th>
                  <th scope="col" className="num">
                    Ringkas
                  </th>
                </tr>
              </thead>
              <tbody>
                {p.pagu.map((f) => (
                  <tr key={f.tahun}>
                    <th scope="row">{f.tahun}</th>
                    <td className="num">{formatAngka(f.jumlahJutaRp)}</td>
                    <td className="num">
                      <Money jumlah={f.jumlahJutaRp} satuan="juta_rp" />
                    </td>
                  </tr>
                ))}
              </tbody>
              {total && (
                <tfoot>
                  <tr>
                    <td>Total {total.rentang}</td>
                    <td className="num">{formatAngka(total.jumlahJutaRp)}</td>
                    <td className="num">
                      <Money jumlah={total.jumlahJutaRp} satuan="juta_rp" />
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <BarChart
              caption="Pagu indikatif per tahun"
              bars={p.pagu.map((f) => ({
                key: String(f.tahun),
                label: f.tahun,
                value: f.jumlahJutaRp,
                display: <Money jumlah={f.jumlahJutaRp} satuan="juta_rp" />,
              }))}
            />
          </div>
          <p className="small muted">
            Satuan: juta rupiah. Total adalah jumlah angka per tahun di atas.
          </p>
          <PaguLabel label={label} />
          {[...new Set(p.pagu.map((f) => f.sourceDocumentId))].map((id) => (
            <SourceBox
              key={id}
              doc={docs.find((d) => d.id === id)}
              pages={p.pagu.filter((f) => f.sourceDocumentId === id).map((f) => f.pageRef)}
            />
          ))}
        </>
      )}
    </section>
  );
}

function StatusCard({ p, docs }: { p: Detail; docs: SourceDoc[] }) {
  const jenisMap = {
    rencana: 'RENCANA',
    anggaran: 'ANGGARAN',
    pelaksanaan: 'PELAKSANAAN',
  } as const;
  return (
    <section className="area-status box box-strong" aria-labelledby="status-title">
      <h2 id="status-title">Status bukti</h2>
      <ul className="list-plain stack">
        {(Object.keys(jenisMap) as (keyof typeof jenisMap)[]).map((k) => {
          const ev = p.evidence.filter((e) => e.jenis === jenisMap[k]);
          const bersumber = ev.filter((e) => e.sourceDocumentId != null);
          const pencarian = ev.filter((e) => e.sourceDocumentId == null);
          return (
            <li key={k}>
              <h3>{STATUS_TEKS[k].judul}</h3>
              <StatusBadge jenis={k} status={p.statusBukti[k]} />
              {bersumber.map((e) => (
                <div key={e.id}>
                  <SourceBox
                    prefix="Bukti"
                    doc={docs.find((d) => d.id === e.sourceDocumentId)}
                    pages={e.pageRef != null ? [e.pageRef] : []}
                  />
                  {e.catatan && <p className="small">{e.catatan}</p>}
                </div>
              ))}
              {p.statusBukti[k] === 'belum_diketahui' &&
                (pencarian.length > 0 ? (
                  pencarian.map((e) => (
                    <p key={e.id} className="small muted">
                      Sudah dicari{e.cakupanPencarian ? `: ${e.cakupanPencarian}` : ''} (diperiksa{' '}
                      {formatTanggal(e.checkedAt)}).{e.catatan ? ` ${e.catatan}` : ''}
                    </p>
                  ))
                ) : (
                  <p className="small muted">Belum ada catatan pencarian bukti.</p>
                ))}
            </li>
          );
        })}
      </ul>
      <p style={{ marginTop: 'var(--space-4)' }}>
        <strong>{BELUM_BUKAN_GAGAL}</strong>
      </p>
      <p>
        <Link href={`/program/${encodeURIComponent(p.kode)}/ppid`} className="btn btn-primary">
          Minta informasi ke PPID
        </Link>
      </p>
      <p className="small muted">Kami hanya membuat draf. Anda yang mengirimnya.</p>
    </section>
  );
}
