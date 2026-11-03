import { expect, test } from 'vitest';
import type { Daerah } from '@jejakjanji/shared';
import { rememberedRegion, regionForPath } from './regions';
import { geocodeUrl, suggestedRegion } from './location';

const jakarta: Daerah = {
  kode: '31',
  slug: 'dki-jakarta',
  nama: 'DKI Jakarta',
  tingkat: 'PROVINSI',
  statusKurasi: 'AKTIF',
  ppidUrl: null,
};
const fixture: Daerah = {
  ...jakarta,
  kode: 'test',
  slug: 'daerah-uji',
  nama: 'Daerah Uji',
  statusKurasi: 'BELUM_DIKURASI',
};

test('deep link uses URL region, not last choice; invalid URL never defaults to Jakarta', () => {
  const regions = [jakarta, fixture];
  expect(rememberedRegion('dki-jakarta', regions)).toEqual(jakarta);
  expect(regionForPath('/daerah-uji/program/2.11.11', regions)).toEqual(fixture);
  expect(regionForPath('/invalid/program', regions)).toBeUndefined();
  expect(regionForPath('/', regions)).toBeUndefined();
  expect(rememberedRegion('https://evil.example/', regions)).toBeUndefined();
});

test('location only suggests an explicitly mapped region and rejects IP fallback', () => {
  const result = {
    countryCode: 'ID',
    principalSubdivisionCode: 'ID-JK',
    lookupSource: 'reverseGeocoding',
  };
  expect(suggestedRegion(result, [jakarta])).toEqual(jakarta);
  expect(
    suggestedRegion({ ...result, principalSubdivisionCode: 'ID-XX' }, [jakarta]),
  ).toBeUndefined();
  expect(suggestedRegion({ ...result, countryCode: 'US' }, [jakarta])).toBeUndefined();
  expect(() => suggestedRegion({ ...result, lookupSource: 'ipGeolocation' }, [jakarta])).toThrow();
  expect(() => geocodeUrl(Number.NaN, 0)).toThrow();
  expect(() => geocodeUrl(91, 0)).toThrow();
  expect(geocodeUrl(-6.2, 106.8).searchParams.get('latitude')).toBe('-6.2');
});
