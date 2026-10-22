import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/States';
import { DIPAKAI_UNTUK, KONTAK_KOREKSI, STATUS_TEKS } from '@/content/site';
import { getSumberList } from '@/lib/data';
import { formatTanggal } from '@/lib/format';

export const metadata: Metadata = { title: 'Metodologi dan netralitas' };

export default async function MetodologiPage() {
  const sumber = await getSumberList();

  return (
    <>
      <h1>Metodologi dan netralitas</h1>
      <div className="grid-aside">
        <div className="stack">
          <section aria-labelledby="dok-title">
            <h2 id="dok-title">Dokumen sumber</h2>
            <p>Setiap angka di situs menaut ke dokumen, halaman PDF, dan tanggal cek.</p>
            {!sumber.ok ? (
              <ErrorState pesan={sumber.pesan} />
            ) : sumber.data.data.length === 0 ? (
              <EmptyState>Belum ada dokumen sumber di data.</EmptyState>
            ) : (
              <div className="table-wrap">
                <table>
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
                        <td>
                          {d.url ? (
                            <a href={d.url} rel="noopener">
                              {d.title}
                            </a>
                          ) : (
                            d.title
                          )}
                          <br />
                          <span className="small muted">{d.version}</span>
                        </td>
                        <td>{DIPAKAI_UNTUK[d.type]}</td>
                        <td>{formatTanggal(d.checkedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="status-title">
            <h2 id="status-title">Aturan status bukti</h2>
            <dl>
              <dt>
                <strong>{STATUS_TEKS.rencana.judul}</strong>
              </dt>
              <dd>Program tercantum di dokumen rencana (RPJMD), dengan halaman PDF rujukan.</dd>
              <dt>
                <strong>{STATUS_TEKS.anggaran.judul}</strong>
              </dt>
              <dd>Ada dokumen anggaran yang memuat program ini, dengan halaman rujukan.</dd>
              <dt>
                <strong>{STATUS_TEKS.pelaksanaan.judul}</strong>
              </dt>
              <dd>
                Ada dokumen laporan pelaksanaan resmi untuk program ini, dengan halaman rujukan.
              </dd>
              <dt>
                <strong>Belum diketahui (bawaan)</strong>
              </dt>
              <dd>
                Kami belum menemukan dokumen yang menjadi bukti. Ini bukan penilaian bahwa program
                gagal.
              </dd>
            </dl>
          </section>

          <section aria-labelledby="pagu-title">
            <h2 id="pagu-title">Cara membaca pagu</h2>
            <ul>
              <li>Pagu program adalah pagu indikatif RPJMD, dalam juta rupiah.</li>
              <li>Pagu bidang urusan adalah pagu indikatif RKPD 2026, dalam rupiah.</li>
              <li>Keduanya bukan APBD dan bukan realisasi.</li>
              <li>
                Angka ditampilkan ringkas (mis. Rp1,32 T). Arahkan penunjuk atau fokus keyboard ke
                angka untuk melihat angka penuh.
              </li>
            </ul>
          </section>
        </div>

        <aside className="stack" aria-labelledby="netralitas">
          <h2 id="netralitas" tabIndex={-1}>
            Netralitas
          </h2>
          <section className="box" aria-labelledby="lakukan-title">
            <h3 id="lakukan-title">Yang kami lakukan</h3>
            <ul>
              <li>Mengumpulkan program prioritas dan pagu indikatif dari dokumen resmi.</li>
              <li>Menautkan setiap angka ke dokumen, halaman PDF, dan tanggal cek.</li>
              <li>Membantu menyusun draf permohonan informasi ke PPID yang Anda kirim sendiri.</li>
            </ul>
          </section>
          <section className="box" aria-labelledby="tidak-title">
            <h3 id="tidak-title">Yang tidak kami lakukan</h3>
            <ul>
              <li>Tanpa skor atau peringkat.</li>
              <li>Tidak menilai kinerja atau menuduh program gagal.</li>
              <li>Tidak menerima teks bebas dari pengguna.</li>
              <li>Tanpa akun dan tidak mengirim permohonan atas nama pengguna.</li>
            </ul>
          </section>
          <section className="box" aria-labelledby="koreksi-title">
            <h3 id="koreksi-title">Menemukan kekeliruan?</h3>
            <p>
              Kabari kami lewat <strong>{KONTAK_KOREKSI}</strong> dengan menyebut kode program dan
              halaman PDF.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
