import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ErrorState } from '@/components/States';
import { PageHeader } from '@/components/PageHeader';
import { PpidDraft } from '@/components/PpidDraft';
import { CATATAN_TINJAU_HUKUM } from '@/content/legal';
import { getBidangList, getProgram } from '@/lib/data';
import { namaBidangRingkas, namaProgram } from '@/lib/format';

export const metadata: Metadata = { title: 'Draf permohonan PPID' };

export default async function PpidPage({ params }: PageProps<'/program/[kode]/ppid'>) {
  const kode = decodeURIComponent((await params).kode);
  const [res, bidang] = await Promise.all([getProgram(kode), getBidangList()]);
  if (!res.ok && res.status === 404) notFound();

  return (
    <>
      <PageHeader
        title="Draf permohonan informasi publik"
        lead="Draf ini dibuat dari data program. Lengkapi bagian dalam kurung siku, salin atau unduh, lalu kirim sendiri ke PPID yang berwenang. JejakJanji tidak mengirim apa pun atas nama Anda, dan tidak ada data pemohon yang dikirim ke server."
        breadcrumb={
          <nav className="breadcrumb" aria-label="Remah roti">
            <ol>
              <li>
                <Link href="/program">Program</Link>
              </li>
              <li>
                <Link href={`/program/${encodeURIComponent(kode)}`}>
                  {res.ok ? namaProgram(res.data.data.nama) : kode}
                </Link>
              </li>
              <li aria-current="page">Draf permohonan</li>
            </ol>
          </nav>
        }
      >
        <p className="notice small" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
          {CATATAN_TINJAU_HUKUM}
        </p>
      </PageHeader>
      <div className="section container">
        {res.ok ? (
          <PpidDraft
            program={{
              kode: res.data.data.kode,
              nama: res.data.data.nama,
              halaman: res.data.data.pageRef,
              indikator: res.data.data.indikator,
              bidang: bidang.ok
                ? namaBidangRingkas(
                    bidang.data.data.find((b) => b.kode === res.data.data.bidangKode)?.nama ??
                      res.data.data.bidangKode,
                  )
                : res.data.data.bidangKode,
              sumber: res.data.data.sumber.title,
            }}
          />
        ) : (
          <ErrorState pesan={res.pesan} />
        )}
      </div>
    </>
  );
}
