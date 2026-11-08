'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import {
  INFORMASI,
  PEMOHON_FIELDS,
  PLACEHOLDER,
  buatSurat,
  mailtoSurat,
  pilihanUntukTahap,
  type Pemohon,
  type Pilihan,
  type TahapDiminta,
} from '@/lib/surat';
import { namaProgram } from '@/lib/format';
import { unduh } from '@/lib/unduh';
import { Icon } from './Icon';
import type { Daerah } from '@jejakjanji/shared';

type Program = {
  kode: string;
  nama: string;
  halaman: number;
  indikator: string;
  bidang: string;
  sumber: string;
};

const TAHAP_LABEL: Record<TahapDiminta, string> = {
  anggaran: 'Dianggarkan',
  pelaksanaan: 'Ada laporan pelaksanaan',
};

export function PpidDraft({
  program,
  region,
  tahap,
}: {
  program: Program;
  region: Daerah;
  tahap?: TahapDiminta;
}) {
  const [pilihan, setPilihan] = useState<Pilihan>(() => pilihanUntukTahap(tahap));
  // Applicant entries live in this component's memory only: no storage, no request.
  const [pemohon, setPemohon] = useState<Pemohon>({});
  const [pesan, setPesan] = useState('');
  // Feedback only: the item just added to the letter, and a short "copied" state.
  const [sorot, setSorot] = useState<{ teks: string; n: number }>();
  const [tersalin, setTersalin] = useState(false);
  // Detected after mount so server and first client render match.
  const [bisaBagikan, setBisaBagikan] = useState(false);
  const teks = buatSurat(program, pilihan, pemohon);
  const adaPilihan = Object.values(pilihan).some(Boolean);
  const perihal = `Permohonan informasi publik: ${namaProgram(program.nama)} (${program.kode})`;

  useEffect(() => setBisaBagikan(typeof navigator.share === 'function'), []);

  useEffect(() => {
    if (!tersalin) return;
    const t = setTimeout(() => setTersalin(false), 2000);
    return () => clearTimeout(t);
  }, [tersalin]);

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks);
      setPesan('Teks surat disalin.');
      setTersalin(true);
    } catch {
      setPesan('Gagal menyalin otomatis. Pilih teks pratinjau lalu salin manual.');
    }
  }

  // Both hand the letter to the user's own apps; the site itself sends nothing.
  async function bagikan() {
    try {
      await navigator.share({ title: perihal, text: teks });
      setPesan('Draf dibagikan ke aplikasi pilihan Anda.');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setPesan('Gagal membagikan. Gunakan Salin teks lalu tempel di aplikasi tujuan.');
    }
  }

  function bukaEmail() {
    window.location.href = mailtoSurat(perihal, teks);
    setPesan(
      'Aplikasi email dibuka. Isi alamat PPID sendiri; bila isi surat terpotong, gunakan Salin teks.',
    );
  }

  const pelacakHref = `/${region.slug}/pelacak?program=${encodeURIComponent(program.kode)}`;

  return (
    <>
      <ol className="ppid-steps" aria-label="Langkah sebelum mengirim permohonan">
        <li>
          <span>Pilih informasi yang diminta.</span>
        </li>
        <li>
          <span>Lengkapi bagian dalam [kurung siku].</span>
        </li>
        <li>
          <span>Salin, bagikan, kirim lewat email, atau unduh draf.</span>
        </li>
        <li>
          <span>
            Kirim sendiri lewat{' '}
            {region.ppidUrl ? (
              <a href={region.ppidUrl} rel="noreferrer" target="_blank">
                kanal PPID {region.nama}
              </a>
            ) : (
              'kanal PPID resmi'
            )}
            .
          </span>
        </li>
        <li>
          <span>
            Catat tanggal kirim di <Link href={pelacakHref}>Pelacak</Link>.
          </span>
        </li>
      </ol>
      <div className="grid-aside">
        <div className="stack">
          <fieldset className="box">
            <legend>Pilih informasi</legend>
            <p className="muted small">Anda dapat memilih lebih dari satu.</p>
            {tahap && (
              <p className="notice small">
                Dipilih dari tahap <strong>{TAHAP_LABEL[tahap]}</strong> yang belum diketahui. Ubah
                bila perlu.
              </p>
            )}
            {INFORMASI.map((i) => (
              <label key={i.key} className="check">
                <input
                  type="checkbox"
                  checked={pilihan[i.key]}
                  onChange={(e) => {
                    setPilihan({ ...pilihan, [i.key]: e.target.checked });
                    setSorot(
                      e.target.checked ? { teks: i.teks, n: (sorot?.n ?? 0) + 1 } : undefined,
                    );
                  }}
                />
                {i.teks}
              </label>
            ))}
          </fieldset>
          <fieldset className="box applicant-form">
            <legend>Isi data pemohon</legend>
            <p className="muted small">
              Opsional. Isian hanya mengganti kurung siku di pratinjau; tidak disimpan dan tidak
              dikirim ke server. Kosongkan bila ingin mengisi setelah menyalin.
            </p>
            {PEMOHON_FIELDS.map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={`pemohon-${f.key}`}>{f.label}</label>
                <input
                  id={`pemohon-${f.key}`}
                  type="text"
                  maxLength={200}
                  autoComplete={f.autoComplete}
                  value={pemohon[f.key] ?? ''}
                  onChange={(e) => setPemohon({ ...pemohon, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </fieldset>
          <section className="box" aria-labelledby="ringkasan-title">
            <h2 id="ringkasan-title" className="box-title">
              Konteks permohonan
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

        <section className="box box-lg letter-panel" aria-labelledby="pratinjau-title">
          <div className="box-head">
            <h2 id="pratinjau-title">Pratinjau surat</h2>
            <span className="legend-chip">[ ] harus diisi pemohon</span>
          </div>
          {!adaPilihan && (
            <p className="notice" role="status">
              Pilih minimal satu informasi yang diminta.
            </p>
          )}
          {/* Focusable so keyboard users can scroll it when the panel caps its height. */}
          <pre className="letter" tabIndex={0} role="region" aria-label="Isi surat">
            {teks.split('\n').map((line, li, all) => {
              const isi = line
                .split(PLACEHOLDER)
                .map((part, n) => (PLACEHOLDER.test(part) ? <mark key={n}>{part}</mark> : part));
              const baru = sorot && /^\d+\. /.test(line) && line.endsWith(sorot.teks);
              return (
                <Fragment key={li}>
                  {baru ? (
                    <span className="letter-new" key={`baru-${sorot.n}`}>
                      {isi}
                    </span>
                  ) : (
                    isi
                  )}
                  {li < all.length - 1 && '\n'}
                </Fragment>
              );
            })}
          </pre>
          <div className="btn-row" style={{ marginTop: 'var(--space-5)' }}>
            <button
              type="button"
              className="btn btn-primary btn-copy"
              data-done={tersalin}
              onClick={salin}
              disabled={!adaPilihan}
            >
              {tersalin ? (
                <>
                  <Icon name="check" /> Tersalin
                </>
              ) : (
                'Salin teks'
              )}
            </button>
            {bisaBagikan && (
              <button type="button" className="btn" disabled={!adaPilihan} onClick={bagikan}>
                Bagikan
              </button>
            )}
            <button type="button" className="btn" disabled={!adaPilihan} onClick={bukaEmail}>
              Buka di aplikasi email
            </button>
            <button
              type="button"
              className="btn"
              disabled={!adaPilihan}
              onClick={() =>
                unduh(`draf-ppid-${region.slug}-${program.kode}.txt`, teks, 'text/plain')
              }
            >
              Unduh .txt
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
          <Link className="link-strong" href={pelacakHref}>
            Lanjut ke Pelacak Permohonan <Icon name="arrow" />
          </Link>
        </section>
      </div>
    </>
  );
}
