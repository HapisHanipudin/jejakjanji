import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProgramDetail } from '@jejakjanji/shared';
import { JejakBukti } from '@/components/JejakBukti';
import { Money } from '@/components/Money';
import { PageHeader } from '@/components/PageHeader';
import { SourceBox, type SourceDoc } from '@/components/SourceBox';
import { StickyAside } from '@/components/StickyAside';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, ErrorState, PaguLabel } from '@/components/States';
import { BELUM_BUKAN_GAGAL, STATUS_TEKS } from '@/content/site';
import { getBidangList, getProgram, getSumberList } from '@/lib/data';
import { formatRupiahPenuh, formatTanggal, namaBidangRingkas, namaProgram } from '@/lib/format';
import { totalPagu } from '@/lib/pagu';

type Detail = NonNullable<ProgramDetail['data']>;

export async function generateMetadata({
  params,
}: PageProps<'/[daerah]/program/[kode]'>): Promise<Metadata> {
  const { kode } = await params;
  return { title: `Program ${kode}` };
}

export default async function ProgramDetailPage({ params }: PageProps<'/[daerah]/program/[kode]'>) {
  const { kode, daerah } = await params;
  const [res, bidang, sumber] = await Promise.all([
    getProgram(kode, daerah),
    getBidangList(daerah),
    getSumberList(daerah),
  ]);
  if (!res.ok && res.status === 404) notFound();
  if (!res.ok) {
    return (
      <>
        <PageHeader title={`Program ${kode}`} />
        <div className="section container">
          <ErrorState pesan={res.pesan} />
        </div>
      </>
    );
  }

  const p = res.data.data;
  if (!p) return null;
  const label = res.data.label;
  const docs = sumber.ok ? sumber.data.data : [];
  const bidangNama = bidang.ok
    ? bidang.data.data.find((b) => b.kode === p.bidangKode)?.nama
    : undefined;
  const bidangRingkas = bidangNama ? namaBidangRingkas(bidangNama) : `Bidang ${p.bidangKode}`;
  const bidangHref = `/${daerah}/program?bidang=${encodeURIComponent(p.bidangKode)}`;

  const bidangChip = bidangNama ? `Bidang ${bidangRingkas}` : bidangRingkas;

  return (
    <>
      <PageHeader
        title={namaProgram(p.nama)}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Remah roti">
            <ol>
              <li>
                <Link href={`/${daerah}/program`}>{res.data.daerah?.nama} › Program</Link>
              </li>
              <li>
                <Link href={bidangHref}>{bidangRingkas}</Link>
              </li>
              <li aria-current="page">{p.kode}</li>
            </ol>
          </nav>
        }
      >
        <div className="detail-meta">
          <p className="detail-chips">
            <span className="detail-chip detail-chip-kode kode">
              <span className="sr-only">Kode </span>
              {p.kode}
            </span>
            <span className="detail-chip">{bidangChip}</span>
          </p>
          <SourceBox line doc={p.sumber} pages={[p.pageRef]} />
        </div>
      </PageHeader>

      <div className="section container">
        <div className="detail-layout">
          <div className="detail-main">
            <section className="box detail-card" aria-labelledby="indikator-title">
              <h2 id="indikator-title">Indikator utama</h2>
              <p className="detail-indikator">
                {p.indikator} ({p.satuan})
              </p>
              <dl className="detail-figures">
                <div>
                  <dt>Kondisi awal</dt>
                  <dd>
                    <span className="detail-figure-value">{p.kondisiAwal}</span>
                    <SourceBox line doc={p.sumber} pages={[p.pageRef]} />
                  </dd>
                </div>
                <div>
                  <dt>Target 2026</dt>
                  <dd>
                    <span className="detail-figure-value">{p.target2026}</span>
                    <SourceBox line doc={p.sumber} pages={[p.pageRef]} />
                  </dd>
                </div>
              </dl>
            </section>

            <PaguSection p={p} label={label} docs={docs} />

            <section className="box detail-card" aria-labelledby="sumber-title">
              <h2 id="sumber-title">Sumber dan tanggal cek</h2>
              <dl className="facts">
                <dt>Dokumen</dt>
                <dd>
                  {p.sumber.title} ({p.sumber.version})
                </dd>
                <dt>Halaman</dt>
                <dd>PDF {p.pageRef}</dd>
                <dt>Diperiksa</dt>
                <dd>{formatTanggal(p.sumber.checkedAt)}</dd>
              </dl>
              {p.sumber.url ? (
                <a className="btn" href={`${p.sumber.url}#page=${p.pageRef}`} rel="noopener">
                  Buka dokumen sumber (hal. PDF {p.pageRef})
                </a>
              ) : (
                <p className="muted small">Tautan dokumen belum tersedia.</p>
              )}
            </section>
          </div>

          {/* Evidence panel stays in view while reading the figures on desktop, but only while it
              fits in the window (StickyAside); otherwise it scrolls with the page. */}
          <StickyAside className="detail-aside">
            <StatusCard p={p} docs={docs} regionSlug={daerah} />
            <section className="box detail-card detail-ppid" aria-label="Minta informasi">
              <p>Kami hanya membuat draf. Anda yang mengirimnya.</p>
              <Link
                href={`/${daerah}/program/${encodeURIComponent(p.kode)}/ppid`}
                className="btn btn-primary"
              >
                Minta informasi ke PPID
              </Link>
            </section>
          </StickyAside>
        </div>
      </div>
    </>
  );
}

