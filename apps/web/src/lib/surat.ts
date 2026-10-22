import { UU_KIP } from '../content/legal.ts';

export const INFORMASI = [
  { key: 'capaian', teks: 'Realisasi capaian indikator program', bawaan: true },
  { key: 'anggaran', teks: 'Realisasi anggaran program per tahun', bawaan: true },
  { key: 'dokumen', teks: 'Dokumen laporan pelaksanaan terkait', bawaan: false },
] as const;

export type InformasiKey = (typeof INFORMASI)[number]['key'];
export type Pilihan = Record<InformasiKey, boolean>;

export const pilihanBawaan = (): Pilihan =>
  Object.fromEntries(INFORMASI.map((i) => [i.key, i.bawaan])) as Pilihan;

/** Square-bracket parts are never filled by the system; the requester fills them after copying. */
export const PLACEHOLDER = /(\[[^\]]+\])/;

export function buatSurat(
  program: { nama: string; kode: string; halaman: number },
  pilihan: Pilihan,
): string {
  const daftar = INFORMASI.filter((i) => pilihan[i.key]).map((i, n) => `${n + 1}. ${i.teks}`);
  return [
    '[Tempat, tanggal]',
    '',
    'Kepada Yth.',
    'Pejabat Pengelola Informasi dan Dokumentasi (PPID) [Nama perangkat daerah]',
    '',
    'Perihal: Permohonan informasi publik',
    '',
    `Saya [nama pemohon], [alamat dan kontak], berdasarkan ${UU_KIP}, memohon informasi mengenai program ${program.nama} (kode ${program.kode}) sebagaimana tercantum dalam RPJMD DKI Jakarta 2025 sampai 2029, halaman PDF ${program.halaman}, berupa:`,
    ...daftar,
    '',
    'Tujuan penggunaan informasi: [tujuan]. Cara memperoleh: [salinan digital / lihat langsung].',
    '',
    'Hormat saya,',
    '[Nama pemohon]',
  ].join('\n');
}
