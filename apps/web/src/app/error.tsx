'use client';

import { PageHeader } from '@/components/PageHeader';

// Last-resort boundary; data sections handle API errors themselves.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader
        title="Terjadi kesalahan"
        lead="Halaman ini gagal ditampilkan. Coba muat ulang."
      />
      <div className="section container">
        <button className="btn" type="button" onClick={reset}>
          Coba lagi
        </button>
      </div>
    </>
  );
}
