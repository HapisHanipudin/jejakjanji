'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Daerah } from '@jejakjanji/shared';
import { DateField } from './DateField';
import { ThemedSelect } from './ThemedSelect';

type Hasil =
  { ok: true; data: unknown } | { ok: false; status: number; pesan: string; detail: string[] };
type Status = { pending: boolean; hasil?: Hasil; sukses?: string };

/** Calls the same-origin proxy (/api/auth, /api/admin). Never throws. */
async function kirim(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    return { ok: false, status: 0, pesan: 'Server tidak dapat dihubungi.', detail: [] } as Hasil;
  }
  const json = (await res.json().catch(() => null)) as {
    error?: { pesan?: string; detail?: unknown };
  } | null;
  if (res.ok) return { ok: true, data: json } as Hasil;
  const detail = Array.isArray(json?.error?.detail) ? json.error.detail : [];
  return {
    ok: false,
    status: res.status,
    pesan:
      res.status === 401
        ? 'Sesi admin berakhir. Masuk lagi.'
        : (json?.error?.pesan ?? `Permintaan gagal (status ${res.status}).`),
    // Import errors are strings; zod issues are objects with path and message.
    detail: detail.map((d: unknown) =>
      typeof d === 'string'
        ? d
        : `${(d as { path?: string[] }).path?.join('.') ?? ''}: ${(d as { message?: string }).message ?? ''}`,
    ),
  } as Hasil;
}

function StatusPesan({ status }: { status: Status }) {
  const { hasil, sukses, pending } = status;
  if (pending)
    return (
      <p role="status" className="small muted">
        Memproses…
      </p>
    );
  if (!hasil) return <p role="status" className="sr-only" />;
  if (hasil.ok)
    return (
      <div className="notice" role="status">
        <p>{sukses ?? 'Tersimpan.'}</p>
      </div>
    );
  return (
    <div className="notice" role="alert">
      <p>
        <strong>{hasil.pesan}</strong>
      </p>
      {hasil.detail.length > 0 && (
        <ul className="admin-errors">
          {hasil.detail.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const str = (data: FormData, name: string) => {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ pending: false });

  async function masuk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus({ pending: true });
    const hasil = await kirim('/api/auth/sign-in/email', 'POST', {
      email: str(data, 'email'),
      password: data.get('password'),
    });
    if (hasil.ok) {
      router.replace('/admin');
      router.refresh();
      return;
    }
    // Better Auth answers in English; the interface speaks Indonesian.
    const pesan =
      hasil.status === 429
        ? 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.'
        : hasil.status === 401 || hasil.status === 400
          ? 'Email atau kata sandi salah.'
          : hasil.pesan;
    setStatus({ pending: false, hasil: { ...hasil, pesan, detail: [] } });
  }

  return (
    <form className="box admin-login" onSubmit={masuk} aria-labelledby="masuk-title">
      <h1 id="masuk-title" className="box-title">
        Masuk admin
      </h1>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={status.pending}>
        Masuk
      </button>
      <StatusPesan status={status} />
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        await kirim('/api/auth/sign-out', 'POST');
        router.replace('/admin/masuk');
        router.refresh();
      }}
    >
      Keluar
    </button>
  );
}

const RINGKASAN: Record<string, string> = {
  bidang: 'bidang urusan',
  program: 'program',
  pagu: 'baris pagu',
  evidenceBaru: 'bukti RENCANA baru',
};

