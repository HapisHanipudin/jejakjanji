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

/** Evidence stages a Detail page can ask about; "rencana" always has a source, so it is not one. */
export const TAHAP_DIMINTA = ['anggaran', 'pelaksanaan'] as const;
export type TahapDiminta = (typeof TAHAP_DIMINTA)[number];

export const isTahapDiminta = (v: unknown): v is TahapDiminta =>
  typeof v === 'string' && (TAHAP_DIMINTA as readonly string[]).includes(v);

/** Pre-ticked items when the requester arrives from one unknown evidence stage. */
export function pilihanUntukTahap(tahap: TahapDiminta | undefined): Pilihan {
  if (tahap === 'anggaran') return { capaian: false, anggaran: true, dokumen: false };
  if (tahap === 'pelaksanaan') return { capaian: true, anggaran: false, dokumen: true };
  return pilihanBawaan();
}

/** Square-bracket parts are never filled by the system; the requester fills them after copying. */
export const PLACEHOLDER = /(\[[^\]]+\])/;

export function buatSurat(
  program: { nama: string; kode: string; halaman: number; sumber: string },
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
    `Saya [nama pemohon], [alamat dan kontak], berdasarkan ${UU_KIP}, memohon informasi mengenai program ${program.nama} (kode ${program.kode}) sebagaimana tercantum dalam ${program.sumber}, halaman PDF ${program.halaman}, berupa:`,
    ...daftar,
    '',
    'Tujuan penggunaan informasi: [tujuan]. Cara memperoleh: [salinan digital / lihat langsung].',
    '',
    'Hormat saya,',
    '[Nama pemohon]',
  ].join('\n');
}
