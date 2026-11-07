'use client';

import type { Daerah } from '@jejakjanji/shared';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATATAN_TINJAU_HUKUM, PERPANJANGAN_HARI_KERJA, TENGGAT_HARI_KERJA } from '@/content/legal';
import { formatTanggal } from '@/lib/format';
import { hariIni, selisihHariKerja, tambahHariKerja } from '@/lib/hari-kerja';
import {
  PERANGKAT_DAERAH_MAX,
  STATUS_LABEL,
  STATUS_PERMOHONAN,
  STORAGE_KEY,
  bacaSimpanan,
  simpanSimpanan,
  type Permohonan,
  type StatusPermohonan,
} from '@/lib/pelacak-store';
import { unduh } from '@/lib/unduh';
import { DateField } from './DateField';
import { Icon } from './Icon';
import { StatePanel } from './States';
import { ThemedSelect } from './ThemedSelect';

type ProgramOpt = { kode: string; nama: string };

function tenggat(p: Permohonan) {
  const dasar = tambahHariKerja(p.tanggalKirim, TENGGAT_HARI_KERJA);
  return p.status === 'diperpanjang' ? tambahHariKerja(dasar, PERPANJANGAN_HARI_KERJA) : dasar;
}

export function RequestTracker({
  programs,
  pilihAwal,
  region,
}: {
  programs: ProgramOpt[];
  region: Daerah;
  pilihAwal?: string;
}) {
  const [items, setItems] = useState<Permohonan[] | null>(null);
  const [pesan, setPesan] = useState('');
  const [today, setToday] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [rawBackup, setRawBackup] = useState<string>();
  const [baruId, setBaruId] = useState<string>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const r = bacaSimpanan(raw);
      setItems(r.ok ? r.data.permohonan : []);
      if (!r.ok) {
        setBlocked(true);
        setRawBackup(raw ?? undefined);
        setPesan(
          'Data tersimpan rusak atau tidak dikenali. Data asli tidak diubah; unduh cadangan mentah untuk pemulihan.',
        );
      } else if (raw && JSON.parse(raw).versi === 1 && !simpanSimpanan(localStorage, r.data)) {
        setBlocked(true);
        setPesan(
          'Migrasi penyimpanan gagal. Data versi lama tetap tersedia; browser menolak penulisan.',
        );
      }
    } catch {
      setItems([]);
      setBlocked(true);
      setPesan('Penyimpanan browser tidak dapat diakses. Tidak ada data yang ditimpa.');
    }
    setToday(hariIni());
  }, []);

  function simpan(next: Permohonan[], info: string) {
    if (blocked) return false;
    try {
      if (!simpanSimpanan(localStorage, { versi: 2, permohonan: next })) {
        setPesan('Gagal menyimpan atau membuat cadangan. Data sebelumnya tidak diganti.');
        return false;
      }
      setItems(next);
      setPesan(info);
      return true;
    } catch {
      setPesan('Browser menolak menyimpan data. Data sebelumnya tidak diganti.');
      return false;
    }
  }

  function tambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const kode = String(f.get('program') ?? '');
    const prog = programs.find((p) => p.kode === kode);
    const pd = String(f.get('perangkat') ?? '').trim();
    const tgl = String(f.get('tanggal') ?? '');
    if (!prog || !pd || !/^\d{4}-\d{2}-\d{2}$/.test(tgl)) {
      setPesan('Lengkapi program, perangkat daerah, dan tanggal kirim.');
      return;
    }
    const baru: Permohonan = {
      id: crypto.randomUUID(),
      daerahKode: region.kode,
      daerahSlug: region.slug,
      daerahNama: region.nama,
      programKode: prog.kode,
      programNama: prog.nama,
      perangkatDaerah: pd.slice(0, PERANGKAT_DAERAH_MAX),
      tanggalKirim: tgl,
      status: 'belum_dijawab',
    };
    const saved = simpan(
      [...(items ?? []), baru],
      `Tersimpan. Tenggat perkiraan ${formatTanggal(tenggat(baru))}.`,
    );
    if (saved) {
      setBaruId(baru.id);
      e.currentTarget.reset();
    }
  }

  async function impor(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (blocked) return;
    if (file.size > 2_000_000) {
      setPesan('Berkas terlalu besar; maksimal 2 MB.');
      return;
    }
    let raw: string;
    try {
      raw = await file.text();
    } catch {
      setPesan('Berkas gagal dibaca. Data lama tidak diganti.');
      return;
    }
    const r = bacaSimpanan(raw);
    if (!r.ok) {
      setPesan('Berkas tidak bisa diimpor: format tidak dikenali atau datanya rusak.');
      return;
    }
    if (
      items?.length &&
      !confirm(
        'Impor mengganti data seluruh daerah. Cadangan data lama akan diunduh sebelum penggantian. Lanjutkan?',
      )
    ) {
      return;
    }
    if (items?.length) {
      try {
        unduh(
          `cadangan-pelacak-${hariIni()}.json`,
          JSON.stringify({ versi: 2, permohonan: items }, null, 2),
          'application/json',
        );
      } catch {
        setPesan('Cadangan gagal diunduh; impor dibatalkan.');
        return;
      }
    }
    simpan(r.data.permohonan, `${r.data.permohonan.length} permohonan diimpor.`);
  }

  const all = items ?? [];
  const daftar = all.filter((item) => item.daerahKode === region.kode);
  const adaProgram = programs.length > 0;

  return (
    <div className="stack">
      <section className="storage-panel" aria-labelledby="simpan-title">
        <h2 id="simpan-title">
          <Icon name="hard-drive" size={20} />
          Data hanya tersimpan di browser ini.
        </h2>
        <p>
          Catatan memakai localStorage dan tidak dikirim ke server. Menghapus data browser dapat
          menghapus catatan Anda. Ekspor JSON secara berkala; impor kembali file itu untuk
          memulihkan catatan di browser pilihan Anda.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            disabled={!all.length}
            onClick={() =>
              unduh(
                `pelacak-jejakjanji-${hariIni()}.json`,
                JSON.stringify({ versi: 2, permohonan: all }, null, 2),
                'application/json',
              )
            }
          >
            Ekspor JSON<span className="sr-only"> (semua daerah)</span>
          </button>
          <label className="btn">
            Impor JSON<span className="sr-only"> (unggah file)</span>
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              disabled={blocked}
              onChange={impor}
            />
          </label>
        </div>
      </section>
      <form className="box" onSubmit={tambah} aria-labelledby="catat-title">
        <h2 id="catat-title" className="box-title">
          Catat permohonan baru
        </h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="program">Program</label>
            <ThemedSelect
              id="program"
              name="program"
              required
              defaultValue={pilihAwal ?? ''}
              disabled={!adaProgram}
              options={[
                {
                  value: '',
                  label: adaProgram ? 'Pilih program' : 'Daftar program kosong',
                  disabled: true,
                },
                ...programs.map((p) => ({ value: p.kode, label: `${p.nama} (${p.kode})` })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="perangkat">Perangkat daerah tujuan</label>
            <input id="perangkat" name="perangkat" required maxLength={PERANGKAT_DAERAH_MAX} />
          </div>
          <div className="field">
            <label htmlFor="tanggal">Tanggal kirim</label>
            <DateField id="tanggal" name="tanggal" required defaultValue={today} key={today} />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginBlock: 'var(--space-4)' }}
          disabled={!adaProgram || items == null || blocked}
        >
          Simpan dan hitung tenggat
        </button>
        <div className="notice small">
          <p>
            Tenggat perkiraan: {TENGGAT_HARI_KERJA} hari kerja setelah tanggal kirim, ditambah{' '}
            {PERPANJANGAN_HARI_KERJA} hari kerja bila diperpanjang. Hanya Sabtu dan Minggu yang
            dilewati; hari libur nasional belum diperhitungkan, jadi anggap tanggal ini perkiraan.
          </p>
          <p>
            Tenggat menurut ketentuan layanan dimulai sejak permohonan diterima PPID. Perkiraan ini
            memakai tanggal kirim yang Anda catat; tanggal penerimaan dapat berbeda. Pilih status
            diperpanjang hanya jika ada pemberitahuan tertulis dari PPID.
          </p>
          <p>{CATATAN_TINJAU_HUKUM}</p>
        </div>
      </form>

      <p role="status">{pesan}</p>
      {rawBackup && (
        <button
          className="btn"
          type="button"
          onClick={() =>
            unduh(`cadangan-mentah-pelacak-${hariIni()}.json`, rawBackup, 'application/json')
          }
        >
          Unduh cadangan mentah
        </button>
      )}

      <section aria-labelledby="daftar-title">
        <h2 id="daftar-title" className="section-title request-list-title">
          Permohonan saya di {region.nama} ({daftar.length})
        </h2>
        {items == null ? (
          <p className="muted">Memuat data dari browser ini...</p>
        ) : daftar.length === 0 ? (
          <StatePanel
            level={2}
            icon="folder-open"
            title="Belum ada catatan permohonan"
            actions={
              <Link className="btn btn-primary" href={`/${region.slug}/program`}>
                Pilih program untuk draf PPID
              </Link>
            }
          >
            <p>
              Mulai dari program yang ingin Anda pahami. Buat draf, kirim sendiri melalui kanal
              PPID, lalu catat permohonannya di sini.
            </p>
          </StatePanel>
        ) : (
          <ul className="list-plain request-list">
            {daftar.map((p) => {
              const t = tenggat(p);
              const sisa = today ? selisihHariKerja(today, t) : null;
              const selesai = p.status === 'dijawab' || p.status === 'ditolak';
              return (
                <li
                  key={p.id}
                  className={p.id === baruId ? 'request-card row-new' : 'request-card'}
                >
                  <div>
                    <p className="xsmall muted">
                      {p.daerahNama} › <span className="kode">{p.programKode}</span>
                    </p>
                    <h3>{p.programNama}</h3>
                  </div>
                  <dl className="request-facts">
                    <div>
                      <dt>Perangkat daerah</dt>
                      <dd>{p.perangkatDaerah}</dd>
                    </div>
                    <div>
                      <dt>Dikirim</dt>
                      <dd>{formatTanggal(p.tanggalKirim)}</dd>
                    </div>
                    <div>
                      <dt>Tenggat perkiraan</dt>
                      <dd>
                        {formatTanggal(t)}
                        {!selesai && sisa != null && (
                          <span className="xsmall muted">
                            {' '}
                            · {sisa >= 0 ? `sisa ${sisa} hari kerja` : `lewat ${-sisa} hari kerja`}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                  <div className="request-actions">
                    <div className="field">
                      <label htmlFor={`status-${p.id}`}>
                        Status<span className="sr-only"> permohonan {p.programKode}</span>
                      </label>
                      <ThemedSelect
                        id={`status-${p.id}`}
                        value={p.status}
                        disabled={blocked}
                        onChange={(e) =>
                          simpan(
                            all.map((x) =>
                              x.id === p.id
                                ? { ...x, status: e.target.value as StatusPermohonan }
                                : x,
                            ),
                            'Status diperbarui.',
                          )
                        }
                        options={STATUS_PERMOHONAN.map((s) => ({
                          value: s,
                          label: STATUS_LABEL[s],
                        }))}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn"
                      disabled={blocked}
                      onClick={() =>
                        confirm(`Hapus permohonan ${p.programKode}?`) &&
                        simpan(
                          all.filter((x) => x.id !== p.id),
                          'Permohonan dihapus.',
                        )
                      }
                    >
                      Hapus<span className="sr-only"> permohonan {p.programKode}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
