import type { Metadata } from 'next';
import { RequestTracker } from '@/components/RequestTracker';
import { ErrorState } from '@/components/States';
import { CATATAN_TINJAU_HUKUM, PERPANJANGAN_HARI_KERJA, TENGGAT_HARI_KERJA } from '@/content/legal';
import { getProgramList } from '@/lib/data';

export const metadata: Metadata = { title: 'Pelacak permohonan' };

export default async function PelacakPage({ searchParams }: PageProps<'/pelacak'>) {
  const sp = await searchParams;
  const pilih = typeof sp.program === 'string' ? sp.program : undefined;
  const programs = await getProgramList();

  return (
    <>
      <h1>Pelacak permohonan informasi</h1>
      <p>
        Catat permohonan yang sudah Anda kirim ke PPID dan perkirakan tenggat jawabannya. Tanpa
        akun: data <strong>tersimpan hanya di browser ini</strong> dan tidak dikirim ke server. Data
        hilang bila riwayat browser dihapus, jadi lakukan ekspor secara berkala.
      </p>
      <div className="notice small">
        <p>
          Tenggat perkiraan: {TENGGAT_HARI_KERJA} hari kerja setelah tanggal kirim, ditambah{' '}
          {PERPANJANGAN_HARI_KERJA} hari kerja bila diperpanjang. Hanya Sabtu dan Minggu yang
          dilewati; hari libur nasional belum diperhitungkan. Ketentuan ini perlu diverifikasi.
        </p>
        <p>{CATATAN_TINJAU_HUKUM}</p>
      </div>
      {!programs.ok && (
        <ErrorState judul="Daftar program belum bisa dimuat" pesan={programs.pesan} />
      )}
      <noscript>
        <p className="notice">Pelacak membutuhkan JavaScript karena data disimpan di browser.</p>
      </noscript>
      <RequestTracker
        programs={
          programs.ok ? programs.data.data.map((p) => ({ kode: p.kode, nama: p.nama })) : []
        }
        pilihAwal={pilih}
      />
    </>
  );
}
