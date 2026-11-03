import type { Daerah } from '@jejakjanji/shared';

export const REGION_STORAGE_KEY = 'jejakjanji.daerah';

/** An explicit URL always wins; stored data is only a homepage shortcut. */
export function regionForPath(pathname: string, regions: Daerah[]) {
  const slug = pathname.split('/')[1];
  return regions.find((region) => region.slug === slug);
}

export function rememberedRegion(raw: string | null, regions: Daerah[]) {
  return regions.find((region) => region.slug === raw);
}

export function regionPath(slug: string, suffix = '') {
  return `/${encodeURIComponent(slug)}${suffix}`;
}
