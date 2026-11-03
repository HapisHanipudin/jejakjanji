import { z } from 'zod';
import type { Daerah } from '@jejakjanji/shared';

// BigDataCloud's client endpoint: current device coordinates only, never IP fallback.
// https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api
export const geocodeSchema = z.object({
  countryCode: z.string().length(2),
  principalSubdivisionCode: z.string().max(32),
  // Published SDK contract: coordinates is GPS/WiFi; ipGeolocation must stay rejected.
  // https://github.com/bigdatacloudapi/react-reverse-geocode-client#response-data
  lookupSource: z.literal('coordinates'),
});

export type LocationStage = 'device' | 'service' | 'response';

export function locationFailureMessage(error: unknown, stage: LocationStage) {
  if (stage === 'service')
    return 'Layanan lokasi tidak dapat dihubungi atau menolak permintaan. Coba lagi atau pilih daerah secara manual.';
  if (stage === 'response')
    return 'Hasil layanan lokasi tidak dapat dibaca sebagai lokasi perangkat. Pilih daerah secara manual atau coba lagi nanti.';
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  if (code === 1) return 'Izin lokasi ditolak. Anda tetap bisa memilih daerah secara manual.';
  if (code === 2)
    return 'Perangkat belum dapat menentukan koordinat. Periksa layanan lokasi perangkat, coba lagi, atau pilih daerah secara manual.';
  if (code === 3)
    return 'Waktu tunggu koordinat perangkat habis. Coba lagi atau pilih daerah secara manual.';
  return 'Lokasi perangkat belum bisa dibaca. Coba lagi atau pilih daerah secara manual.';
}

export function suggestedRegion(payload: unknown, regions: Daerah[]) {
  const location = geocodeSchema.parse(payload);
  if (location.countryCode !== 'ID') return undefined;
  // ISO 3166-2 ID-JK and Kemendagri 31 identify Jakarta; namespaces are not interchangeable.
  // shortcut: only Jakarta has an explicit verified mapping; add reviewed mappings with new datasets.
  return regions.find(
    (region) => region.kode === '31' && location.principalSubdivisionCode === 'ID-JK',
  );
}

export function geocodeUrl(latitude: number, longitude: number) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    throw new Error('Koordinat tidak valid.');
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'id',
  }).toString();
  return url;
}
