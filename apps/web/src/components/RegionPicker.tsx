'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Daerah } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { REGION_STORAGE_KEY, rememberedRegion, regionForPath, regionPath } from '@/lib/regions';
import {
  geocodeUrl,
  suggestedRegion,
  locationFailureMessage,
  type LocationStage,
} from '@/lib/location';

export function RegionPicker({
  regions,
  error,
  landing = false,
}: {
  regions: Daerah[];
  error?: string;
  landing?: boolean;
}) {
  const pathname = usePathname();
  const current = regionForPath(pathname, regions);
  const dialog = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState('');
  const [last, setLast] = useState<Daerah>();
  const [message, setMessage] = useState('');
  const [locationStep, setLocationStep] = useState<'idle' | 'consent' | 'loading' | 'result'>(
    'idle',
  );
  const [suggestion, setSuggestion] = useState<Daerah>();
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    try {
      if (current) localStorage.setItem(REGION_STORAGE_KEY, current.slug);
      else setLast(rememberedRegion(localStorage.getItem(REGION_STORAGE_KEY), regions));
    } catch {
      // Preference storage is optional; never redirect a deep link from a remembered value.
    }
  }, [current, regions]);

  function open(location = false) {
    setSearch('');
    setMessage('');
    setSuggestion(undefined);
    setLocationStep(location ? 'consent' : 'idle');
    dialog.current?.showModal();
  }

  function close() {
    request.current?.abort();
    dialog.current?.close();
  }

  async function locate() {
    if (!navigator.geolocation) {
      setMessage('Browser tidak mendukung lokasi. Pilih daerah secara manual.');
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLocationStep('loading');
    setMessage('Meminta izin lokasi…');
    let stage: LocationStage = 'device';
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          maximumAge: 0,
          enableHighAccuracy: false,
        }),
      );
      if (controller.signal.aborted) return;
      setMessage('Mencari saran daerah…');
      stage = 'service';
      const response = await fetch(
        geocodeUrl(position.coords.latitude, position.coords.longitude),
        {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        },
      );
      if (!response.ok) throw new Error('Layanan lokasi tidak tersedia.');
      stage = 'response';
      const region = suggestedRegion(await response.json(), regions);
      if (controller.signal.aborted) return;
      setSuggestion(region);
      setLocationStep('result');
      setMessage(
        region
          ? `Saran lokasi: ${region.nama}. Konfirmasi untuk membuka daerah ini.`
          : 'Daerah hasil lokasi belum tersedia dalam pemetaan kurasi. Pilih manual atau buka DKI Jakarta secara eksplisit.',
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setLocationStep('consent');
      setMessage(locationFailureMessage(error, stage));
    }
  }

  return (
    <div className={landing ? 'region-entry region-entry-landing' : 'region-entry'}>
      <button
        className={
          landing &&
          !regions.some((region) => region.kode === '31' && region.statusKurasi === 'AKTIF')
            ? 'btn btn-primary region-trigger'
            : 'btn region-trigger'
        }
        type="button"
        onClick={() => open()}
        aria-haspopup="dialog"
      >
        {!landing && <Icon name="map-pin" />}
        <span>
          {current && !landing ? (
            <>
              {current.nama}
              <span className="sr-only">, ubah daerah</span>
            </>
          ) : (
            'Pilih daerah'
          )}
        </span>
        {!landing && <Icon name="chevron-down" />}
      </button>
      <dialog
        ref={dialog}
        className="region-dialog"
        aria-labelledby={landing ? 'region-title-main' : 'region-title-nav'}
        onCancel={() => request.current?.abort()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="region-dialog-body">
          <div className="box-head">
            <h2 id={landing ? 'region-title-main' : 'region-title-nav'}>Pilih daerah</h2>
            <button type="button" className="icon-button" onClick={close} aria-label="Tutup">
              <Icon name="close" size={20} />
            </button>
          </div>
          <p className="muted">
            Ketersediaan data mengikuti cakupan kurasi, bukan penilaian daerah. Data aktif saat ini
            DKI Jakarta; daerah lain ditambahkan setelah sumber dan datanya diperiksa.
          </p>
          {landing && last && (
            <p className="small">
              <Link href={regionPath(last.slug)} onClick={close}>
                Lanjut ke {last.nama}
              </Link>{' '}
              · terakhir dipilih
            </p>
          )}
          <label htmlFor={landing ? 'region-search-main' : 'region-search-nav'}>Cari daerah</label>
          <input
            id={landing ? 'region-search-main' : 'region-search-nav'}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
          />
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          <ul className="list-plain region-options">
            {regions
              .filter((region) =>
                region.nama.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')),
              )
              .map((region) => {
                const dipilih = !landing && current?.kode === region.kode;
                const aktif = region.statusKurasi === 'AKTIF';
                return (
                  <li key={region.kode}>
                    <Link
                      className="region-option"
                      href={regionPath(region.slug)}
                      onClick={close}
                      aria-current={dipilih ? 'true' : undefined}
                    >
                      <Icon
                        name={dipilih ? 'circle-check' : aktif ? 'map-pin' : 'circle-help'}
                        size={20}
                      />
                      <span>
                        <strong>{region.nama}</strong>
                        <span className="region-option-status">
                          {dipilih ? 'Daerah saat ini · ' : ''}
                          {aktif ? 'Data tersedia' : 'Belum dikurasi'}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>
          {!regions.some((region) =>
            region.nama.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')),
          ) && (
            <p className="notice">
              Daerah belum tersedia dalam daftar. Coba nama lain atau hapus pencarian.
            </p>
          )}
          <p className="small muted">
            Belum dikurasi menjelaskan cakupan data, bukan kinerja pemerintah. Tidak ada
            perbandingan pagu antar daerah.
          </p>
          <button
            type="button"
            className="btn btn-block"
            disabled={locationStep === 'loading'}
            onClick={() => {
              setLocationStep('consent');
              setMessage('');
              setSuggestion(undefined);
            }}
          >
            Gunakan lokasi saya
          </button>
          {locationStep === 'consent' && (
            <section className="notice stack" aria-label="Persetujuan lokasi">
              <p>
                Jika dilanjutkan, browser meminta izin lokasi. Koordinat dan alamat IP Anda diterima
                BigDataCloud untuk menyarankan daerah dan membantu peningkatan layanan lokasi
                mereka. JejakJanji tidak menyimpan koordinat.
              </p>
              <p className="small">
                <a
                  href="https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tentang layanan BigDataCloud
                </a>
                . Lokasi opsional; pilihan manual tetap tersedia.
              </p>
              <button type="button" className="btn btn-primary" onClick={locate}>
                Setuju, gunakan lokasi
              </button>
            </section>
          )}
          <p className="small" role="status">
            {message}
          </p>
          {suggestion && (
            <Link
              className="btn btn-primary btn-block"
              href={regionPath(suggestion.slug)}
              onClick={close}
            >
              Gunakan {suggestion.nama}
            </Link>
          )}
        </div>
      </dialog>
    </div>
  );
}
