import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const productId = parseInt(params.id);
  if (isNaN(productId)) {
    notFound();
  }

  // Fetch the product from the database
  const rows = await sql`
    SELECT * FROM products WHERE id = ${productId} LIMIT 1
  `;
  const product = rows[0];

  if (!product) {
    notFound();
  }

  // Check the session
  const session = await getServerSession(authOptions);
  const user = session?.user ? {
    id: String((session.user as any).id),
    email: String(session.user.email),
    name: String(session.user.name),
    role: (session.user as any).role,
  } : null;

  return (
    <ProductDetailClient
      product={product as any}
      user={user as any}
    />
  );
}
