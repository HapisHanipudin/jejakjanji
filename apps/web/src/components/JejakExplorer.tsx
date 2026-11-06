'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { NilaiStatus, StatusBukti } from '@jejakjanji/shared/status';
import { Icon, type IconName } from './Icon';
import { JejakLangkah } from './JejakBukti';

type Tahap = keyof StatusBukti;
type ProgramJejak = { kode: string; nama: string; status: StatusBukti };

const TAHAP: {
  key: Tahap;
  label: string;
  icon: IconName;
  teks: string;
  penanda: string;
  statusPenanda: NilaiStatus;
}[] = [
  {
    key: 'rencana',
    label: 'Rencana',
    icon: 'file-text-md',
    penanda: 'Ada di rencana',
    statusPenanda: 'ada',
    teks: 'Program prioritas dari RPJMD 2025 sampai 2029, lengkap dengan indikator dan target.',
  },
  {
    key: 'anggaran',
    label: 'Anggaran',
    icon: 'wallet-md',
    penanda: 'Dianggarkan?',
    statusPenanda: 'belum_diketahui',
    teks: 'Pagu indikatif per tahun dengan halaman rujukan di dokumen sumber.',
  },
  {
    key: 'pelaksanaan',
    label: 'Pelaksanaan',
    icon: 'files-md',
    penanda: 'Ada laporan?',
    statusPenanda: 'belum_diketahui',
    teks: 'Belum diketahui bila bukti kosong. Anda bisa meminta informasi lewat PPID.',
  },
];

/**
 * The three stage cards double as tabs: pick a card and every curated program shows whether that
 * stage has a sourced document (filled dot) or is not yet known (dashed ring). Without JS the
 * cards are static and each stage's programs render stacked below them.
 */
export function JejakExplorer({
  programs,
  regionSlug,
}: {
  programs: ProgramJejak[];
  regionSlug: string;
}) {
  const [aktif, setAktif] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [sorot, setSorot] = useState<ProgramJejak>();
  const [sentuh, setSentuh] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    setEnhanced(true);
    setSentuh(matchMedia('(hover: none)').matches);
  }, []);

  function pindah(i: number) {
    const n = (i + TAHAP.length) % TAHAP.length;
    setAktif(n);
    tabs.current[n]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const next = {
      ArrowRight: aktif + 1,
      ArrowDown: aktif + 1,
      ArrowLeft: aktif - 1,
      ArrowUp: aktif - 1,
      Home: 0,
      End: TAHAP.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    pindah(next);
  }

  const hitung = (t: Tahap) => programs.filter((p) => p.status[t] === 'ada').length;

  return (
    <div className="jejak-explorer" data-enhanced={enhanced || undefined} data-reveal="">
      <div
        className="trail-cards grid-3"
        role={enhanced ? 'tablist' : undefined}
        aria-label={enhanced ? 'Tahap jejak bukti' : undefined}
        onKeyDown={enhanced ? onKeyDown : undefined}
      >
        {TAHAP.map((t, i) => {
          const isi = (
            <>
              <span className="trail-card-icon" aria-hidden="true">
                <Icon name={t.icon} size={28} />
              </span>
              <span aria-hidden="true">
                <JejakLangkah label={t.penanda} status={t.statusPenanda} />
              </span>
              <span className="card-title">{t.label}</span>
              <span className="muted">{t.teks}</span>
              <span className="trail-card-count">
                <strong>{hitung(t.key)}</strong> dari {programs.length} program punya dokumen sumber
              </span>
            </>
          );
          return enhanced ? (
            <button
              key={t.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tahap-${t.key}`}
              aria-controls={`panel-${t.key}`}
              aria-selected={i === aktif}
              tabIndex={i === aktif ? 0 : -1}
              className="box trail-card"
              onClick={() => setAktif(i)}
            >
              {isi}
            </button>
          ) : (
            <div key={t.key} className="box trail-card">
              {isi}
            </div>
          );
        })}
      </div>

      {TAHAP.map((t, i) => {
        const ada = hitung(t.key);
        return (
          <section
            key={t.key}
            id={`panel-${t.key}`}
            role={enhanced ? 'tabpanel' : undefined}
            aria-labelledby={enhanced ? `tahap-${t.key}` : undefined}
            aria-label={enhanced ? undefined : t.label}
            hidden={enhanced && i !== aktif}
            className="trail-panel"
          >
            <h3 className="trail-panel-title">
              Program pada tahap {t.label}
              <span className="muted">
                {' '}
                · {ada} ada dokumen sumber, {programs.length - ada} belum diketahui
              </span>
            </h3>
            <ul className="dot-grid list-plain" aria-label={`Program pada tahap ${t.label}`}>
              {programs.map((p, n) => {
                const s = p.status[t.key];
                return (
                  <li key={p.kode} style={{ '--n': n } as CSSProperties}>
                    <Link
                      className="dot"
                      data-status={s}
                      data-name={p.nama}
                      href={`/${regionSlug}/program/${encodeURIComponent(p.kode)}`}
                      aria-label={`${p.nama}: ${s === 'ada' ? 'ada dokumen sumber' : 'belum diketahui'}`}
                      onMouseEnter={() => setSorot(p)}
                      onFocus={() => setSorot(p)}
                      onMouseLeave={() => setSorot(undefined)}
                      onBlur={() => setSorot(undefined)}
                    />
                  </li>
                );
              })}
            </ul>
            {enhanced && (
              <p className="dot-caption" aria-hidden="true">
                {sorot ? (
                  <>
                    <strong>{sorot.nama}</strong> ·{' '}
                    {sorot.status[t.key] === 'ada' ? 'ada dokumen sumber' : 'belum diketahui'}
                  </>
                ) : sentuh ? (
                  'Ketuk titik untuk membuka programnya.'
                ) : (
                  'Arahkan atau fokus ke titik untuk melihat programnya; klik untuk membuka.'
                )}
              </p>
            )}
            <p className="trail-legend" aria-hidden="true">
              <span>
                <span className="dot dot-legend" data-status="ada" /> Ada dokumen sumber
              </span>
              <span>
                <span className="dot dot-legend" data-status="belum_diketahui" /> Belum diketahui,
                bukan berarti gagal
              </span>
            </p>
          </section>
        );
      })}
    </div>
  );
}
