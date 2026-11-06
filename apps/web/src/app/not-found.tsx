import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StatePanel } from '@/components/States';

export default function NotFound() {
  return (
    <div className="section container">
      <StatePanel
        icon="search"
        title="Halaman tidak ditemukan"
        actions={
          <>
            <Link href="/" className="btn btn-primary">
              Pilih daerah dari Beranda
            </Link>
            <Link className="link-strong" href="/dki-jakarta/program">
              Lihat program DKI Jakarta <Icon name="arrow" />
            </Link>
          </>
        }
      >
        <p>
          Alamat yang Anda buka tidak ada, atau kode program tidak terdaftar di data kami. Periksa
          kode program, atau cari dari daftar program.
        </p>
      </StatePanel>
    </div>
  );
}
