'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { StatusBukti } from '@jejakjanji/shared/status';

type Tahap = keyof StatusBukti;
type ProgramJejak = { kode: string; nama: string; status: StatusBukti };

const TAHAP: { key: Tahap; label: string; teks: string }[] = [
  {
    key: 'rencana',
    label: 'Rencana',
    teks: 'Program prioritas dari RPJMD 2025 sampai 2029, lengkap dengan indikator dan target.',
  },
  {
    key: 'anggaran',
    label: 'Anggaran',
    teks: 'Pagu indikatif per tahun dengan halaman rujukan di dokumen sumber.',
  },
  {
    key: 'pelaksanaan',
    label: 'Bukti',
    teks: 'Belum diketahui bila bukti kosong. Anda bisa meminta informasi lewat PPID.',
  },
];

/**
 * The evidence trail as something to explore: pick a stage and every curated program shows
 * whether that stage has a sourced document (filled dot) or is not yet known (dashed ring).
 * Without JS all three stages render stacked; with JS they become tabs on one shared trail.
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
      ArrowLeft: aktif - 1,
      Home: 0,
      End: TAHAP.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    pindah(next);
  }

  const hitung = (t: Tahap) => programs.filter((p) => p.status[t] === 'ada').length;

  return (
    <div
      className="jejak-explorer"
      data-enhanced={enhanced || undefined}
      data-reveal=""
      style={{ '--pos': aktif } as CSSProperties}
    >
      {enhanced && (
        <div className="trail" role="tablist" aria-label="Tahap jejak bukti" onKeyDown={onKeyDown}>
          <span className="trail-line" aria-hidden="true">
            <span className="trail-ink" />
          </span>
          {TAHAP.map((t, i) => (
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
              className="trail-stop"
              data-passed={i <= aktif || undefined}
              onClick={() => setAktif(i)}
            >
              <span className="trail-mark" aria-hidden="true">
                {i + 1}
              </span>
              <span className="trail-label">{t.label}</span>
            </button>
          ))}
        </div>
      )}

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
            {!enhanced && <h3 className="card-title">{t.label}</h3>}
            <p className="trail-teks">{t.teks}</p>
            <p className="trail-count">
              <strong>{ada}</strong> dari {programs.length} program punya dokumen sumber untuk tahap
              ini; {programs.length - ada} belum diketahui.
            </p>
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
