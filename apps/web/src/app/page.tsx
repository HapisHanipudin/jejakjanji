import Link from 'next/link';
import { BarChart } from '@/components/BarChart';
import { Money } from '@/components/Money';
import { SourceBox } from '@/components/SourceBox';
import { EmptyState, ErrorState, PaguLabel } from '@/components/States';
import { TOTAL_PROGRAM_RPJMD } from '@/content/site';
import { getBidangList, getProgramList, getSumberList } from '@/lib/data';
import { formatAngka } from '@/lib/format';

export default async function HomePage() {
  const [programs, bidang, sumber] = await Promise.all([
    getProgramList(),
    getBidangList(),
    getSumberList(),
  ]);

  return (
    <div className="stack">
      <section className="grid-2" aria-labelledby="hero-title">
        <div>
          <h1 id="hero-title">Lacak program resmi daerah, dari rencana sampai bukti</h1>
          <p>
            Satu tempat untuk program prioritas DKI Jakarta, pagu indikatifnya, dan bukti
            pelaksanaannya. Setiap angka punya sumber, halaman, dan tanggal cek.
          </p>
          <div className="btn-row">
            <Link href="/program" className="btn btn-primary">
              Lihat daftar program
            </Link>
            <Link href="/metodologi" className="btn">
              Cara kami bekerja
            </Link>
          </div>
        </div>
        <div className="box" aria-label="Ringkasan">
          {programs.ok ? (
            <p>
              <strong>{TOTAL_PROGRAM_RPJMD} program RPJMD</strong>, {programs.data.data.length}{' '}
              sudah dikurasi
            </p>
          ) : (
            <>
              <p>
                <strong>{TOTAL_PROGRAM_RPJMD} program RPJMD</strong>
              </p>
              <ErrorState
                pesan={programs.pesan}
                judul="Jumlah program dikurasi belum bisa dimuat"
              />
            </>
          )}
        </div>
      </section>

      <section className="box" aria-labelledby="alokasi-title">
        <h2 id="alokasi-title">Ke mana belanja daerah 2026 dialokasikan</h2>
        {!bidang.ok ? (
          <ErrorState pesan={bidang.pesan} />
        ) : bidang.data.data.length === 0 ? (
          <EmptyState>Belum ada data bidang urusan.</EmptyState>
        ) : (
          (() => {
            const top = [...bidang.data.data]
              .sort((a, b) => b.paguIndikatif2026 - a.paguIndikatif2026)
              .slice(0, 6);
            const withPrograms = new Set(
              programs.ok ? programs.data.data.map((p) => p.bidangKode) : [],
            );
            const docs = sumber.ok ? sumber.data.data : [];
            const docIds = [...new Set(top.map((b) => b.sourceDocumentId))];
            return (
              <>
                <p className="muted small">
                  Enam bidang urusan dengan pagu indikatif 2026 terbesar.
                </p>
                <BarChart
                  caption="Pagu indikatif 2026 per bidang urusan"
                  bars={top.map((b) => ({
                    key: b.kode,
                    label: b.nama,
                    value: b.paguIndikatif2026,
                    href: withPrograms.has(b.kode)
                      ? `/program?bidang=${encodeURIComponent(b.kode)}`
                      : undefined,
                    display: (
                      <>
                        <Money jumlah={b.paguIndikatif2026} satuan="rp" /> (
                        {formatAngka(b.proporsi, 2)}
                        %)
                      </>
                    ),
                  }))}
                />
                <PaguLabel label={bidang.data.label} />
                {docIds.map((id) => (
                  <SourceBox
                    key={id}
                    doc={docs.find((d) => d.id === id)}
                    pages={top.filter((b) => b.sourceDocumentId === id).map((b) => b.pageRef)}
                  />
                ))}
                {!sumber.ok && (
                  <ErrorState pesan={sumber.pesan} judul="Detail sumber belum bisa dimuat" />
                )}
              </>
            );
          })()
        )}
      </section>

      <section aria-labelledby="cara-title">
        <h2 id="cara-title">Dari rencana sampai bukti</h2>
        <ol className="grid-3 list-plain">
          <li className="box">
            <h3>1. Rencana</h3>
            <p>
              Program prioritas dari RPJMD DKI Jakarta 2025-2029, lengkap dengan indikator dan
              target.
            </p>
          </li>
          <li className="box">
            <h3>2. Anggaran</h3>
            <p>Pagu indikatif per tahun dengan halaman rujukan di dokumen sumber.</p>
          </li>
          <li className="box">
            <h3>3. Bukti</h3>
            <p>Belum diketahui bila bukti kosong. Minta informasi lewat PPID.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
