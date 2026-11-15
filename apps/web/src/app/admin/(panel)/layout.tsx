import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/AdminForms';
import { getAdminSession } from '@/lib/admin';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/masuk');
  return (
    <>
      <div className="band">
        <div className="container admin-bar">
          <nav aria-label="Admin">
            <ul className="admin-nav">
              <li>
                <Link href="/admin">Ringkasan</Link>
              </li>
              <li>
                <Link href="/admin/impor">Impor CSV</Link>
              </li>
              <li>
                <Link href="/admin/sumber">Dokumen sumber</Link>
              </li>
              <li>
                <Link href="/admin/bukti">Bukti program</Link>
              </li>
            </ul>
          </nav>
          <p className="small muted admin-user">
            Masuk sebagai {session.user.name} ({session.user.email}) <LogoutButton />
          </p>
        </div>
      </div>
      <div className="section container">{children}</div>
    </>
  );
}
