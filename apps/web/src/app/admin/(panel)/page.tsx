import Link from 'next/link';
import { ErrorState } from '@/components/States';
import { getDaerahList, getProgramList, getSumberList } from '@/lib/data';

const STATUS = { AKTIF: 'Aktif', BELUM_DIKURASI: 'Belum dikurasi' } as const;

export default async function AdminHomePage() {
  const regions = await getDaerahList();
  if (!regions.ok) return <ErrorState pesan={regions.pesan} />;
  const rows = await Promise.all(
    regions.data.data.map(async (r) => {
      const [programs, docs] = await Promise.all([
        getProgramList({ daerah: r.slug }),
        getSumberList(r.slug),
      ]);
      return { r, programs, docs };
    }),
  );

  return (
    <>
      <h1>Dasbor admin</h1>
      <p className="lead">
        Kelola data kurasi. Setiap angka wajib punya dokumen sumber, halaman PDF, dan tanggal cek.
      </p>
      <div className="table-wrap">
        <table className="table-plain">
          <caption className="sr-only">Cakupan data per daerah</caption>
          <thead>
            <tr>
              <th scope="col">Daerah</th>
              <th scope="col">Status kurasi</th>
              <th scope="col" className="num">
                Program
              </th>
              <th scope="col" className="num">
                Bukti pelaksanaan belum diketahui
              </th>
              <th scope="col" className="num">
                Dokumen sumber
              </th>
              <th scope="col">Kelola</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, programs, docs }) => (
              <tr key={r.kode}>
                <th scope="row">
                  {r.nama} ({r.kode})
                </th>
                <td>{STATUS[r.statusKurasi]}</td>
                <td className="num">{programs.ok ? programs.data.data.length : '?'}</td>
                <td className="num">
                  {programs.ok
                    ? programs.data.data.filter((p) => p.statusBukti.pelaksanaan !== 'ada').length
                    : '?'}
                </td>
                <td className="num">{docs.ok ? docs.data.data.length : '?'}</td>
                <td>
                  <Link href={`/admin/bukti?daerah=${r.slug}`}>Bukti program</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Daerah berstatus belum dikurasi tidak menampilkan data ke publik, sehingga hitungannya nol
        di sini. Belum diketahui bukan berarti program gagal.
      </p>
    </>
  );
}
