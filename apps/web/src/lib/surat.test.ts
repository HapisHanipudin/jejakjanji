import { expect, test } from 'vitest';
import { buatSurat, pilihanBawaan } from './surat.ts';

const program = { nama: 'Program Uji', kode: '2.11.11', halaman: 345 };

test('pilihan bawaan: dua butir bernomor', () => {
  const s = buatSurat(program, pilihanBawaan());
  expect(s).toContain(
    'berupa:\n1. Realisasi capaian indikator program\n2. Realisasi anggaran program per tahun\n\n',
  );
  expect(s).not.toContain('Dokumen laporan pelaksanaan');
  expect(s).toContain('program Program Uji (kode 2.11.11)');
  expect(s).toContain('halaman PDF 345, berupa:');
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
