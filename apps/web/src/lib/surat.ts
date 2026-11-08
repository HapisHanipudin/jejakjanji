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

/**
 * Optional applicant entries typed on the PPID page. They only replace their own bracket in the
 * preview; they are never stored or sent. An empty entry keeps its bracket.
 */
export const PEMOHON_FIELDS = [
  { key: 'nama', label: 'Nama lengkap', autoComplete: 'name' },
  { key: 'alamat', label: 'Alamat', autoComplete: 'street-address' },
  { key: 'kontak', label: 'Email atau nomor telepon', autoComplete: 'email' },
  { key: 'perangkat', label: 'Perangkat daerah tujuan', autoComplete: 'off' },
  { key: 'tujuan', label: 'Tujuan penggunaan', autoComplete: 'off' },
  { key: 'cara', label: 'Cara memperoleh informasi', autoComplete: 'off' },
  { key: 'tempat', label: 'Tempat dan tanggal surat', autoComplete: 'off' },
] as const;

export type Pemohon = Partial<Record<(typeof PEMOHON_FIELDS)[number]['key'], string>>;

export function buatSurat(
  program: { nama: string; kode: string; halaman: number; sumber: string },
  pilihan: Pilihan,
  pemohon: Pemohon = {},
): string {
  const isi = (key: keyof Pemohon, kurung: string) => pemohon[key]?.trim() || kurung;
  const alamatKontak =
    pemohon.alamat?.trim() || pemohon.kontak?.trim()
      ? `${isi('alamat', '[alamat]')}, ${isi('kontak', '[kontak]')}`
      : '[alamat dan kontak]';
  const daftar = INFORMASI.filter((i) => pilihan[i.key]).map((i, n) => `${n + 1}. ${i.teks}`);
  return [
    isi('tempat', '[Tempat, tanggal]'),
    '',
    'Kepada Yth.',
    `Pejabat Pengelola Informasi dan Dokumentasi (PPID) ${isi('perangkat', '[Nama perangkat daerah]')}`,
    '',
    'Perihal: Permohonan informasi publik',
    '',
    `Saya ${isi('nama', '[nama pemohon]')}, ${alamatKontak}, berdasarkan ${UU_KIP}, memohon informasi mengenai program ${program.nama} (kode ${program.kode}) sebagaimana tercantum dalam ${program.sumber}, halaman PDF ${program.halaman}, berupa:`,
    ...daftar,
    '',
    `Tujuan penggunaan informasi: ${isi('tujuan', '[tujuan]')}. Cara memperoleh: ${isi('cara', '[salinan digital / lihat langsung]')}.`,
    '',
    'Hormat saya,',
    isi('nama', '[Nama pemohon]'),
  ].join('\n');
}

/** `mailto:` with no recipient: the user picks the PPID address in their own mail app. */
export function mailtoSurat(perihal: string, teks: string): string {
  // RFC 6068: line breaks in a mailto body are CRLF.
  const body = encodeURIComponent(teks.replace(/\r?\n/g, '\r\n'));
  return `mailto:?subject=${encodeURIComponent(perihal)}&body=${body}`;
}
