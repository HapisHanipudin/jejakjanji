import type { Metadata } from 'next';
import { PasswordForm } from '@/components/AdminForms';

export const metadata: Metadata = { title: 'Akun' };

export default function AdminAccountPage() {
  return (
    <>
      <h1>Akun</h1>
      <PasswordForm />
      <p className="small muted admin-login">
        Lupa kata sandi? Situs tidak mengirim email, jadi kata sandi diatur ulang oleh pengelola
        server lewat <code>bun run admin:reset-password</code>. Akun admin baru juga dibuat dengan
        cara itu (<code>bun run admin:create</code>).
      </p>
    </>
  );
}
