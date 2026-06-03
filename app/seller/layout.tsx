import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Nav from '@/components/Nav';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  // Admins can also browse seller side
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Nav />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: '#f8f9fb' }}>
        {children}
      </main>
    </div>
  );
}
