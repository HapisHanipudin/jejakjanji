import { describe, expect, it } from 'vitest';
import { evidenceBodySchema } from './api.ts';
import { parseBidang, parseProgram } from './impor.ts';

const HEAD_PROGRAM =
  'daerah_kode,Kode,Program prioritas,Indikator,Satuan indikator,Kondisi awal,Target 2026,Pagu 2026,Pagu 2027,Pagu 2028,Pagu 2029,Pagu 2030,Halaman PDF,Sumber,Satuan pagu';
const baris = (over: Partial<Record<number, string>> = {}) =>
  [
    '31',
    '1.01.02',
    'PROGRAM X',
    'Indikator',
    '%',
    '1',
    '2',
    '1.000',
    '',
    '',
    '',
    '',
    '337',
    'RPJMD 2025-2029',
    'juta rupiah',
  ]
    .map((v, i) => over[i] ?? v)
    .join(',');

describe('parseProgram', () => {
  it('reads thousand dots and skips empty pagu cells', () => {
    const { ok, errors } = parseProgram(`${HEAD_PROGRAM}\n${baris()}`, '31');
    expect(errors).toEqual([]);
    expect(ok[0]).toMatchObject({ Kode: '1.01.02', 'Pagu 2026': 1000, 'Pagu 2027': '', baris: 2 });
  });

  it('rejects another region, comma numbers, ambiguous sources, and duplicate codes', () => {
    const csv = [
      HEAD_PROGRAM,
      baris({ 0: '32' }),
      baris({ 7: '"1,5"' }),
      baris({ 13: 'RPJMD dan RKPD' }),
      baris(),
      baris(),
    ].join('\n');
    const { errors } = parseProgram(csv, '31');
    expect(errors).toHaveLength(4);
    expect(errors[0]).toContain('baris 2 kolom "daerah_kode"');
    expect(errors[1]).toContain('baris 3 kolom "Pagu 2026"');
    expect(errors[2]).toContain('baris 4 kolom "Sumber"');
    expect(errors[3]).toContain('baris 6: kode "1.01.02" duplikat');
  });
});

describe('parseBidang', () => {
  it('skips total rows without Kode and reads decimal commas', () => {
    const csv = [
      'daerah_kode,Kode,Bidang urusan / unsur,Pagu indikatif 2026 (Rp),Proporsi belanja (%) menurut dokumen,Halaman PDF,Sumber',
      '31,1.01,Pendidikan,19.550.176.404.217,"22,39",480,RKPD 2026',
      '31,,Total,87.000.000.000.000,100,483,RKPD 2026',
    ].join('\n');
    const { ok, errors } = parseBidang(csv, '31');
    expect(errors).toEqual([]);
    expect(ok).toHaveLength(1);
    expect(ok[0]).toMatchObject({ 'Pagu indikatif 2026 (Rp)': 19550176404217 });
    expect(ok[0]?.['Proporsi belanja (%) menurut dokumen']).toBeCloseTo(22.39);
  });
});

describe('evidenceBodySchema', () => {
  const dasar = {
    daerahKode: '31',
    programKode: '1.01.02',
    jenis: 'PELAKSANAAN',
    checkedAt: '2026-11-15',
    catatan: '',
  };
  it('accepts a citation with a page, or a search record without a document', () => {
    expect(
      evidenceBodySchema.safeParse({
        ...dasar,
        sourceDocumentId: 1,
        pageRef: 10,
        cakupanPencarian: '',
      }).success,
    ).toBe(true);
    expect(
      evidenceBodySchema.safeParse({
        ...dasar,
        sourceDocumentId: null,
        pageRef: null,
        cakupanPencarian: 'LKPJ 2026',
      }).success,
    ).toBe(true);
  });
  it('rejects a document without a page and an empty search record', () => {
    for (const body of [
      { sourceDocumentId: 1, pageRef: null, cakupanPencarian: '' },
      { sourceDocumentId: null, pageRef: null, cakupanPencarian: ' ' },
      { sourceDocumentId: null, pageRef: 5, cakupanPencarian: 'x' },
    ])
      expect(evidenceBodySchema.safeParse({ ...dasar, ...body }).success).toBe(false);
  });
});
