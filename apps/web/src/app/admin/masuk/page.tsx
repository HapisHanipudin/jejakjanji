import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/AdminForms';
import { getAdminSession } from '@/lib/admin';

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin');
  return (
    <div className="section container">
      <LoginForm />
      <p className="small muted admin-login">
        Halaman ini hanya untuk kurator data. Pengunjung tidak perlu akun untuk memakai JejakJanji.
      </p>
    </div>
  );
}
