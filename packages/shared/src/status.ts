import type { Evidence } from './schema.ts';

export type NilaiStatus = 'ada' | 'belum_diketahui';
export type StatusBukti = { rencana: NilaiStatus; anggaran: NilaiStatus; pelaksanaan: NilaiStatus };

/**
 * Evidence counts as "ada" only when it cites a source document. A row with only
 * cakupan_pencarian records a search that found nothing, so it stays "belum_diketahui".
 * "belum_diketahui" is the default and is not a judgement that the program failed.
 */
export function hitungStatusBukti(
  evidence: Pick<Evidence, 'jenis' | 'sourceDocumentId'>[],
): StatusBukti {
  const ada = (jenis: Evidence['jenis']): NilaiStatus =>
    evidence.some((e) => e.jenis === jenis && e.sourceDocumentId != null)
      ? 'ada'
      : 'belum_diketahui';
  return { rencana: ada('RENCANA'), anggaran: ada('ANGGARAN'), pelaksanaan: ada('PELAKSANAAN') };
}
