import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.ts';

describe('admin password hash', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('kata sandi panjang 123');
    expect(hash).toMatch(/^pbkdf2-sha256\$100000\$[^$]+\$[^$]+$/);
    expect(await verifyPassword({ hash, password: 'kata sandi panjang 123' })).toBe(true);
    expect(await verifyPassword({ hash, password: 'kata sandi panjang 124' })).toBe(false);
  });

  it('salts every hash and rejects unknown formats', async () => {
    expect(await hashPassword('sama')).not.toBe(await hashPassword('sama'));
    expect(await verifyPassword({ hash: 'abc:def', password: 'x' })).toBe(false);
    expect(await verifyPassword({ hash: 'pbkdf2-sha256$x$a$b', password: 'x' })).toBe(false);
  });
});
