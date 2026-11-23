import type { Metadata } from 'next';
import { auditListSchema } from '@jejakjanji/shared';
import { EmptyState, ErrorState } from '@/components/States';
import { adminGet } from '@/lib/admin';

export const metadata: Metadata = { title: 'Log perubahan' };

const AKSI: Record<string, string> = {
  impor: 'Impor CSV',
  tambah_sumber: 'Tambah dokumen sumber',
  tambah_bukti: 'Tambah bukti',
  ubah_bukti: 'Ubah bukti',
  hapus_bukti: 'Hapus bukti',
  verifikasi_program: 'Ubah verifikasi program',
  tambah_daerah: 'Tambah daerah',
  ubah_daerah: 'Ubah daerah',
};

const waktu = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
});

export default async function AdminLogPage() {
  const log = await adminGet('/api/admin/audit', auditListSchema);
  return (
    <>
      <h1>Log perubahan</h1>
      <p className="lead">200 perubahan terakhir oleh admin, terbaru di atas. Waktu dalam WIB.</p>
      {!log.ok ? (
        <ErrorState pesan={log.pesan} />
      ) : log.data.data.length === 0 ? (
        <EmptyState>Belum ada perubahan tercatat.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table-plain">
            <caption className="sr-only">Log perubahan admin</caption>
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Admin</th>
                <th scope="col">Perubahan</th>
                <th scope="col">Data</th>
                <th scope="col">Rincian</th>
              </tr>
            </thead>
            <tbody>
              {log.data.data.map((e) => (
                <tr key={e.id}>
                  <td>{waktu.format(new Date(e.createdAt))}</td>
                  <td>{e.userEmail}</td>
                  <th scope="row">{AKSI[e.aksi] ?? e.aksi}</th>
                  <td className="kode">{e.target}</td>
                  <td>
                    {e.detail == null ? (
                      '-'
                    ) : (
                      <details>
                        <summary>Lihat</summary>
                        <pre className="admin-detail">{JSON.stringify(e.detail, null, 2)}</pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
