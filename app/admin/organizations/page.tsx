import { getOrganizations } from './actions';
import { OrganizationsClient } from './OrganizationsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kelola Organisasi | KampusConnect Admin',
  description: 'Manajemen organisasi, Himpunan, dan UKM',
};

export default async function AdminOrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <main className="p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-foreground">Kelola Organisasi</h1>
        <p className="text-muted-foreground font-medium">
          Manajemen organisasi, himpunan mahasiswa, dan Unit Kegiatan Mahasiswa (UKM).
        </p>
      </div>

      <OrganizationsClient organizations={organizations} />
    </main>
  );
}
