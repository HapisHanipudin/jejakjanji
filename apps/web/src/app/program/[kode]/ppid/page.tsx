import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ErrorState } from '@/components/States';
import { PpidDraft } from '@/components/PpidDraft';
import { CATATAN_TINJAU_HUKUM } from '@/content/legal';
import { getBidangList, getProgram } from '@/lib/data';

export const metadata: Metadata = { title: 'Draf permohonan PPID' };

export default async function PpidPage({ params }: PageProps<'/program/[kode]/ppid'>) {
  const kode = decodeURIComponent((await params).kode);
  const [res, bidang] = await Promise.all([getProgram(kode), getBidangList()]);
  if (!res.ok && res.status === 404) notFound();

  return (
    <>
      <nav className="breadcrumb" aria-label="Remah roti">
        <ol>
          <li>
            <Link href="/program">Program</Link>
          </li>
          <li>
            <Link href={`/program/${encodeURIComponent(kode)}`}>{kode}</Link>
          </li>
          <li aria-current="page">Draf PPID</li>
        </ol>
      </nav>
      <h1>Draf permohonan informasi ke PPID</h1>
      <p>
        Surat disusun di browser Anda. Tidak ada data pemohon yang dikirim ke server. Isi sendiri
        bagian yang disorot setelah menyalin.
      </p>
      <p className="notice small">{CATATAN_TINJAU_HUKUM}</p>
      {res.ok ? (
        <PpidDraft
          program={{
            kode: res.data.data.kode,
            nama: res.data.data.nama,
            halaman: res.data.data.pageRef,
            indikator: res.data.data.indikator,
            bidang: bidang.ok
              ? (bidang.data.data.find((b) => b.kode === res.data.data.bidangKode)?.nama ??
                res.data.data.bidangKode)
              : res.data.data.bidangKode,
            sumber: res.data.data.sumber.title,
          }}
        />
      ) : (
        <ErrorState pesan={res.pesan} />
      )}
    </>
  );
}
