'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from './Icon';
import { formatTanggal } from '@/lib/format';
import { hariIni } from '@/lib/hari-kerja';
import { akhirPekan, geserBulan, geserHari, hariKe, isIsoDate, mingguBulan } from '@/lib/kalender';

const HARI = [
  ['Sen', 'Senin'],
  ['Sel', 'Selasa'],
  ['Rab', 'Rabu'],
  ['Kam', 'Kamis'],
  ['Jum', 'Jumat'],
  ['Sab', 'Sabtu'],
  ['Min', 'Minggu'],
] as const;
const bulanFmt = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Date input with a themed calendar. The native `type="date"` input stays the value, so typing,
 * form reset, and no-JS keep working. Fine pointers get the calendar popover; touch devices get
 * the OS picker, which suits thumbs better than a small grid.
 */
export function DateField({
  id,
  name,
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLTableElement>(null);
  const titleId = useId();
  const [enhanced, setEnhanced] = useState(false);
  const [fokus, setFokus] = useState<string>();
  const [dipilih, setDipilih] = useState<string>();
  const [today, setToday] = useState('');

  useEffect(() => setEnhanced(true), []);

  // Focus follows the roving day; close when focus or a click leaves the field.
  useEffect(() => {
    if (!fokus) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${fokus}"]`)?.focus();
  }, [fokus]);
  useEffect(() => {
    if (!fokus) return;
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setFokus(undefined);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [fokus]);

  function buka() {
    const el = input.current!;
    if (matchMedia('(pointer: coarse)').matches && 'showPicker' in el) {
      try {
        el.showPicker();
        return;
      } catch {
        // Fall through to the calendar when the browser refuses (e.g. not user-activated).
      }
    }
    const t = hariIni();
    const v = isIsoDate(el.value) ? el.value : t;
    setToday(t);
    setDipilih(isIsoDate(el.value) ? el.value : undefined);
    setFokus(v);
  }

  function tutup(kembali = true) {
    setFokus(undefined);
    if (kembali) trigger.current?.focus();
  }

  function pilih(iso: string) {
    const el = input.current!;
    // Set through the native setter so React and form listeners see a real input event.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, iso);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    setFokus(undefined);
    el.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      tutup();
      return;
    }
    if (!fokus || !(e.target as HTMLElement).dataset.day) return;
    const langkah: Record<string, string> = {
      ArrowLeft: geserHari(fokus, -1),
      ArrowRight: geserHari(fokus, 1),
      ArrowUp: geserHari(fokus, -7),
      ArrowDown: geserHari(fokus, 7),
      PageUp: geserBulan(fokus, e.shiftKey ? -12 : -1),
      PageDown: geserBulan(fokus, e.shiftKey ? 12 : 1),
      Home: geserHari(fokus, -hariKe(fokus)),
      End: geserHari(fokus, 6 - hariKe(fokus)),
    };
    const next = langkah[e.key];
    if (next) {
      e.preventDefault();
      setFokus(next);
    }
  }

  return (
    <div className="date-field" ref={wrap} data-enhanced={enhanced || undefined}>
      <input
        ref={input}
        id={id}
        name={name}
        type="date"
        required={required}
        defaultValue={defaultValue}
      />
      {enhanced && (
        <button
          ref={trigger}
          type="button"
          className="date-trigger"
          aria-label="Pilih tanggal dari kalender"
          aria-haspopup="dialog"
          aria-expanded={Boolean(fokus)}
          onClick={() => (fokus ? tutup() : buka())}
        >
          <Icon name="calendar" />
        </button>
      )}
      {fokus && (
        <div
          className="date-pop"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // Check after the next frame: a month change can briefly drop focus to <body>.
            requestAnimationFrame(() => {
              if (!wrap.current?.contains(document.activeElement)) tutup(false);
            });
          }}
        >
          <div className="date-head">
            <button
              type="button"
              className="date-nav"
              aria-label="Bulan sebelumnya"
              onClick={() => setFokus(geserBulan(fokus, -1))}
            >
              <Icon name="chevron-left" />
            </button>
            <p id={titleId} aria-live="polite">
              {bulanFmt.format(new Date(`${fokus}T00:00:00Z`))}
            </p>
            <button
              type="button"
              className="date-nav"
              aria-label="Bulan berikutnya"
              onClick={() => setFokus(geserBulan(fokus, 1))}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
          <table ref={grid} className="date-grid">
            <thead>
              <tr>
                {HARI.map(([pendek, penuh]) => (
                  <th key={pendek} scope="col" abbr={penuh}>
                    {pendek}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mingguBulan(fokus).map((minggu, w) => (
                <tr key={w}>
                  {minggu.map((day, d) => (
                    <td key={d}>
                      {day && (
                        <button
                          type="button"
                          data-day={day}
                          tabIndex={day === fokus ? 0 : -1}
                          className="date-day"
                          data-weekend={akhirPekan(day) || undefined}
                          aria-pressed={day === dipilih}
                          aria-current={day === today ? 'date' : undefined}
                          aria-label={formatTanggal(day)}
                          onClick={() => pilih(day)}
                        >
                          {Number(day.slice(8))}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="date-foot">
            <p>Sabtu dan Minggu tidak dihitung dalam tenggat.</p>
            <button type="button" className="date-today" onClick={() => pilih(hariIni())}>
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
