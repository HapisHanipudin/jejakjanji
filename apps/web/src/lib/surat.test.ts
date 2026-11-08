import { expect, test } from 'vitest';
import {
  buatSurat,
  isTahapDiminta,
  mailtoSurat,
  pilihanBawaan,
  pilihanUntukTahap,
} from './surat.ts';

const program = {
  nama: 'Program Uji',
  kode: '2.11.11',
  halaman: 345,
  sumber: 'RPJMD Daerah Uji 2025–2029',
};

test('pilihan bawaan: dua butir bernomor', () => {
  const s = buatSurat(program, pilihanBawaan());
  expect(s).toContain(
    'berupa:\n1. Realisasi capaian indikator program\n2. Realisasi anggaran program per tahun\n\n',
  );
  expect(s).not.toContain('Dokumen laporan pelaksanaan');
  expect(s).toContain('program Program Uji (kode 2.11.11)');
  expect(s).toContain('halaman PDF 345, berupa:');
  expect(s).toContain(program.sumber);
  expect(s).not.toContain('DKI Jakarta');
});

test('centang mengubah daftar dan penomoran', () => {
  const s = buatSurat(program, { capaian: false, anggaran: true, dokumen: true });
  expect(s).toContain(
    'berupa:\n1. Realisasi anggaran program per tahun\n2. Dokumen laporan pelaksanaan terkait\n\n',
  );
  expect(s).not.toContain('Realisasi capaian');
});

test('bagian dalam kurung siku tidak diisi sistem', () => {
  const s = buatSurat(program, pilihanBawaan());
  for (const p of [
    '[Tempat, tanggal]',
    '(PPID) [Nama perangkat daerah]',
    'Saya [nama pemohon], [alamat dan kontak], berdasarkan',
    '[tujuan]',
    '[salinan digital / lihat langsung]',
    'Hormat saya,\n[Nama pemohon]',
  ]) {
    expect(s).toContain(p);
  }
});

test('isian pemohon mengganti kurung siku miliknya saja; isian kosong tetap kurung siku', () => {
  const s = buatSurat(program, pilihanBawaan(), {
    nama: '  Sari  ',
    kontak: 'sari@contoh.id',
    tujuan: ' ',
  });
  expect(s).toContain('Saya Sari, [alamat], sari@contoh.id, berdasarkan');
  expect(s).toContain('Hormat saya,\nSari');
  expect(s).toContain('Tujuan penggunaan informasi: [tujuan].');
  expect(s).toContain('(PPID) [Nama perangkat daerah]');
  expect(s.startsWith('[Tempat, tanggal]')).toBe(true);
});

test('tahap dari Detail memilih butir yang sesuai; nilai lain kembali ke bawaan', () => {
  expect(pilihanUntukTahap('anggaran')).toEqual({ capaian: false, anggaran: true, dokumen: false });
  expect(pilihanUntukTahap('pelaksanaan')).toEqual({
    capaian: true,
    anggaran: false,
    dokumen: true,
  });
  expect(pilihanUntukTahap(undefined)).toEqual(pilihanBawaan());
  expect(isTahapDiminta('anggaran')).toBe(true);
  expect(isTahapDiminta('rencana')).toBe(false);
  expect(isTahapDiminta(['anggaran'])).toBe(false);
});

test('mailtoSurat encodes subject and CRLF body without a recipient', () => {
  const href = mailtoSurat('Perihal & uji', 'Baris 1\nBaris 2 [nama]');
  expect(href).toBe(
    'mailto:?subject=Perihal%20%26%20uji&body=Baris%201%0D%0ABaris%202%20%5Bnama%5D',
  );
});
