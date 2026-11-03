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

export default async function PpidPage({ params }: PageProps<'/[daerah]/program/[kode]/ppid'>) {
  const { kode, daerah } = await params;
  const [res, bidang] = await Promise.all([getProgram(kode, daerah), getBidangList(daerah)]);
  if (!res.ok && res.status === 404) notFound();

  const program = res.ok ? res.data.data : null;

  return (
    <>
      <PageHeader
        title="Draf permohonan informasi publik"
        lead="Draf ini dibuat dari data program. Lengkapi bagian dalam kurung siku, salin atau unduh, lalu kirim sendiri ke PPID yang berwenang. JejakJanji tidak mengirim apa pun atas nama Anda, dan tidak ada data pemohon yang dikirim ke server."
        breadcrumb={
          <nav className="breadcrumb" aria-label="Remah roti">
            <ol>
              <li>
                <Link href={`/${daerah}/program`}>
                  {res.ok ? res.data.daerah?.nama : daerah} › Program
                </Link>
              </li>
              <li>
                <Link href={`/${daerah}/program/${encodeURIComponent(kode)}`}>
                  {res.ok && program ? namaProgram(program.nama) : kode}
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
        {res.ok && program && res.data.daerah ? (
          <PpidDraft
            region={res.data.daerah}
            program={{
              kode: program.kode,
              nama: program.nama,
              halaman: program.pageRef,
              indikator: program.indikator,
              bidang: bidang.ok
                ? namaBidangRingkas(
                    bidang.data.data.find((b) => b.kode === program.bidangKode)?.nama ??
                      program.bidangKode,
                  )
                : program.bidangKode,
              sumber: program.sumber.title,
            }}
          />
        ) : (
          <ErrorState pesan={res.ok ? 'Data program belum tersedia.' : res.pesan} />
        )}
      </div>
    </>
  );
}
