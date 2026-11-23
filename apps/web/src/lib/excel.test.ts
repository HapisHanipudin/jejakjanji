import { describe, expect, it } from 'vitest';
import { parseBidang } from '@jejakjanji/shared/impor';
import { angkaKeTeks, barisKeCsv } from './excel';

describe('angkaKeTeks', () => {
  it('writes integers as digits and decimals with a comma', () => {
    expect(angkaKeTeks(19550176404217)).toBe('19550176404217');
    expect(angkaKeTeks(22.39)).toBe('22,39');
  });
  it('scales percent-formatted cells to the number shown', () => {
    expect(angkaKeTeks(0.2239, '0.00%')).toBe('22,39');
    expect(angkaKeTeks(0.5, '0%')).toBe('50');
  });
});

describe('barisKeCsv', () => {
  it('produces CSV the shared import accepts, with quoting', () => {
    const csv = barisKeCsv([
      [
        'daerah_kode',
        'Kode',
        'Bidang urusan / unsur',
        'Pagu indikatif 2026 (Rp)',
        'Proporsi belanja (%) menurut dokumen',
        'Halaman PDF',
        'Sumber',
      ].map((v) => ({ t: 's', v })),
      [
        { t: 's', v: '31' },
        { t: 's', v: '1.01' },
        { t: 's', v: 'Pendidikan, "wajib"' },
        { t: 'n', v: 19550176404217, z: '#,##0' },
        { t: 'n', v: 0.2239, z: '0.00%' },
        { t: 'n', v: 480, z: 'General' },
        { t: 's', v: 'RKPD 2026' },
      ],
      [undefined, undefined, { t: 's', v: 'Total' }],
    ]);
    expect(csv.split('\n')[1]).toBe(
      '31,1.01,"Pendidikan, ""wajib""",19550176404217,"22,39",480,RKPD 2026',
    );
    const { ok, errors } = parseBidang(csv, '31');
    expect(errors).toEqual([]);
    expect(ok).toHaveLength(1);
    expect(ok[0]?.['Proporsi belanja (%) menurut dokumen']).toBeCloseTo(22.39);
    expect(ok[0]?.['Bidang urusan / unsur']).toBe('Pendidikan, "wajib"');
  });
});
