'use client';

import Link from 'next/link';
import { useState } from 'react';
import { INFORMASI, PLACEHOLDER, buatSurat, pilihanBawaan, type Pilihan } from '@/lib/surat';
import { unduh } from '@/lib/unduh';

type Program = {
  kode: string;
  nama: string;
  halaman: number;
  indikator: string;
  bidang: string;
  sumber: string;
};

export function PpidDraft({ program }: { program: Program }) {
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
    <div className="grid-2">
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
          <h2 id="ringkasan-title">Ringkasan program</h2>
          <dl>
            <dt className="small muted">Kode</dt>
            <dd className="kode">{program.kode}</dd>
            <dt className="small muted">Nama</dt>
            <dd>{program.nama}</dd>
            <dt className="small muted">Bidang</dt>
            <dd>{program.bidang}</dd>
            <dt className="small muted">Indikator</dt>
            <dd>{program.indikator}</dd>
            <dt className="small muted">Rujukan</dt>
            <dd>
              {program.sumber}, hal. PDF {program.halaman}
            </dd>
          </dl>
        </section>
      </div>

      <section aria-labelledby="pratinjau-title" className="stack">
        <h2 id="pratinjau-title">Pratinjau surat</h2>
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
        <p className="small muted">Bagian yang disorot diisi sendiri oleh pemohon.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={salin} disabled={!adaPilihan}>
            Salin teks
          </button>
          <button
            type="button"
            className="btn"
            disabled={!adaPilihan}
            onClick={() => unduh(`draf-ppid-${program.kode}.txt`, teks, 'text/plain')}
          >
            Unduh sebagai dokumen (.txt)
          </button>
          <Link href={`/pelacak?program=${encodeURIComponent(program.kode)}`}>
            Lanjut ke Pelacak Permohonan
          </Link>
        </div>
        <p role="status" className="small">
          {pesan}
        </p>
      </section>
    </div>
  );
}
