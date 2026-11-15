import type { Metadata } from 'next';
import { ImportForm } from '@/components/AdminForms';
import { ErrorState } from '@/components/States';
import { getDaerahList } from '@/lib/data';

export const metadata: Metadata = { title: 'Impor CSV' };

export default async function AdminImportPage() {
  const regions = await getDaerahList();
  return (
    <>
      <h1>Impor CSV</h1>
      <p className="lead">
        Aturan pemeriksaan sama dengan skrip seed. Impor bidang urusan lebih dulu, lalu program.
      </p>
      {regions.ok ? (
        <ImportForm regions={regions.data.data} />
      ) : (
        <ErrorState pesan={regions.pesan} />
      )}
      <div className="notice small" style={{ marginTop: 'var(--space-4)' }}>
        <p>
          Pagu program dalam juta rupiah; pagu bidang urusan dalam rupiah penuh. Keduanya pagu
          indikatif, bukan APBD dan bukan realisasi.
        </p>
        <p>
          &quot;Periksa&quot; menjalankan impor lalu membatalkannya, jadi tidak ada yang tersimpan.
          Baris dengan kode yang sama ditimpa; status verifikasi program tidak diubah. Sel pagu
          kosong dilewati, tidak diisi.
        </p>
      </div>
    </>
  );
}
