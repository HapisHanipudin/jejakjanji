import { connection } from 'next/server';
import {
  bidangUrusanListSchema,
  programDetailSchema,
  programListSchema,
  sumberListSchema,
} from '@jejakjanji/shared';
import { apiGet } from './api';

// connection(): always render at request time, so a build never bakes in stale or failed API data.

export async function getProgramList(query: { bidang?: string; status?: string; q?: string } = {}) {
  await connection();
  const qs = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => !!e[1]),
  ).toString();
  return apiGet(`/api/program${qs ? `?${qs}` : ''}`, programListSchema);
}

export async function getProgram(kode: string) {
  await connection();
  return apiGet(`/api/program/${encodeURIComponent(kode)}`, programDetailSchema);
}

export async function getBidangList() {
  await connection();
  return apiGet('/api/bidang-urusan', bidangUrusanListSchema);
}

export async function getSumberList() {
  await connection();
  return apiGet('/api/sumber', sumberListSchema);
}
