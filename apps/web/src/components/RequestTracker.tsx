'use client';

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
  type Permohonan,
  type StatusPermohonan,
} from '@/lib/pelacak-store';
import { unduh } from '@/lib/unduh';

type ProgramOpt = { kode: string; nama: string };

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function tenggat(p: Permohonan) {
  const dasar = tambahHariKerja(p.tanggalKirim, TENGGAT_HARI_KERJA);
  return p.status === 'diperpanjang' ? tambahHariKerja(dasar, PERPANJANGAN_HARI_KERJA) : dasar;
}

export function RequestTracker({
  programs,
  pilihAwal,
}: {
  programs: ProgramOpt[];
  pilihAwal?: string;
}) {
  const [items, setItems] = useState<Permohonan[] | null>(null);
  const [pesan, setPesan] = useState('');
  const [today, setToday] = useState('');

  useEffect(() => {
    const r = bacaSimpanan(readStorage());
    setItems(r.ok ? r.data.permohonan : []);
    if (!r.ok) {
      setPesan(
        'Data pelacak tersimpan di browser ini rusak atau tidak dikenali, jadi diabaikan. Data itu akan tertimpa saat Anda menyimpan.',
      );
    }
    setToday(hariIni());
  }, []);

  function simpan(next: Permohonan[], info: string) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ versi: 1, permohonan: next }));
      setPesan(info);
    } catch {
      setPesan('Browser menolak menyimpan data (penyimpanan penuh atau diblokir).');
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
      programKode: prog.kode,
      programNama: prog.nama,
      perangkatDaerah: pd.slice(0, PERANGKAT_DAERAH_MAX),
      tanggalKirim: tgl,
      status: 'belum_dijawab',
    };
    simpan(
      [...(items ?? []), baru],
      `Tersimpan. Tenggat perkiraan ${formatTanggal(tenggat(baru))}.`,
    );
    e.currentTarget.reset();
  }

  async function impor(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const r = bacaSimpanan(await file.text());
    if (!r.ok) {
      setPesan('Berkas tidak bisa diimpor: format tidak dikenali atau datanya rusak.');
      return;
    }
    if (
      items?.length &&
      !confirm('Impor akan mengganti semua data pelacak di browser ini. Lanjutkan?')
    ) {
      return;
    }
    simpan(r.data.permohonan, `${r.data.permohonan.length} permohonan diimpor.`);
  }

  const daftar = items ?? [];
  const adaProgram = programs.length > 0;

  return (
    <div className="stack">
      <form className="box" onSubmit={tambah} aria-labelledby="catat-title">
        <h2 id="catat-title">Catat permohonan baru</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="program">Program</label>
            <select
              id="program"
              name="program"
              required
              defaultValue={pilihAwal ?? ''}
              disabled={!adaProgram}
            >
              <option value="" disabled>
                {adaProgram ? 'Pilih program' : 'Daftar program kosong'}
              </option>
              {programs.map((p) => (
                <option key={p.kode} value={p.kode}>
                  {p.nama} ({p.kode})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="perangkat">Perangkat daerah tujuan</label>
            <input id="perangkat" name="perangkat" required maxLength={PERANGKAT_DAERAH_MAX} />
          </div>
          <div className="field">
            <label htmlFor="tanggal">Tanggal kirim</label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              defaultValue={today}
              key={today}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginBlock: 'var(--space-4)' }}
          disabled={!adaProgram || items == null}
        >
          Simpan dan hitung tenggat
        </button>
        <div className="notice small">
          <p>
            Tenggat perkiraan: {TENGGAT_HARI_KERJA} hari kerja setelah tanggal kirim, ditambah{' '}
            {PERPANJANGAN_HARI_KERJA} hari kerja bila diperpanjang. Hanya Sabtu dan Minggu yang
            dilewati; hari libur nasional belum diperhitungkan, jadi anggap tanggal ini perkiraan.
          </p>
          <p>{CATATAN_TINJAU_HUKUM}</p>
        </div>
      </form>

      <p role="status">{pesan}</p>

      <section className="box" aria-labelledby="daftar-title">
        <div className="box-head">
          <h2 id="daftar-title">Permohonan saya ({daftar.length})</h2>
          <div className="btn-row">
            <button
              type="button"
              className="btn"
              disabled={!daftar.length}
              onClick={() =>
                unduh(
                  `pelacak-jejakjanji-${hariIni()}.json`,
                  JSON.stringify({ versi: 1, permohonan: daftar }, null, 2),
                  'application/json',
                )
              }
            >
              Ekspor<span className="sr-only"> (unduh JSON)</span>
            </button>
            <label className="btn">
              Impor<span className="sr-only"> (unggah JSON)</span>
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={impor}
              />
            </label>
          </div>
        </div>
        {items == null ? (
          <p className="muted">Memuat data dari browser ini...</p>
        ) : daftar.length === 0 ? (
          <p className="notice">Belum ada permohonan yang dicatat di browser ini.</p>
        ) : (
          <div className="table-wrap">
            <table className="table-plain table-cards">
              <thead>
                <tr>
                  <th scope="col">Program</th>
                  <th scope="col">Tanggal kirim</th>
                  <th scope="col">Tenggat (perkiraan)</th>
                  <th scope="col">Status (ubah di sini)</th>
                  <th scope="col">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((p) => {
                  const t = tenggat(p);
                  const sisa = today ? selisihHariKerja(today, t) : null;
                  const selesai = p.status === 'dijawab' || p.status === 'ditolak';
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: 'var(--color-heading)' }}>{p.programNama}</strong>
                        <br />
                        <span className="xsmall muted">
                          <span className="kode">{p.programKode}</span> | {p.perangkatDaerah}
                        </span>
                      </td>
                      <td data-label="Dikirim">{formatTanggal(p.tanggalKirim)}</td>
                      <td data-label="Tenggat perkiraan">
                        {formatTanggal(t)}
                        {!selesai && sisa != null && (
                          <span className="xsmall muted">
                            <br />
                            {sisa >= 0 ? `sisa ${sisa} hari kerja` : `lewat ${-sisa} hari kerja`}
                          </span>
                        )}
                      </td>
                      <td data-label="Status permohonan">
                        <label className="sr-only" htmlFor={`status-${p.id}`}>
                          Ubah status permohonan {p.programKode}
                        </label>
                        <select
                          id={`status-${p.id}`}
                          className="select-sm"
                          value={p.status}
                          onChange={(e) =>
                            simpan(
                              daftar.map((x) =>
                                x.id === p.id
                                  ? { ...x, status: e.target.value as StatusPermohonan }
                                  : x,
                              ),
                              'Status diperbarui.',
                            )
                          }
                        >
                          {STATUS_PERMOHONAN.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="num">
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '8px 14px' }}
                          onClick={() =>
                            confirm(`Hapus permohonan ${p.programKode}?`) &&
                            simpan(
                              daftar.filter((x) => x.id !== p.id),
                              'Permohonan dihapus.',
                            )
                          }
                        >
                          Hapus<span className="sr-only"> permohonan {p.programKode}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
