import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import PublicCatalogueClient from './PublicCatalogueClient';

export default async function Home() {
  // Fetch active products
  const products = await sql`
    SELECT * FROM products WHERE is_active = true ORDER BY category, name
  `;

  // Fetch session
  const session = await getServerSession(authOptions);
  const user = session?.user ? {
    name: String(session.user.name),
    email: String(session.user.email),
    role: String((session.user as any).role),
  } : null;

  return (
    <PublicCatalogueClient
      products={products as any}
      user={user}
    />
  );
}
