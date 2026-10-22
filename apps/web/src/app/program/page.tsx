import type { Metadata } from 'next';
import { programQuerySchema } from '@jejakjanji/shared';
import { ProgramCard } from '@/components/ProgramCard';
import { EmptyState, ErrorState } from '@/components/States';
import { getBidangList, getProgramList, getSumberList } from '@/lib/data';

export const metadata: Metadata = { title: 'Daftar program' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProgramListPage({ searchParams }: PageProps<'/program'>) {
  const sp = await searchParams;
  const parsed = programQuerySchema.safeParse({
    bidang: first(sp.bidang) || undefined,
    status: first(sp.status) || undefined,
    q: first(sp.q) || undefined,
  });
  const filter = parsed.success ? parsed.data : {};

  const [filtered, all, bidang, sumber] = await Promise.all([
    getProgramList(filter),
    getProgramList(),
    getBidangList(),
    getSumberList(),
  ]);
  const bidangNama = new Map(bidang.ok ? bidang.data.data.map((b) => [b.kode, b.nama]) : []);
  const bidangDenganProgram = all.ok ? [...new Set(all.data.data.map((p) => p.bidangKode))] : [];
  const docs = sumber.ok ? sumber.data.data : [];

  return (
    <>
      <h1>Program prioritas RPJMD DKI Jakarta</h1>
      <p className="muted">
        {all.ok ? `${all.data.data.length} program sudah dikurasi. ` : ''}
        Pagu yang ditampilkan adalah pagu indikatif RPJMD, bukan APBD dan bukan realisasi.
      </p>

      {/* Plain GET form: works without JavaScript and keeps filters in the shareable URL. */}
      <form
        method="get"
        action="/program"
        className="box form-row"
        role="search"
        aria-label="Saring program"
      >
        <div className="field">
          <label htmlFor="q">Cari nama atau kode</label>
          <input id="q" name="q" type="search" maxLength={200} defaultValue={filter.q ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="bidang">Bidang</label>
          <select id="bidang" name="bidang" defaultValue={filter.bidang ?? ''}>
            <option value="">Semua bidang</option>
            {bidangDenganProgram.map((k) => (
              <option key={k} value={k}>
                {k} {bidangNama.get(k) ?? ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status bukti</label>
          <select id="status" name="status" defaultValue={filter.status ?? ''}>
            <option value="">Semua</option>
            <option value="ada">Ada laporan pelaksanaan</option>
            <option value="belum_diketahui">Belum diketahui</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Terapkan
        </button>
      </form>

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
            <p aria-live="polite">
              Menampilkan {filtered.data.data.length} dari {all.ok ? all.data.data.length : '?'}{' '}
              program
            </p>
            {filtered.data.data.length === 0 ? (
              <EmptyState>Tidak ada program yang cocok dengan filter ini.</EmptyState>
            ) : (
              <div className="grid-3">
                {filtered.data.data.map((p) => (
                  <ProgramCard
                    key={p.kode}
                    program={p}
                    bidangNama={bidangNama.get(p.bidangKode)}
                    doc={docs.find((d) => d.id === p.paguPerTahun[0]?.sourceDocumentId)}
                    label={filtered.data.label}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
