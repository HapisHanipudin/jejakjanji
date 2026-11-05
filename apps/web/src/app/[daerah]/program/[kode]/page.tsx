import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProgramDetail } from '@jejakjanji/shared';
import { BarChart } from '@/components/BarChart';
import { JejakBukti } from '@/components/JejakBukti';
import { Money } from '@/components/Money';
import { PageHeader } from '@/components/PageHeader';
import { SourceBox, type SourceDoc } from '@/components/SourceBox';
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

  return (
    <>
      <PageHeader
        title={namaProgram(p.nama)}
        lead={
          <>
            Kode <span className="kode">{p.kode}</span> | Bidang {bidangRingkas} | {p.sumber.title}
          </>
        }
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
      />

      <div className="section container">
        <div className="detail-grid">
          <section className="area-indikator box" aria-labelledby="indikator-title">
            <h2 id="indikator-title">Indikator utama</h2>
            <p className="lead" style={{ color: 'var(--color-heading)' }}>
              {p.indikator} ({p.satuan})
            </p>
            <dl className="figures">
              <div>
                <dt>Kondisi awal</dt>
                <dd>{p.kondisiAwal}</dd>
              </div>
              <div>
                <dt>Target 2026</dt>
                <dd>{p.target2026}</dd>
              </div>
            </dl>
            <SourceBox doc={p.sumber} pages={[p.pageRef]} />
          </section>

          <StatusCard p={p} docs={docs} regionSlug={daerah} />

          <PaguSection p={p} label={label} docs={docs} />

          <section className="area-sumber box" aria-labelledby="sumber-title">
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
      </div>
    </>
  );
}

function PaguSection({ p, label, docs }: { p: Detail; label: string; docs: SourceDoc[] }) {
  const total = totalPagu(p.pagu);
  const pertama = p.pagu[0];
  return (
    <section className="area-pagu box" aria-labelledby="pagu-title">
      <div className="box-head">
        <h2 id="pagu-title">Pagu indikatif RPJMD</h2>
        <PaguLabel label={label} />
      </div>
      {!pertama ? (
        <EmptyState>Belum ada data pagu untuk program ini.</EmptyState>
      ) : (
        <>
          <BarChart
            compact
            caption="Pagu indikatif per tahun, juta rupiah"
            bars={p.pagu.map((f) => ({
              key: String(f.tahun),
              label: f.tahun,
              value: f.jumlahJutaRp,
              display: <Money jumlah={f.jumlahJutaRp} satuan="juta_rp" />,
            }))}
          />
          <hr className="rule" style={{ marginBlock: 'var(--space-4)' }} />
          {total && (
            <p className="total-row">
              <span>Total {total.rentang}</span>
              <span className="total-value">
                <Money jumlah={total.jumlahJutaRp} satuan="juta_rp" />
              </span>
            </p>
          )}
          <p className="source">
            Satuan sumber: juta rupiah. Pagu {pertama.tahun}:{' '}
            {formatRupiahPenuh(pertama.jumlahJutaRp, 'juta_rp')}. Total adalah jumlah angka per
            tahun di atas.
          </p>
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

function StatusCard({ p, docs, regionSlug }: { p: Detail; docs: SourceDoc[]; regionSlug: string }) {
  const jenisMap = {
    rencana: 'RENCANA',
    anggaran: 'ANGGARAN',
    pelaksanaan: 'PELAKSANAAN',
  } as const;
  return (
    <section className="area-status box box-strong" aria-labelledby="status-title">
      <h2 id="status-title">Jejak bukti</h2>
      <p className="muted small">Setiap tahap punya rujukan dan batas pencariannya sendiri.</p>
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <JejakBukti status={p.statusBukti} animate />
      </div>
      <ul className="list-plain status-items">
        {(Object.keys(jenisMap) as (keyof typeof jenisMap)[]).map((k) => {
          const ev = p.evidence.filter((e) => e.jenis === jenisMap[k]);
          const bersumber = ev.filter((e) => e.sourceDocumentId != null);
          const pencarian = ev.filter((e) => e.sourceDocumentId == null);
          return (
            <li key={k}>
              <h3>
                <Icon name={p.statusBukti[k] === 'ada' ? 'file-check' : 'search'} size={20} />
                {STATUS_TEKS[k].judul}
              </h3>
              <StatusBadge jenis={k} status={p.statusBukti[k]} bare />
              {bersumber.map((e) => (
                <div key={e.id}>
                  <SourceBox
                    prefix="Bukti"
                    doc={docs.find((d) => d.id === e.sourceDocumentId)}
                    pages={e.pageRef != null ? [e.pageRef] : []}
                  />
                  {e.catatan && <p>{e.catatan}</p>}
                </div>
              ))}
              {p.statusBukti[k] === 'belum_diketahui' &&
                (pencarian.length > 0 ? (
                  pencarian.map((e) => (
                    <p key={e.id}>
                      Sudah dicari{e.cakupanPencarian ? `: ${e.cakupanPencarian}` : ''} (diperiksa{' '}
                      {formatTanggal(e.checkedAt)}).{e.catatan ? ` ${e.catatan}` : ''}
                    </p>
                  ))
                ) : (
                  <p>Belum ada catatan pencarian bukti.</p>
                ))}
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
      <p className="notice notice-strong" style={{ marginBlock: 'var(--space-5)' }}>
        {BELUM_BUKAN_GAGAL}
      </p>
      <Link
        href={`/${regionSlug}/program/${encodeURIComponent(p.kode)}/ppid`}
        className="btn btn-primary btn-block"
      >
        Minta informasi ke PPID
      </Link>
      <p className="source">Kami hanya membuat draf. Anda yang mengirimnya.</p>
    </section>
  );
}
