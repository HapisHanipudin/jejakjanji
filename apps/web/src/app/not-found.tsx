import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Halaman tidak ditemukan"
        lead="Alamat yang Anda buka tidak ada, atau kode program tidak terdaftar di data kami."
      />
      <div className="section container">
        <Link href="/" className="btn btn-primary">
          Pilih daerah dari Beranda
        </Link>
      </div>
    </>
  );
}
