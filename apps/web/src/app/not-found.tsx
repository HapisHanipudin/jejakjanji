import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak ada, atau kode program tidak terdaftar di data kami.</p>
      <p>
        <Link href="/program">Kembali ke daftar program</Link>
      </p>
    </>
  );
}
