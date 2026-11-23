// Same-origin door to apps/api for admin login and admin writes. The session cookie stays
// first-party on the web origin and API_BASE_URL never reaches the browser.
// Public data is not proxied here: pages fetch it on the server (src/lib/api.ts).
const ALLOWED = new Set(['auth', 'admin']);
const FORWARDED = ['cookie', 'content-type', 'origin', 'user-agent', 'accept'];

const gagal = (status: number, kode: string, pesan: string) =>
  Response.json({ error: { kode, pesan } }, { status });

async function forward(req: Request, ctx: RouteContext<'/api/[...path]'>) {
  const { path } = await ctx.params;
  const base = process.env.API_BASE_URL;
  if (!base || !ALLOWED.has(path[0] ?? ''))
    return gagal(404, 'TIDAK_DITEMUKAN', 'Endpoint tidak ditemukan.');

  const headers = new Headers();
  for (const name of FORWARDED) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const target = new URL(`/api/${path.map(encodeURIComponent).join('/')}`, base);
  target.search = new URL(req.url).search;

  let res: Response;
  try {
    res = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'GET' ? undefined : await req.arrayBuffer(),
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    return gagal(502, 'API_TIDAK_TERHUBUNG', 'Server data tidak dapat dihubungi. Coba lagi nanti.');
  }

  // Copy only what the browser needs; the body is already decoded, so encoding headers must not pass.
  const out = new Headers({ 'cache-control': 'no-store' });
  const type = res.headers.get('content-type');
  if (type) out.set('content-type', type);
  for (const cookie of res.headers.getSetCookie()) out.append('set-cookie', cookie);
  return new Response(res.body, { status: res.status, headers: out });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
