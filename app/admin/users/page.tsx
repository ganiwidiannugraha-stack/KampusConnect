import { getUsers, getRoles, getOrganizations } from './actions';
import { UsersClient } from './UsersClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kelola Pengguna | KampusConnect Admin',
  description: 'Manajemen pengguna dan mahasiswa KampusConnect',
};

export default async function AdminUsersPage() {
  const users = await getUsers();
  const roles = await getRoles();
  const organizations = await getOrganizations();

  return (
    <main className="p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-foreground">Kelola Pengguna</h1>
        <p className="text-muted-foreground font-medium">
          Manajemen akses admin dan akun mahasiswa yang terdaftar di KampusConnect.
        </p>
      </div>

      <UsersClient 
        users={users} 
        roles={roles} 
        organizations={organizations} 
      />
    </main>
  );
}
