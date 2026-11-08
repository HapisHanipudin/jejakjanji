import { expect, test } from 'vitest';
import type { Daerah } from '@jejakjanji/shared';
import { rememberedRegion, regionForPath } from './regions';
import { geocodeUrl, suggestedRegion, locationFailureMessage } from './location';

const jakarta: Daerah = {
  kode: '31',
  slug: 'dki-jakarta',
  nama: 'DKI Jakarta',
  tingkat: 'PROVINSI',
  statusKurasi: 'AKTIF',
  ppidUrl: null,
  ppidEmail: null,
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
    // Provider's published response contract, not an invented mock enum.
    lookupSource: 'coordinates',
  };
  expect(suggestedRegion(result, [jakarta])).toEqual(jakarta);
  expect(
    suggestedRegion({ ...result, principalSubdivisionCode: 'ID-XX' }, [jakarta]),
  ).toBeUndefined();
  expect(suggestedRegion({ ...result, countryCode: 'US' }, [jakarta])).toBeUndefined();
  expect(() => suggestedRegion({ ...result, lookupSource: 'ipGeolocation' }, [jakarta])).toThrow();
  expect(() =>
    suggestedRegion({ ...result, lookupSource: 'reverseGeocoding' }, [jakarta]),
  ).toThrow();
  expect(() => suggestedRegion({ ...result, lookupSource: 'ip address' }, [jakarta])).toThrow();
  expect(() =>
    suggestedRegion({ countryCode: 'ID', principalSubdivisionCode: 'ID-JK' }, [jakarta]),
  ).toThrow();
  expect(() => geocodeUrl(Number.NaN, 0)).toThrow();
  expect(() => geocodeUrl(91, 0)).toThrow();
  expect(geocodeUrl(-6.2, 106.8).searchParams.get('latitude')).toBe('-6.2');
});

test('location errors identify the failed stage without exposing coordinates or provider payload', () => {
  expect(locationFailureMessage({ code: 1 }, 'device')).toContain('Izin lokasi ditolak');
  expect(locationFailureMessage({ code: 2 }, 'device')).toContain(
    'Perangkat belum dapat menentukan koordinat',
  );
  expect(locationFailureMessage({ code: 3 }, 'device')).toContain('Waktu tunggu koordinat');
  expect(locationFailureMessage(null, 'device')).toContain('Lokasi perangkat belum bisa dibaca');
  expect(locationFailureMessage(new TypeError('private payload'), 'service')).toContain(
    'Layanan lokasi tidak dapat dihubungi',
  );
  expect(locationFailureMessage(new Error('private payload'), 'response')).toContain(
    'Hasil layanan lokasi tidak dapat dibaca',
  );
  expect(locationFailureMessage(new Error('private payload'), 'response')).not.toContain(
    'private payload',
  );
});
