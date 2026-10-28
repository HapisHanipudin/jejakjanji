// TODO: replace with a count from the API once the full RPJMD program list is imported.
export const TOTAL_PROGRAM_RPJMD = 82;

// TODO: replace with the real correction contact (email or form URL).
export const KONTAK_KOREKSI = '[kontak koreksi]';

export const FOOTER_TEXT =
  'Tanpa skor atau peringkat kepala daerah. Semua angka berasal dari dokumen resmi dan diberi tanggal cek.';

// What each source document type is used for on this site (editorial text, not from the API).
export const DIPAKAI_UNTUK: Record<'RPJMD' | 'RKPD', string> = {
  RPJMD: 'Program prioritas, indikator, target, dan pagu indikatif program 2026-2030 (juta rupiah)',
  RKPD: 'Pagu indikatif bidang urusan 2026 (rupiah)',
};

export const STATUS_TEKS = {
  rencana: { judul: 'Tercantum di rencana', singkat: 'Rencana', ada: 'tercantum' },
  anggaran: { judul: 'Dianggarkan', singkat: 'Anggaran', ada: 'dianggarkan' },
  pelaksanaan: { judul: 'Ada laporan pelaksanaan', singkat: 'Pelaksanaan', ada: 'ada laporan' },
} as const;

export const BELUM_DIKETAHUI = 'belum diketahui';
export const BELUM_BUKAN_GAGAL = 'Belum diketahui tidak berarti program gagal.';
