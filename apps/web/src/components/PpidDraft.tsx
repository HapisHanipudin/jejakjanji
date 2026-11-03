'use client';

import Link from 'next/link';
import { useState } from 'react';
import { INFORMASI, PLACEHOLDER, buatSurat, pilihanBawaan, type Pilihan } from '@/lib/surat';
import { namaProgram } from '@/lib/format';
import { unduh } from '@/lib/unduh';
import type { Daerah } from '@jejakjanji/shared';

type Program = {
  kode: string;
  nama: string;
  halaman: number;
  indikator: string;
  bidang: string;
  sumber: string;
};

export function PpidDraft({ program, region }: { program: Program; region: Daerah }) {
  const [pilihan, setPilihan] = useState<Pilihan>(pilihanBawaan);
  const [pesan, setPesan] = useState('');
  const teks = buatSurat(program, pilihan);
  const adaPilihan = Object.values(pilihan).some(Boolean);

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks);
      setPesan('Teks surat disalin.');
    } catch {
      setPesan('Gagal menyalin otomatis. Pilih teks pratinjau lalu salin manual.');
    }
  }

  return (
    <div className="grid-aside">
      <div className="stack">
        <fieldset>
          <legend>Informasi yang diminta</legend>
          {INFORMASI.map((i) => (
            <label key={i.key} className="check">
              <input
                type="checkbox"
                checked={pilihan[i.key]}
                onChange={(e) => setPilihan({ ...pilihan, [i.key]: e.target.checked })}
              />
              {i.teks}
            </label>
          ))}
        </fieldset>
        <section className="box" aria-labelledby="ringkasan-title">
          <h2 id="ringkasan-title" style={{ fontSize: 'var(--text-lg)' }}>
            Data program
          </h2>
          <dl className="facts-stack">
            <dt>Daerah</dt>
            <dd>{region.nama}</dd>
            <dt>Program</dt>
            <dd>
              {namaProgram(program.nama)} (<span className="kode">{program.kode}</span>)
            </dd>
            <dt>Bidang</dt>
            <dd>{program.bidang}</dd>
            <dt>Indikator utama</dt>
            <dd>{program.indikator}</dd>
            <dt>Rujukan</dt>
            <dd>
              {program.sumber}, hal. PDF {program.halaman}
            </dd>
          </dl>
        </section>
      </div>

      <section className="box box-lg" aria-labelledby="pratinjau-title">
        <div className="box-head">
          <h2 id="pratinjau-title">Pratinjau draf</h2>
          <span className="legend-chip">[ ] harus diisi pemohon</span>
        </div>
        {!adaPilihan && (
          <p className="notice" role="status">
            Pilih minimal satu informasi yang diminta.
          </p>
        )}
        <pre className="letter">
          {teks
            .split(PLACEHOLDER)
            .map((part, n) => (PLACEHOLDER.test(part) ? <mark key={n}>{part}</mark> : part))}
        </pre>
        <div className="btn-row" style={{ marginTop: 'var(--space-5)' }}>
          <button type="button" className="btn btn-primary" onClick={salin} disabled={!adaPilihan}>
            Salin teks
          </button>
          <button
            type="button"
            className="btn"
            disabled={!adaPilihan}
            onClick={() =>
              unduh(`draf-ppid-${region.slug}-${program.kode}.txt`, teks, 'text/plain')
            }
          >
            Unduh sebagai dokumen (.txt)
          </button>
        </div>
        <p role="status" className="small" style={{ marginTop: 'var(--space-3)' }}>
          {pesan}
        </p>
        {region.ppidUrl ? (
          <p>
            <a href={region.ppidUrl} rel="noreferrer" target="_blank">
              Buka kanal PPID {region.nama}
            </a>
          </p>
        ) : (
          <p className="small muted">
            Tautan kanal PPID {region.nama} belum diverifikasi. Cari kanal resmi sebelum mengirim;
            situs ini tidak mengirim permohonan.
          </p>
        )}
        <Link
          className="link-strong"
          href={`/${region.slug}/pelacak?program=${encodeURIComponent(program.kode)}`}
        >
          Lanjut ke Pelacak Permohonan →
        </Link>
      </section>
    </div>
  );
}
