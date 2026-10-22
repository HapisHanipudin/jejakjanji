'use client';

// Last-resort boundary; data sections handle API errors themselves.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <h1>Terjadi kesalahan</h1>
      <p>Halaman ini gagal ditampilkan. Coba muat ulang.</p>
      <button className="btn" type="button" onClick={reset}>
        Coba lagi
      </button>
    </>
  );
}
