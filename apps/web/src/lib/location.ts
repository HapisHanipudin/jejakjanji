import { z } from 'zod';
import type { Daerah } from '@jejakjanji/shared';

// BigDataCloud's client endpoint: current device coordinates only, never IP fallback.
// https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api
export const geocodeSchema = z.object({
  countryCode: z.string().length(2),
  principalSubdivisionCode: z.string().max(32),
  lookupSource: z.literal('reverseGeocoding'),
});

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
