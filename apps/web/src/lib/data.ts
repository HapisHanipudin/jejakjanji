import { cache } from 'react';
import { connection } from 'next/server';
import {
  bidangUrusanListSchema,
  daerahListSchema,
  JAKARTA,
  programDetailSchema,
  programListSchema,
  sumberListSchema,
} from '@jejakjanji/shared';
import { apiGet } from './api';

// connection(): always render at request time, so a build never bakes in stale or failed API data.

export async function getProgramList(
  query: { daerah?: string; bidang?: string; status?: string; q?: string } = {},
) {
  await connection();
  const qs = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => !!e[1]),
  ).toString();
  return apiGet(`/api/program${qs ? `?${qs}` : ''}`, programListSchema);
}

export async function getProgram(kode: string, region = JAKARTA.slug as string) {
  await connection();
  return apiGet(
    `/api/daerah/${encodeURIComponent(region)}/program/${encodeURIComponent(kode)}`,
    programDetailSchema,
  );
}

export async function getBidangList(region = JAKARTA.slug as string) {
  await connection();
  return apiGet(`/api/bidang-urusan?daerah=${encodeURIComponent(region)}`, bidangUrusanListSchema);
}

export async function getSumberList(region = JAKARTA.slug as string) {
  await connection();
  return apiGet(`/api/sumber?daerah=${encodeURIComponent(region)}`, sumberListSchema);
}

export const getDaerahList = cache(async () => {
  await connection();
  return apiGet('/api/daerah', daerahListSchema);
});

export const getRegion = cache(async (slug: string) => {
  const result = await getDaerahList();
  if (!result.ok) return result;
  return {
    ok: true as const,
    data: result.data.data.find((region) => region.slug === slug) ?? null,
  };
});
