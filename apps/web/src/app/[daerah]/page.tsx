import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { BarChart } from '@/components/BarChart';
import { JejakExplorer } from '@/components/JejakExplorer';
import { Money } from '@/components/Money';
import { SourceBox } from '@/components/SourceBox';
import { EmptyState, ErrorState, PaguLabel } from '@/components/States';
import { KONTAK_KOREKSI, TOTAL_PROGRAM_RPJMD, TOTAL_PROGRAM_SUMBER } from '@/content/site';
import { getBidangList, getDaerahList, getProgramList, getSumberList, getRegion } from '@/lib/data';
import { formatPersen, namaBidangRingkas, namaProgram } from '@/lib/format';

export default async function HomePage({ params }: PageProps<'/[daerah]'>) {
  const { daerah } = await params;
  const regionResult = await getRegion(daerah);
  if (!regionResult.ok || !regionResult.data) return null;
  const region = regionResult.data;
  if (region.statusKurasi !== 'AKTIF') return null;
  const [programs, bidang, sumber, daerahList] = await Promise.all([
    getProgramList({ daerah }),
    getBidangList(daerah),
    getSumberList(daerah),
    getDaerahList(),
  ]);
  const aktif = daerahList.ok
    ? daerahList.data.data.filter((d) => d.statusKurasi === 'AKTIF').map((d) => d.nama)
    : [region.nama];
  // Example keywords are this region's own shortest curated program names, never invented.
  const contoh = programs.ok
    ? programs.data.data
        .map((p) => namaProgram(p.nama))
        .sort((x, y) => x.length - y.length || x.localeCompare(y, 'id'))
        .slice(0, 3)
    : [];

  return (
    <>
      <div className="band band-hero">
        <section className="container hero" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">Telusuri program prioritas {region.nama}</h1>
            <p className="lead">
              Satu tempat untuk program prioritas {region.nama}, pagu indikatifnya, dan bukti
              pelaksanaannya. Setiap angka punya sumber, halaman, dan tanggal cek.
            </p>
            {/* Plain GET form: opens the list with the keyword, with or without JavaScript. */}
            <form
              className="hero-search"
              method="get"
              action={`/${daerah}/program`}
              role="search"
              aria-label={`Cari program ${region.nama}`}
            >
              <label htmlFor="cari-program">Cari program</label>
              <div className="hero-search-row">
                <input
                  id="cari-program"
                  name="q"
                  type="search"
                  maxLength={200}
                  placeholder="Nama atau awalan kode program"
                />
                <button type="submit" className="btn btn-primary">
                  Cari
                </button>
              </div>
            </form>
            {contoh.length > 0 && (
              <p className="quick-fields">
                <span className="muted">Contoh:</span>
                {contoh.map((q) => (
                  <Link
                    key={q}
                    className="field-chip"
                    href={`/${daerah}/program?q=${encodeURIComponent(q)}`}
                  >
                    {q}
                  </Link>
                ))}
              </p>
            )}
            <p className="hero-links">
              <Link className="link-strong" href={`/${daerah}/program`}>
                Lihat semua program <Icon name="arrow" />
              </Link>
              <Link className="link-strong" href={`/${daerah}/metodologi`}>
                Cara kami bekerja
              </Link>
            </p>
          </div>
          <div aria-label="Cakupan data">
            {programs.ok ? (
              <>
                <p className="coverage-number">
                  <strong>{programs.data.data.length}</strong>
                  {region.kode === '31' ? <> dari {TOTAL_PROGRAM_RPJMD}</> : null}
                </p>
                {region.kode === '31' && (
                  <div
                    className="coverage-meter"
                    role="img"
                    aria-label={`${programs.data.data.length} dari ${TOTAL_PROGRAM_RPJMD} program prioritas sudah dikurasi`}
                  >
                    <span
                      style={{
                        width: `${Math.min(100, (programs.data.data.length / TOTAL_PROGRAM_RPJMD) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <p>program prioritas daerah sudah dikurasi dengan sumber dan halaman PDF.</p>
              </>
            ) : (
              <>
                <p className="coverage-number">
                  <strong>{region.kode === '31' ? TOTAL_PROGRAM_RPJMD : '?'}</strong> program
                  prioritas daerah
                </p>
                <ErrorState
                  pesan={programs.pesan}
                  judul="Jumlah program dikurasi belum bisa dimuat"
                />
              </>
            )}
            {region.kode === '31' && <p className="source">Sumber: {TOTAL_PROGRAM_SUMBER}</p>}
          </div>
        </section>
      </div>

      <section className="section-lg" aria-labelledby="alokasi-title">
        <div className="container">
          <div className="box-head">
            <h2 id="alokasi-title" className="section-title">
              Ke mana belanja daerah 2026 dialokasikan
            </h2>
            {bidang.ok && <PaguLabel label={bidang.data.label} />}
          </div>
          {!bidang.ok ? (
            <ErrorState pesan={bidang.pesan} />
          ) : bidang.data.data.length === 0 ? (
            <EmptyState>Belum ada data bidang urusan.</EmptyState>
          ) : (
            (() => {
              const top = bidang.data.data
                .filter((b) => ['1', '2', '3'].includes(b.kode.split('.')[0]!))
                .sort((a, b) => b.paguIndikatif2026 - a.paguIndikatif2026)
                .slice(0, 6);
              const docs = sumber.ok ? sumber.data.data : [];
              return (
                <>
                  <p className="lead">
                    Enam bidang urusan pemerintahan (kode 1-3) dengan pagu terbesar. Unsur
                    pendukung, penunjang, pengawasan, kewilayahan, dan pemerintahan umum (kode 4-8)
                    tidak termasuk. Pilih satu bidang untuk melihat program di dalamnya.
                  </p>
                  <div className="box chart-box">
                    <BarChart
                      caption="Pagu indikatif 2026 per bidang urusan"
                      bars={top.map((b) => ({
                        key: b.kode,
                        label: namaBidangRingkas(b.nama),
                        hint: (() => {
                          const n = programs.ok
                            ? programs.data.data.filter((p) => p.bidangKode === b.kode).length
                            : 0;
                          return n ? `${n} program dikurasi` : 'Belum ada program dikurasi';
                        })(),
                        value: b.paguIndikatif2026,
                        href: `/${daerah}/program?bidang=${encodeURIComponent(b.kode)}`,
                        display: (
                          <>
                            <Money jumlah={b.paguIndikatif2026} satuan="rp" />
                            <span className="muted">{formatPersen(b.proporsi)}</span>
                          </>
                        ),
                        source: (
                          <SourceBox
                            doc={docs.find((d) => d.id === b.sourceDocumentId)}
                            pages={[b.pageRef]}
                          />
                        ),
                      }))}
                    />
                    {!sumber.ok && (
                      <ErrorState pesan={sumber.pesan} judul="Detail sumber belum bisa dimuat" />
                    )}
                  </div>
                </>
              );
            })()
          )}
        </div>
      </section>

      <section className="section-lg section-alt" aria-labelledby="cara-title">
        <div className="container jejak-section">
          <h2 id="cara-title" className="section-title">
            Dari rencana sampai bukti
          </h2>
          <p className="muted jejak-intro">
            Setiap program punya jejak tiga langkah. Titik penuh berarti buktinya ada; titik
            putus-putus berarti belum diketahui, bukan berarti program gagal.
          </p>
          {programs.ok && programs.data.data.length > 0 ? (
            <JejakExplorer
              regionSlug={daerah}
              programs={programs.data.data.map((p) => ({
                kode: p.kode,
                nama: namaProgram(p.nama),
                status: p.statusBukti,
              }))}
            />
          ) : (
            <EmptyState>Belum ada program dikurasi untuk ditampilkan jejaknya.</EmptyState>
          )}
        </div>
      </section>

      <section className="section-lg" aria-labelledby="daerah-lain-title">
        <div className="container other-regions">
          <div>
            <h2 id="daerah-lain-title" className="section-title">
              Daerah lain
            </h2>
            <p>
              JejakJanji disiapkan untuk banyak daerah. Data aktif saat ini:{' '}
              <strong>{aktif.join(', ')}</strong>. Tiap daerah ditampilkan sendiri, tanpa
              perbandingan pagu atau peringkat.
            </p>
            <p className="muted">
              Punya dokumen RPJMD daerah lain? Kirim tautannya ke{' '}
              <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>. Belum dikurasi bukan
              penilaian kinerja pemerintah.
            </p>
          </div>
          <div className="btn-row">
            <Link className="btn" href="/#cakupan">
              Lihat cakupan daerah
            </Link>
            <Link className="btn" href={`/${daerah}/metodologi`}>
              Baca Metodologi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