export function ImportForm({ regions }: { regions: Daerah[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ pending: false });
  // Importing is allowed only for the exact input that just passed "Periksa".
  const [lolos, setLolos] = useState<string>();
  const form = useRef<HTMLFormElement>(null);

  async function jalankan(simpan: boolean) {
    if (!form.current?.reportValidity()) return;
    const data = new FormData(form.current);
    const file = data.get('berkas');
    if (!(file instanceof File)) return;
    const body = {
      jenis: str(data, 'jenis'),
      daerahKode: str(data, 'daerahKode'),
      csv: await file.text(),
    };
    const kunci = JSON.stringify(body);
    if (simpan && kunci !== lolos) {
      setLolos(undefined);
      return;
    }
    setStatus({ pending: true });
    const hasil = await kirim('/api/admin/impor', 'POST', { ...body, simpan });
    const ringkasan = hasil.ok
      ? Object.entries((hasil.data as { ringkasan: Record<string, number> }).ringkasan)
          .map(([k, n]) => `${n} ${RINGKASAN[k] ?? k}`)
          .join(', ')
      : '';
    setLolos(hasil.ok && !simpan ? kunci : undefined);
    setStatus({
      pending: false,
      hasil,
      sukses: simpan
        ? `Impor selesai: ${ringkasan}.`
        : `Lolos pemeriksaan: ${ringkasan}. Belum ada yang disimpan.`,
    });
    if (hasil.ok && simpan) router.refresh();
  }

  return (
    <form
      ref={form}
      className="box"
      aria-labelledby="impor-title"
      onSubmit={(e) => {
        e.preventDefault();
        void jalankan(false);
      }}
      onChange={() => setLolos(undefined)}
    >
      <h2 id="impor-title" className="box-title">
        Impor CSV
      </h2>
      <div className="form-row">
        <div className="field">
          <label htmlFor="jenis">Jenis berkas</label>
          <ThemedSelect
            id="jenis"
            name="jenis"
            required
            defaultValue="bidang_urusan"
            options={[
              { value: 'bidang_urusan', label: 'bidang_urusan.csv (rupiah penuh)' },
              { value: 'program', label: 'program.csv (juta rupiah)' },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="daerahKode">Daerah</label>
          <ThemedSelect
            id="daerahKode"
            name="daerahKode"
            required
            defaultValue={regions[0]?.kode}
            options={regions.map((r) => ({ value: r.kode, label: `${r.nama} (${r.kode})` }))}
          />
        </div>
        <div className="field">
          <label htmlFor="berkas">Berkas CSV</label>
          <input id="berkas" name="berkas" type="file" accept=".csv,text/csv" required />
        </div>
      </div>
      <div className="btn-row" style={{ marginBlock: 'var(--space-4)' }}>
        <button type="submit" className="btn btn-primary" disabled={status.pending}>
          Periksa
        </button>
        <button
          type="button"
          className="btn"
          disabled={status.pending || !lolos}
          onClick={() => void jalankan(true)}
        >
          Impor ke database
        </button>
      </div>
      <StatusPesan status={status} />
    </form>
  );
}

export function SourceForm({ regions }: { regions: Daerah[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ pending: false });

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const data = new FormData(el);
    setStatus({ pending: true });
    const hasil = await kirim('/api/admin/sumber', 'POST', {
      daerahKode: str(data, 'daerahKode'),
      title: str(data, 'title'),
      type: str(data, 'type'),
      url: str(data, 'url') || null,
      version: str(data, 'version'),
      checkedAt: str(data, 'checkedAt'),
    });
    setStatus({ pending: false, hasil, sukses: 'Dokumen sumber ditambahkan.' });
    if (hasil.ok) {
      el.reset();
      router.refresh();
    }
  }

  return (
    <form className="box" onSubmit={simpan} aria-labelledby="sumber-baru-title">
      <h2 id="sumber-baru-title" className="box-title">
        Tambah dokumen sumber
      </h2>
      <div className="form-row">
        <div className="field">
          <label htmlFor="daerahKode">Daerah</label>
          <ThemedSelect
            id="daerahKode"
            name="daerahKode"
            required
            defaultValue={regions[0]?.kode}
            options={regions.map((r) => ({ value: r.kode, label: `${r.nama} (${r.kode})` }))}
          />
        </div>
        <div className="field">
          <label htmlFor="type">Jenis dokumen</label>
          <ThemedSelect
            id="type"
            name="type"
            required
            defaultValue="RPJMD"
            options={[
              { value: 'RPJMD', label: 'RPJMD' },
              { value: 'RKPD', label: 'RKPD' },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="title">Judul dokumen</label>
          <input id="title" name="title" required maxLength={300} />
        </div>
        <div className="field">
          <label htmlFor="version">Versi (nomor peraturan)</label>
          <input id="version" name="version" required maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="url">Tautan PDF resmi (opsional)</label>
          <input id="url" name="url" type="url" />
        </div>
        <div className="field">
          <label htmlFor="checkedAt">Tanggal cek</label>
          <DateField id="checkedAt" name="checkedAt" required />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{ marginBlock: 'var(--space-4)' }}
        disabled={status.pending}
      >
        Simpan dokumen
      </button>
      <StatusPesan status={status} />
    </form>
  );
}

export function EvidenceForm({
  daerahKode,
  programKode,
  docs,
}: {
  daerahKode: string;
  programKode: string;
  docs: { id: number; title: string; version: string }[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ pending: false });

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const data = new FormData(el);
    setStatus({ pending: true });
    const hasil = await kirim('/api/admin/evidence', 'POST', {
      daerahKode,
      programKode,
      jenis: str(data, 'jenis'),
      sourceDocumentId: Number(str(data, 'sourceDocumentId')) || null,
      pageRef: Number(str(data, 'pageRef')) || null,
      cakupanPencarian: str(data, 'cakupanPencarian'),
      checkedAt: str(data, 'checkedAt'),
      catatan: str(data, 'catatan'),
    });
    setStatus({ pending: false, hasil, sukses: 'Bukti ditambahkan.' });
    if (hasil.ok) {
      el.reset();
      router.refresh();
    }
  }

  return (
    <form className="box" onSubmit={simpan} aria-labelledby="bukti-baru-title">
      <h2 id="bukti-baru-title" className="box-title">
        Tambah bukti
      </h2>
      <p className="small muted">
        Bukti dihitung &quot;ada&quot; hanya bila punya dokumen sumber dan halaman PDF. Tanpa
        dokumen, isi cakupan pencarian: catatan itu tetap berstatus &quot;belum diketahui&quot;.
      </p>
      <div className="form-row">
        <div className="field">
          <label htmlFor="jenis">Jenis bukti</label>
          <ThemedSelect
            id="jenis"
            name="jenis"
            required
            defaultValue="PELAKSANAAN"
            options={[
              { value: 'RENCANA', label: 'Rencana' },
              { value: 'ANGGARAN', label: 'Anggaran' },
              { value: 'PELAKSANAAN', label: 'Pelaksanaan' },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="sourceDocumentId">Dokumen sumber</label>
          <ThemedSelect
            id="sourceDocumentId"
            name="sourceDocumentId"
            defaultValue=""
            options={[
              { value: '', label: 'Tanpa dokumen (catatan pencarian)' },
              ...docs.map((d) => ({ value: String(d.id), label: `${d.title} (${d.version})` })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="pageRef">Halaman PDF</label>
          <input id="pageRef" name="pageRef" type="number" min={1} step={1} inputMode="numeric" />
        </div>
        <div className="field">
          <label htmlFor="checkedAt">Tanggal cek</label>
          <DateField id="checkedAt" name="checkedAt" required />
        </div>
        <div className="field">
          <label htmlFor="cakupanPencarian">Cakupan pencarian</label>
          <input id="cakupanPencarian" name="cakupanPencarian" maxLength={2000} />
        </div>
        <div className="field">
          <label htmlFor="catatan">Catatan (opsional)</label>
          <input id="catatan" name="catatan" maxLength={2000} />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{ marginBlock: 'var(--space-4)' }}
        disabled={status.pending}
      >
        Simpan bukti
      </button>
      <StatusPesan status={status} />
    </form>
  );
}

/** One-shot admin action button (delete evidence, toggle verified) that refreshes the page data. */
export function ActionButton({
  path,
  method,
  body,
  confirmText,
  children,
}: {
  path: string;
  method: 'PATCH' | 'DELETE';
  body?: unknown;
  confirmText?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ pending: false });
  return (
    <>
      <button
        type="button"
        className="btn"
        disabled={status.pending}
        onClick={async () => {
          if (confirmText && !window.confirm(confirmText)) return;
          setStatus({ pending: true });
          const hasil = await kirim(path, method, body);
          setStatus({ pending: false, hasil: hasil.ok ? undefined : hasil });
          if (hasil.ok) router.refresh();
        }}
      >
        {children}
      </button>
      {status.hasil && !status.hasil.ok && (
        <span role="alert" className="small">
          {' '}
          {status.hasil.pesan}
        </span>
      )}
    </>
  );
}