function PaguSection({ p, label, docs }: { p: Detail; label: string; docs: SourceDoc[] }) {
  const total = totalPagu(p.pagu);
  const pertama = p.pagu[0];
  return (
    <section className="box detail-card" aria-labelledby="pagu-title">
      <div className="box-head">
        <h2 id="pagu-title">Pagu indikatif RPJMD</h2>
        <PaguLabel label={label} />
      </div>
      {!pertama ? (
        <EmptyState>Belum ada data pagu untuk program ini.</EmptyState>
      ) : (
        <>
          <table className="pagu-table">
            <caption className="sr-only">Pagu indikatif per tahun, juta rupiah</caption>
            <thead>
              <tr>
                <th scope="col">Tahun</th>
                <th scope="col" className="num">
                  Pagu
                </th>
              </tr>
            </thead>
            {p.pagu.map((f) => (
              <tbody key={f.tahun}>
                <tr>
                  <th scope="row">{f.tahun}</th>
                  <td className="num">
                    <Money jumlah={f.jumlahJutaRp} satuan="juta_rp" />
                  </td>
                </tr>
                <tr className="pagu-note">
                  <td colSpan={2}>
                    <PaguLabel label={label} plain />
                    <SourceBox
                      line
                      doc={docs.find((d) => d.id === f.sourceDocumentId)}
                      pages={[f.pageRef]}
                    />
                  </td>
                </tr>
              </tbody>
            ))}
            {total && (
              <tfoot>
                <tr>
                  <th scope="row">Total {total.rentang}</th>
                  <td className="num">
                    <Money jumlah={total.jumlahJutaRp} satuan="juta_rp" />
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          <p className="source">
            Satuan sumber: juta rupiah. Pagu {pertama.tahun}:{' '}
            {formatRupiahPenuh(pertama.jumlahJutaRp, 'juta_rp')}. Total adalah jumlah angka per
            tahun di atas.
          </p>
        </>
      )}
    </section>
  );
}

function StatusCard({ p, docs, regionSlug }: { p: Detail; docs: SourceDoc[]; regionSlug: string }) {
  const jenisMap = {
    rencana: 'RENCANA',
    anggaran: 'ANGGARAN',
    pelaksanaan: 'PELAKSANAAN',
  } as const;
  return (
    <section className="detail-card evidence-panel" aria-labelledby="status-title">
      <h2 id="status-title">Status bukti</h2>
      <JejakBukti status={p.statusBukti} animate />
      <ul className="list-plain evidence-steps">
        {(Object.keys(jenisMap) as (keyof typeof jenisMap)[]).map((k) => {
          const ev = p.evidence.filter((e) => e.jenis === jenisMap[k]);
          const bersumber = ev.filter((e) => e.sourceDocumentId != null);
          const pencarian = ev.filter((e) => e.sourceDocumentId == null);
          const ada = p.statusBukti[k] === 'ada';
          return (
            <li key={k} className="evidence-step">
              <div className="evidence-step-head">
                <Icon name={ada ? 'file-check-md' : 'search'} size={20} />
                <h3>{STATUS_TEKS[k].judul}</h3>
              </div>
              <StatusBadge jenis={k} status={p.statusBukti[k]} icon />
              {bersumber.map((e) => (
                <div key={e.id} className="evidence-body">
                  {e.catatan && <p>{e.catatan}</p>}
                  <SourceBox
                    line
                    prefix="Bukti"
                    doc={docs.find((d) => d.id === e.sourceDocumentId)}
                    pages={e.pageRef != null ? [e.pageRef] : []}
                  />
                </div>
              ))}
              {p.statusBukti[k] === 'belum_diketahui' && (
                <div className="evidence-body">
                  {pencarian.length > 0 ? (
                    pencarian.map((e) => (
                      <p key={e.id}>
                        Sudah dicari{e.cakupanPencarian ? `: ${e.cakupanPencarian}` : ''} (diperiksa{' '}
                        {formatTanggal(e.checkedAt)}).{e.catatan ? ` ${e.catatan}` : ''}
                      </p>
                    ))
                  ) : (
                    <p>Belum ada catatan pencarian bukti.</p>
                  )}
                </div>
              )}
              {p.statusBukti[k] === 'belum_diketahui' && k !== 'rencana' && (
                <Link
                  className="stage-action"
                  href={`/${regionSlug}/program/${encodeURIComponent(p.kode)}/ppid?minta=${k}`}
                >
                  Minta bukti tahap ini<span className="sr-only">: {STATUS_TEKS[k].judul}</span>
                  <Icon name="arrow" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="notice notice-strong">{BELUM_BUKAN_GAGAL}</p>
    </section>
  );
}
