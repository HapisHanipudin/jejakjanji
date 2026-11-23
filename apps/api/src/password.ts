// Password hashing for admin accounts: PBKDF2-SHA256 through WebCrypto.
// Better Auth's default scrypt costs ~160 ms of CPU per login; the Workers Free plan allows 10 ms
// per request, with some slack for occasional overruns. PBKDF2 runs natively in workerd at ~35 ms
// for 100,000 iterations (the most workerd accepts), so an occasional login stays within that
// slack, and the sign-in rate limit in auth.ts keeps overruns from becoming consistent.
// ponytail: 100k iterations is below OWASP's 600k for PBKDF2-SHA256; raise it if the Worker
// moves to the Paid plan (verify still reads the count from the stored hash).

const ITERATIONS = 100_000;
const PREFIX = 'pbkdf2-sha256';
const enc = new TextEncoder();

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

/** Format: pbkdf2-sha256$<iterations>$<salt b64>$<hash b64>. */
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${PREFIX}$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt, ITERATIONS))}`;
}

export async function verifyPassword({ hash, password }: { hash: string; password: string }) {
  const [prefix, iter, salt, expected] = hash.split('$');
  const iterations = Number(iter);
  if (prefix !== PREFIX || !salt || !expected || !Number.isSafeInteger(iterations)) return false;
  const actual = await derive(password, unb64(salt), iterations);
  const want = unb64(expected);
  if (actual.length !== want.length) return false;
  // Constant-time compare.
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= actual[i]! ^ want[i]!;
  return diff === 0;
}
