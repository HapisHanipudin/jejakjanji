import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/States';
import { DIPAKAI_UNTUK, KONTAK_KOREKSI, STATUS_TEKS } from '@/content/site';
import { getSumberList } from '@/lib/data';
import { formatTanggal } from '@/lib/format';

export const metadata: Metadata = { title: 'Metodologi dan netralitas' };

const ATURAN = [
  {
    judul: STATUS_TEKS.rencana.judul,
    pill: `${STATUS_TEKS.rencana.singkat}: ${STATUS_TEKS.rencana.ada}`,
    teks: 'Program tercantum di dokumen rencana (RPJMD), dengan halaman PDF rujukan.',
  },
  {
    judul: STATUS_TEKS.anggaran.judul,
    pill: `${STATUS_TEKS.anggaran.singkat}: ${STATUS_TEKS.anggaran.ada}`,
    teks: 'Ada dokumen anggaran yang memuat program ini, dengan halaman rujukan.',
  },
  {
    judul: STATUS_TEKS.pelaksanaan.judul,
    pill: `${STATUS_TEKS.pelaksanaan.singkat}: ${STATUS_TEKS.pelaksanaan.ada}`,
    teks: 'Ada dokumen laporan pelaksanaan resmi untuk program ini, dengan halaman rujukan.',
  },
];

/** In-page table of contents: the page's own section headings, as static anchors. */
const ISI = [
  { href: '#dokumen-sumber', label: 'Dokumen sumber' },
  { href: '#aturan-status', label: 'Aturan status bukti' },
  { href: '#cara-membaca-pagu', label: 'Cara membaca pagu' },
  { href: '#netralitas', label: 'Netralitas' },
  { href: '#kontak-koreksi', label: 'Menemukan kekeliruan?' },
];

export default async function MetodologiPage({ params }: PageProps<'/[daerah]/metodologi'>) {
  const { daerah } = await params;
  const sumber = await getSumberList(daerah);

  return (
    <>
      <PageHeader
        title="Metodologi dan netralitas"
        lead="Dari mana angka berasal, bagaimana status bukti ditentukan, dan apa yang tidak kami lakukan."
      />
      <div className="section container">
        <div className="method-layout">
          <nav className="method-toc" aria-labelledby="toc-title">
            <p id="toc-title" className="method-toc-title">
              Di halaman ini
            </p>
            <ul className="list-plain">
              {ISI.map((i) => (
                <li key={i.href}>
                  <a href={i.href}>{i.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="method-main">
            <section id="dokumen-sumber" className="method-section" aria-labelledby="dok-title">
              <h2 id="dok-title">Dokumen sumber</h2>
              {!sumber.ok ? (
                <ErrorState pesan={sumber.pesan} />
              ) : sumber.data.data.length === 0 ? (
                <EmptyState>Belum ada dokumen sumber di data.</EmptyState>
              ) : (
                <div className="table-wrap">
                  <table className="table-plain table-cards">
                    <thead>
                      <tr>
                        <th scope="col">Dokumen</th>
                        <th scope="col">Dipakai untuk</th>
                        <th scope="col">Diperiksa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sumber.data.data.map((d) => (
                        <tr key={d.id}>
                          <th scope="row">
                            {d.url ? (
                              <a href={d.url} rel="noopener">
                                {d.title}
                              </a>
                            ) : (
                              d.title
                            )}{' '}
                            <span className="muted" style={{ fontWeight: 'normal' }}>
                              ({d.version})
                            </span>
                          </th>
                          <td className="muted" data-label="Dipakai untuk">
                            {DIPAKAI_UNTUK[d.type]}
                          </td>
                          <td data-label="Diperiksa" style={{ whiteSpace: 'nowrap' }}>
                            {formatTanggal(d.checkedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="source">
                Setiap angka di situs menaut ke dokumen, halaman PDF, dan tanggal cek.
              </p>
            </section>

            <section id="aturan-status" className="method-section" aria-labelledby="status-title">
              <h2 id="status-title">Aturan status bukti</h2>
              <ul className="list-plain rule-list">
                {ATURAN.map((a) => (
                  <li key={a.judul}>
                    <h3>{a.judul}</h3>
                    <span className="badge badge-icon">
                      <Icon name="file-check" />
                      {a.pill}
                    </span>
                    <p>{a.teks}</p>
                  </li>
                ))}
                <li>
                  <h3>Belum diketahui (bawaan)</h3>
                  <span className="badge badge-unknown badge-icon">
                    <Icon name="circle-help" />
                    Belum diketahui
                  </span>
                  <p>
                    Bukti belum ditemukan dalam cakupan pencarian yang dicatat, lengkap dengan
                    tanggalnya. Ini bukan penilaian bahwa program gagal.
                  </p>
                </li>
              </ul>
            </section>

            <section id="cara-membaca-pagu" className="method-section" aria-labelledby="pagu-title">
              <h2 id="pagu-title">Cara membaca pagu</h2>
              <p>
                Pagu program adalah pagu indikatif RPJMD dalam juta rupiah. Pagu per bidang urusan
                adalah pagu indikatif RKPD 2026 dalam rupiah. Keduanya bukan APBD dan bukan
                realisasi, dan keduanya tidak dijumlahkan atau dibandingkan langsung.
              </p>
              <p className="muted">
                Angka ditampilkan ringkas (misalnya Rp1,32 T). Arahkan penunjuk atau fokus keyboard
                ke angka untuk melihat angka penuh.
              </p>
            </section>

            <section className="method-section" aria-labelledby="netralitas">
              <h2 id="netralitas" tabIndex={-1}>
                Netralitas
              </h2>
              <div className="grid-2">
                <section className="box" aria-labelledby="lakukan-title">
                  <h3 id="lakukan-title" className="card-title" style={{ marginTop: 0 }}>
                    Yang kami lakukan
                  </h3>
                  <ul>
                    <li>Mengumpulkan program prioritas dan pagu indikatif dari dokumen resmi.</li>
                    <li>Menautkan setiap angka ke dokumen, halaman PDF, dan tanggal cek.</li>
                    <li>
                      Membantu menyusun draf permohonan informasi ke PPID yang Anda kirim sendiri.
                    </li>
                  </ul>
                </section>
                <section className="box" aria-labelledby="tidak-title">
                  <h3 id="tidak-title" className="card-title" style={{ marginTop: 0 }}>
                    Yang tidak kami lakukan
                  </h3>
                  <ul>
                    <li>Tanpa skor atau peringkat kepala daerah.</li>
                    <li>Tidak menilai kinerja atau menuduh program gagal.</li>
                    <li>Tidak menerima teks bebas dari pengguna.</li>
                    <li>Tanpa akun dan tidak mengirim permohonan atas nama pengguna.</li>
                  </ul>
                </section>
              </div>
            </section>

            <section id="kontak-koreksi" className="correction" aria-labelledby="koreksi-title">
              <div>
                <h2 id="koreksi-title">Menemukan kekeliruan?</h2>
                <p>Hubungi kami dengan menyebut kode program dan halaman PDF sumbernya.</p>
              </div>
              <a className="highlight" href={`mailto:${KONTAK_KOREKSI}`}>
                {KONTAK_KOREKSI}
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
