'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StatePanel } from '@/components/States';

// Last-resort boundary; data sections handle API errors themselves.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="section container">
      <StatePanel
        icon="cloud-off"
        title="Halaman belum dapat dimuat"
        actions={
          <>
            <button className="btn btn-primary" type="button" onClick={reset}>
              Coba lagi
            </button>
            <Link className="link-strong" href="/">
              Beranda <Icon name="arrow" />
            </Link>
          </>
        }
      >
        <p>
          Halaman ini gagal ditampilkan. Catatan Pelacak yang tersimpan di browser Anda tidak perlu
          dihapus. Coba muat kembali saat koneksi tersedia.
        </p>
      </StatePanel>
    </div>
  );
}
