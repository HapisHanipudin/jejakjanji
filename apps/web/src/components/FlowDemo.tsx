'use client';

import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    title: 'Pilih program',
    page: 'Daftar Program',
    action: 'Cari yang ingin Anda periksa',
    detail: 'Pilih daerah, lalu cari program menurut nama, bidang, atau ketersediaan bukti.',
    items: ['Daerah', 'Program prioritas', 'Bidang urusan'],
  },
  {
    title: 'Baca sumber',
    page: 'Detail Program',
    action: 'Buka rujukan resminya',
    detail:
      'Periksa indikator, target, dan pagu bersama dokumen sumber, halaman PDF, dan tanggal cek. Pagu indikatif, bukan APBD dan bukan realisasi.',
    items: ['Dokumen sumber', 'Halaman PDF', 'Tanggal cek'],
  },
  {
    title: 'Periksa bukti',
    page: 'Jejak bukti',
    action: 'Bedakan rencana dan pelaksanaan',
    detail:
      'Baca bukti untuk setiap tahap. “Belum diketahui” berarti bukti belum tersedia, bukan program gagal.',
    items: ['Rencana', 'Anggaran', 'Pelaksanaan'],
  },
  {
    title: 'Susun draf',
    page: 'Draf PPID',
    action: 'Minta informasi yang belum tersedia',
    detail:
      'Pilih informasi yang dibutuhkan, salin atau unduh draf, lalu kirim sendiri melalui kanal PPID resmi.',
    items: ['Pilih informasi', 'Salin atau unduh', 'Kirim sendiri'],
  },
  {
    title: 'Catat tindak lanjut',
    page: 'Pelacak',
    action: 'Simpan catatan di perangkat Anda',
    detail:
      'Catat tanggal kirim dan pantau perkiraan tenggat. Data Pelacak tersimpan di browser Anda.',
    items: ['Tanggal kirim', 'Perkiraan tenggat', 'Catatan respons'],
  },
] as const;

export function FlowDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => setPlaying(false);
    const hidden = () => {
      if (document.hidden) stop();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) stop();
    });
    if (root.current) observer.observe(root.current);
    motion.addEventListener('change', stop);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', stop);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (step === steps.length - 1) setPlaying(false);
      else setStep(step + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [playing, step]);

  const current = steps[step] ?? steps[0];
  return (
    <div className="flow-demo" ref={root}>
      <div className="flow-demo-heading">
        <div>
          <h3>Lihat alurnya sebelum mulai</h3>
          <p className="small muted">
            Simulasi alur. Tidak mengirim permohonan atau menyimpan data.
          </p>
        </div>
        {ready && (
          <button
            type="button"
            className="btn flow-play"
            aria-pressed={playing}
            onClick={() => {
              if (!playing && step === steps.length - 1) setStep(0);
              setPlaying(!playing);
            }}
          >
            {playing ? 'Jeda demo' : step === steps.length - 1 ? 'Putar ulang' : 'Putar demo'}
          </button>
        )}
      </div>
      <ol className="list-plain flow-demo-steps" aria-label="Langkah demo">
        {steps.map((item, index) => (
          <li key={item.title}>
            {ready ? (
              <button
                type="button"
                aria-current={step === index ? 'step' : undefined}
                aria-controls="flow-demo-panel"
                onClick={() => {
                  setPlaying(false);
                  setStep(index);
                }}
              >
                <span className="flow-step-number">{index + 1}</span>
                {item.title}
              </button>
            ) : (
              <span>
                {index + 1}. {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
      <div id="flow-demo-panel" className="flow-demo-panel" aria-live={playing ? 'off' : 'polite'}>
        <div className="flow-demo-scene" key={step}>
          <div className="flow-demo-sheet">
            <p className="flow-sheet-title">{current.page}</p>
            <ul className="list-plain">
              {current.items.map((item, index) => (
                <li key={item} style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="flow-sheet-marker" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flow-demo-explanation">
            <h4>{current.action}</h4>
            <p>{current.detail}</p>
            <p className="small muted">
              Langkah {step + 1} dari {steps.length}
              {playing ? ' · Berlanjut otomatis' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
