import sql from '@/lib/db';
import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  const products = await sql`SELECT * FROM products ORDER BY name`;
  return <AdminProductsClient initialProducts={products as any} />;
}
