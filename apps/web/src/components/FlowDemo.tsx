'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ProgramDetail } from '@jejakjanji/shared';
import { SourceBox } from './SourceBox';
import { StatusBadge } from './StatusBadge';
import { ThemedSelect } from './ThemedSelect';
import { namaProgram } from '@/lib/format';
import { INFORMASI, pilihanUntukTahap, type TahapDiminta } from '@/lib/surat';
import { scheduleFlowPlayback } from '@/lib/flow-playback';

type DemoProgram = NonNullable<ProgramDetail['data']>;
const NO_PROGRAMS: DemoProgram[] = [];

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

export function FlowDemo({ programs = NO_PROGRAMS }: { programs?: DemoProgram[] }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [autoMenu, setAutoMenu] = useState<'closed' | 'open' | 'highlight'>('closed');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [programCode, setProgramCode] = useState('');
  const [evidenceStage, setEvidenceStage] = useState<'rencana' | 'anggaran' | 'pelaksanaan'>(
    'rencana',
  );
  const [requestedStage, setRequestedStage] = useState<TahapDiminta>('pelaksanaan');
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = panel.current;
    const scene = element?.firstElementChild;
    if (!element || !scene) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let animation: Animation | undefined;
    const resize = () => {
      const style = getComputedStyle(element);
      const next =
        scene.getBoundingClientRect().height +
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom);
      const previous =
        animation?.playState === 'running'
          ? element.getBoundingClientRect().height
          : (panelHeight.current ?? next);
      animation?.cancel();
      panelHeight.current = next;
      if (!motion.matches && Math.abs(previous - next) > 1) {
        animation = element.animate([{ height: `${previous}px` }, { height: `${next}px` }], {
          duration: 320,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        });
      }
    };
    const stop = () => {
      animation?.cancel();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    motion.addEventListener('change', stop);
    resize();
    return () => {
      panelHeight.current = element.getBoundingClientRect().height;
      animation?.cancel();
      observer.disconnect();
      motion.removeEventListener('change', stop);
    };
  }, [step]);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = panel.current?.querySelectorAll(
      '.flow-evidence-result, .flow-request-preview, .flow-demo-interaction > .source',
    );
    const animations = [...(elements ?? [])].map((element) =>
      element.animate(
        [
          { opacity: 0.72, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      ),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [evidenceStage, requestedStage, programCode]);

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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlaying(false);
      return;
    }
    setAutoMenu('closed');
    setDetailsOpen(false);
    return scheduleFlowPlayback(step, (action) => {
      if (action === 'open-program') setAutoMenu('open');
      if (action === 'highlight-program') setAutoMenu('highlight');
      if (action === 'select-program') {
        setProgramCode((programs[1] ?? programs[0])?.kode ?? '');
        setAutoMenu('closed');
      }
      if (action === 'open-detail') setDetailsOpen(true);
      if (action === 'show-budget') {
        setEvidenceStage('anggaran');
        setRequestedStage('anggaran');
      }
      if (action === 'show-implementation') {
        setEvidenceStage('pelaksanaan');
        setRequestedStage('pelaksanaan');
      }
      if (action === 'next') setStep((value) => value + 1);
      if (action === 'finish') setPlaying(false);
    });
  }, [playing, step, programs]);

  const current = steps[step] ?? steps[0];
  const program = programs.find((p) => p.kode === programCode) ?? programs[0];
  const detailHref = program ? `/dki-jakarta/program/${encodeURIComponent(program.kode)}` : '';
  const requestedItems = pilihanUntukTahap(requestedStage);
  return (
    <div className="flow-demo" ref={root}>
      <div className="flow-demo-heading">
        <div>
          <h3>Coba alurnya sebelum mulai</h3>
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
              if (!playing && (step === 0 || step === steps.length - 1)) {
                setStep(0);
                setProgramCode(programs[0]?.kode ?? '');
                setEvidenceStage('rencana');
                setRequestedStage('pelaksanaan');
              }
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
      <div
        id="flow-demo-panel"
        ref={panel}
        className="flow-demo-panel"
        aria-live={playing ? 'off' : 'polite'}
      >
        <div className="flow-demo-scene" key={step}>
          <div className="flow-demo-sheet">
            <p className="flow-sheet-title">{current.page}</p>
            {program ? (
              <div
                className="flow-demo-interaction"
                onFocusCapture={() => setPlaying(false)}
                onClickCapture={() => setPlaying(false)}
              >
                {step === 0 && (
                  <>
                    <label htmlFor="flow-program">Pilih contoh program · DKI Jakarta</label>
                    <ThemedSelect
                      id="flow-program"
                      disabled={!ready}
                      value={program.kode}
                      options={programs.map((p) => ({
                        value: p.kode,
                        label: `${p.kode} · ${namaProgram(p.nama)}`,
                      }))}
                      onChange={(event) => setProgramCode(event.target.value)}
                    />
                    {playing && autoMenu !== 'closed' && (
                      <div className="flow-auto-options" aria-hidden="true">
                        {programs.map((item, index) => (
                          <div
                            className={
                              autoMenu === 'highlight' && index === (programs.length > 1 ? 1 : 0)
                                ? 'flow-auto-option is-highlighted'
                                : 'flow-auto-option'
                            }
                            key={item.kode}
                          >
                            {item.kode} · {namaProgram(item.nama)}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="small">
                      Contoh dari data yang sudah dikurasi. Pilihan ini dipakai sepanjang demo.
                    </p>
                    <SourceBox doc={program.sumber} pages={[program.pageRef]} />
                  </>
                )}
                {step !== 0 && (
                  <p className="flow-program-name">
                    {namaProgram(program.nama)}{' '}
                    <span className="small muted">({program.kode})</span>
                  </p>
                )}
                {step === 1 && (
                  <>
                    <details
                      open={detailsOpen}
                      onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
                    >
                      <summary>Lihat indikator dan target</summary>
                      <p>
                        {program.indikator} ({program.satuan})
                      </p>
                      <p>Target 2026: {program.target2026}</p>
                    </details>
                    <SourceBox doc={program.sumber} pages={[program.pageRef]} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="flow-evidence-choices" aria-label="Pilih tahap bukti">
                      {(['rencana', 'anggaran', 'pelaksanaan'] as const).map((stage) => (
                        <button
                          key={stage}
                          className="btn"
                          type="button"
                          aria-pressed={stage === evidenceStage}
                          onClick={() => setEvidenceStage(stage)}
                        >
                          {stage === 'rencana'
                            ? 'Rencana'
                            : stage === 'anggaran'
                              ? 'Anggaran'
                              : 'Pelaksanaan'}
                        </button>
                      ))}
                    </div>
                    <div className="flow-evidence-result" aria-live="polite">
                      <StatusBadge
                        jenis={evidenceStage}
                        status={program.statusBukti[evidenceStage]}
                      />
                      {program.statusBukti[evidenceStage] === 'ada' ? (
                        <p className="small">
                          Dokumen sumber tercatat untuk tahap ini. Periksa rujukan lengkap di Detail
                          Program.
                        </p>
                      ) : (
                        <p className="small">
                          Bukti belum tersedia dalam data kurasi. Ini bukan kesimpulan bahwa program
                          gagal.
                        </p>
                      )}
                      <Link href={detailHref}>Lihat bukti lengkap program ini</Link>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <fieldset className="flow-request">
                      <legend>Informasi yang ingin diminta</legend>
                      {(['anggaran', 'pelaksanaan'] as const).map((stage) => (
                        <label key={stage}>
                          <input
                            type="radio"
                            name="flow-request"
                            value={stage}
                            checked={requestedStage === stage}
                            onChange={() => setRequestedStage(stage)}
                          />
                          {stage === 'anggaran'
                            ? 'Realisasi anggaran'
                            : 'Capaian dan laporan pelaksanaan'}
                        </label>
                      ))}
                    </fieldset>
                    <div className="flow-request-preview" aria-live="polite">
                      <p className="small">
                        <strong>Cuplikan permintaan</strong>
                      </p>
                      <p className="small">Informasi yang diminta untuk program {program.kode}:</p>
                      <ul>
                        {INFORMASI.filter((item) => requestedItems[item.key]).map((item) => (
                          <li key={item.key}>{item.teks}</li>
                        ))}
                      </ul>
                    </div>
                    <Link className="btn" href={`${detailHref}/ppid?minta=${requestedStage}`}>
                      Lanjutkan ke Draf PPID
                    </Link>
                  </>
                )}
                {step === 4 && (
                  <>
                    <details
                      open={detailsOpen}
                      onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
                    >
                      <summary>Apa yang dicatat di Pelacak?</summary>
                      <p className="small">
                        Program, tanggal kirim, dan status tindak lanjut. Perkiraan tenggat belum
                        memperhitungkan hari libur nasional.
                      </p>
                      <p className="small">
                        Catatan tersimpan di browser. Ekspor cadangan sebelum berpindah perangkat.
                      </p>
                    </details>
                    <p className="small">Demo ini tidak membuat catatan permohonan.</p>
                    <Link className="btn" href="/dki-jakarta/pelacak">
                      Buka Pelacak
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <ul className="list-plain">
                {current.items.map((item, index) => (
                  <li key={item} style={{ animationDelay: `${index * 100}ms` }}>
                    <span className="flow-sheet-marker" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flow-demo-explanation">
            <h4>{current.action}</h4>
            <p>{current.detail}</p>
            {program && (
              <p className="small muted">
                Contoh nyata DKI Jakarta. Interaksi di sini hanya untuk mencoba alur.
              </p>
            )}
            <p className="small muted">
              Langkah {step + 1} dari {steps.length}
              {playing ? ' · Berlanjut otomatis' : ''}
            </p>
          </div>
        </div>
      </div>
      {ready && (
        <nav className="flow-demo-controls" aria-label="Navigasi demo">
          <button
            className="btn"
            type="button"
            disabled={step === 0}
            onClick={() => {
              setPlaying(false);
              setStep(step - 1);
            }}
          >
            Sebelumnya
          </button>
          <span className="small muted">
            {step + 1} / {steps.length}
          </span>
          <button
            className="btn"
            type="button"
            disabled={step === steps.length - 1}
            onClick={() => {
              setPlaying(false);
              setStep(step + 1);
            }}
          >
            Berikutnya
          </button>
        </nav>
      )}
    </div>
  );
}
