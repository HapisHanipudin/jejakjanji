import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { programQuerySchema } from '@jejakjanji/shared';
import { JejakLangkah } from '@/components/JejakBukti';
import { PageHeader } from '@/components/PageHeader';
import { ProgramCard } from '@/components/ProgramCard';
import { ProgramFilter } from '@/components/ProgramFilter';
import { ThemedSelect } from '@/components/ThemedSelect';
import { EmptyState, ErrorState } from '@/components/States';
import { TOTAL_PROGRAM_RPJMD } from '@/content/site';
import { getBidangList, getProgramList, getSumberList, getRegion } from '@/lib/data';
import { namaBidangRingkas } from '@/lib/format';

export const metadata: Metadata = { title: 'Daftar program' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProgramListPage({
  searchParams,
  params,
}: PageProps<'/[daerah]/program'>) {
  const { daerah } = await params;
  const regionResult = await getRegion(daerah);
  if (!regionResult.ok || !regionResult.data || regionResult.data.statusKurasi !== 'AKTIF')
    return null;
  const region = regionResult.data;
  const sp = await searchParams;
  const parsed = programQuerySchema.safeParse({
    bidang: first(sp.bidang) || undefined,
    status: first(sp.status) || undefined,
    q: first(sp.q) || undefined,
  });
  const filter = parsed.success ? parsed.data : {};
  const filterKey = JSON.stringify(filter);

  const [filtered, all, bidang, sumber] = await Promise.all([
    getProgramList({ ...filter, daerah }),
    getProgramList({ daerah }),
    getBidangList(daerah),
    getSumberList(daerah),
  ]);
  const bidangNama = new Map(bidang.ok ? bidang.data.data.map((b) => [b.kode, b.nama]) : []);
  const bidangDenganProgram = all.ok ? [...new Set(all.data.data.map((p) => p.bidangKode))] : [];
  const docs = sumber.ok ? sumber.data.data : [];
  const base = `/${daerah}/program`;
  const tanpa = (key: keyof typeof filter) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(filter)) if (k !== key && v) u.set(k, v);
    const q = u.toString();
    return q ? `${base}?${q}` : base;
  };
  const aktif = [
    filter.q ? { key: 'q' as const, label: `Kata kunci “${filter.q}”` } : null,
    filter.bidang
      ? {
          key: 'bidang' as const,
          label: `Bidang ${namaBidangRingkas(bidangNama.get(filter.bidang) ?? filter.bidang)}`,
        }
      : null,
    filter.status
      ? {
          key: 'status' as const,
          label: filter.status === 'ada' ? 'Ada laporan pelaksanaan' : 'Belum diketahui',
        }
      : null,
  ].filter((f) => f !== null);

  return (
    <>
      <PageHeader
        title={`Program prioritas RPJMD ${region.nama}`}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Remah roti">
            <ol>
              <li>
                <Link href={`/${daerah}`}>{region.nama}</Link>
              </li>
              <li aria-current="page">Program</li>
            </ol>
          </nav>
        }
        lead={
          <>
            {all.ok
              ? `${all.data.data.length} program sudah dikurasi${region.kode === '31' ? ` dari ${TOTAL_PROGRAM_RPJMD} program prioritas daerah` : ''} dalam RPJMD 2025 sampai 2029. `
              : ''}
            Pagu adalah pagu indikatif RPJMD, bukan APBD.
          </>
        }
      />

      <div className="section container">
        {/* Plain GET form: works without JavaScript and keeps filters in the shareable URL. */}
        <ProgramFilter action={`/${daerah}/program`} filterKey={filterKey}>
          <div className="field">
            <label htmlFor="q">Cari</label>
            <input
              id="q"
              name="q"
              type="search"
              maxLength={200}
              placeholder="Nama atau kode program"
              defaultValue={filter.q ?? ''}
            />
          </div>
          <div className="field">
            <label htmlFor="bidang">Bidang</label>
            <ThemedSelect
              id="bidang"
              name="bidang"
              defaultValue={filter.bidang ?? ''}
              options={[
                { value: '', label: 'Semua bidang' },
                ...bidangDenganProgram.map((k) => ({
                  value: k,
                  label: `${k} ${namaBidangRingkas(bidangNama.get(k) ?? '')}`,
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status bukti</label>
            <ThemedSelect
              id="status"
              name="status"
              defaultValue={filter.status ?? ''}
              options={[
                { value: '', label: 'Semua status' },
                { value: 'ada', label: 'Ada laporan pelaksanaan' },
                { value: 'belum_diketahui', label: 'Belum diketahui' },
              ]}
            />
          </div>
        </ProgramFilter>

        {aktif.length > 0 && (
          <div className="filter-summary" aria-label="Filter aktif">
            <span className="muted">Filter aktif:</span>
            {aktif.map((f) => (
              <Link key={f.key} className="filter-chip" href={tanpa(f.key)} scroll={false}>
                {f.label}
                <Icon name="close" size={14} />
                <span className="sr-only"> (hapus filter)</span>
              </Link>
            ))}
            {aktif.length > 1 && (
              <Link className="filter-clear" href={base} scroll={false}>
                Hapus semua
              </Link>
            )}
          </div>
        )}

        {!parsed.success && (
          <ErrorState judul="Filter tidak valid" pesan="Sebagian filter di alamat diabaikan." />
        )}
        {!bidang.ok && <ErrorState judul="Nama bidang belum bisa dimuat" pesan={bidang.pesan} />}

        <section aria-labelledby="hasil-title" style={{ marginTop: 'var(--space-5)' }}>
          <h2 id="hasil-title" className="sr-only">
            Hasil
          </h2>
          {!filtered.ok ? (
            <ErrorState pesan={filtered.pesan} />
          ) : (
            <>
              <div className="list-meta">
                <p aria-live="polite">
                  Menampilkan {filtered.data.data.length} dari {all.ok ? all.data.data.length : '?'}{' '}
                  program
                </p>
                <p className="legend" aria-hidden="true">
                  <JejakLangkah label="Ada bukti" status="ada" />
                  <JejakLangkah
                    label="Belum diketahui, bukan berarti gagal"
                    status="belum_diketahui"
                  />
                </p>
              </div>
              {filtered.data.data.length === 0 ? (
                <div className="program-results" key={filterKey}>
                  <EmptyState>
                    Tidak ada program yang cocok dengan filter ini.{' '}
                    <Link href={base} scroll={false}>
                      Tampilkan semua program
                    </Link>{' '}
                    atau ubah kata kunci.
                  </EmptyState>
                </div>
              ) : (
                <>
                  <ul className="program-list program-results" key={filterKey}>
                    {filtered.data.data.map((p, i) => (
                      <ProgramCard
                        key={p.kode}
                        index={i}
                        program={p}
                        regionSlug={daerah}
                        bidangNama={bidangNama.get(p.bidangKode)}
                        doc={docs.find((d) => d.id === p.paguPerTahun[0]?.sourceDocumentId)}
                      />
                    ))}
                  </ul>
                  <p className="small muted" style={{ marginTop: 'var(--space-4)' }}>
                    {filtered.data.label}. M = miliar; T = triliun rupiah.
                  </p>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
