import Link from 'next/link';
import { BarChart } from '@/components/BarChart';
import { JejakLangkah } from '@/components/JejakBukti';
import { Money } from '@/components/Money';
import { SourceBox } from '@/components/SourceBox';
import { EmptyState, ErrorState, PaguLabel } from '@/components/States';
import { TOTAL_PROGRAM_RPJMD, TOTAL_PROGRAM_SUMBER } from '@/content/site';
import { getBidangList, getProgramList, getSumberList, getRegion } from '@/lib/data';
import { formatPersen, namaBidangRingkas } from '@/lib/format';

export default async function HomePage({ params }: PageProps<'/[daerah]'>) {
  const { daerah } = await params;
  const regionResult = await getRegion(daerah);
  if (!regionResult.ok || !regionResult.data) return null;
  const region = regionResult.data;
  if (region.statusKurasi !== 'AKTIF') return null;
  const [programs, bidang, sumber] = await Promise.all([
    getProgramList({ daerah }),
    getBidangList(daerah),
    getSumberList(daerah),
  ]);

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
            <div className="btn-row">
              <Link href={`/${daerah}/program`} className="btn btn-primary">
                Lihat daftar program
              </Link>
              <Link href={`/${daerah}/metodologi`} className="btn">
                Cara kami bekerja
              </Link>
            </div>
          </div>
          <div aria-label="Cakupan data">
            {programs.ok ? (
              <>
                <p className="coverage-number">
                  <strong>{programs.data.data.length}</strong>
                  {region.kode === '31' ? <> dari {TOTAL_PROGRAM_RPJMD}</> : null}
                </p>
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
              const docIds = [...new Set(top.map((b) => b.sourceDocumentId))];
              return (
                <>
                  <p className="lead">
                    Enam bidang urusan pemerintahan (kode 1-3) dengan pagu terbesar. Unsur
                    pendukung, penunjang, pengawasan, kewilayahan, dan pemerintahan umum (kode 4-8)
                    tidak termasuk. Pilih satu bidang untuk melihat program di dalamnya.
                  </p>
                  <div className="box" style={{ padding: 'var(--space-6)' }}>
                    <BarChart
                      caption="Pagu indikatif 2026 per bidang urusan"
                      bars={top.map((b) => ({
                        key: b.kode,
                        label: namaBidangRingkas(b.nama),
                        value: b.paguIndikatif2026,
                        href: `/${daerah}/program?bidang=${encodeURIComponent(b.kode)}`,
                        display: (
                          <>
                            <Money jumlah={b.paguIndikatif2026} satuan="rp" />
                            <span className="muted">{formatPersen(b.proporsi)}</span>
                          </>
                        ),
                      }))}
                    />
                    <hr className="rule" style={{ marginTop: 'var(--space-5)' }} />
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
                  </div>
                </>
              );
            })()
          )}
        </div>
      </section>

      <section className="section-lg section-alt" aria-labelledby="cara-title">
        <div className="container">
          <h2 id="cara-title" className="section-title">
            Dari rencana sampai bukti
          </h2>
          <p className="muted" style={{ maxWidth: '47.5rem', marginBottom: 'var(--space-6)' }}>
            Setiap program punya jejak tiga langkah. Titik penuh berarti buktinya ada; titik
            putus-putus berarti belum diketahui, bukan berarti program gagal.
          </p>
          <ol className="grid-3 list-plain">
            <li className="box">
              <span aria-hidden="true">
                <JejakLangkah label="Ada di rencana" status="ada" />
              </span>
              <h3 className="card-title">Rencana</h3>
              <p className="muted">
                Program prioritas dari RPJMD 2025 sampai 2029, lengkap dengan indikator dan target.
              </p>
            </li>
            <li className="box">
              <span aria-hidden="true">
                <JejakLangkah label="Dianggarkan?" status="belum_diketahui" />
              </span>
              <h3 className="card-title">Anggaran</h3>
              <p className="muted">
                Pagu indikatif per tahun dengan halaman rujukan di dokumen sumber.
              </p>
            </li>
            <li className="box">
              <span aria-hidden="true">
                <JejakLangkah label="Ada laporan?" status="belum_diketahui" />
              </span>
              <h3 className="card-title">Bukti</h3>
              <p className="muted">
                Belum diketahui bila bukti kosong. Anda bisa meminta informasi lewat PPID.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
