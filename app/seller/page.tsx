import sql from '@/lib/db';
import SellerCatalogue from './SellerCatalogue';

export default async function SellerPage() {
  const products = await sql`SELECT * FROM products WHERE is_active = true ORDER BY category, name`;
  return <SellerCatalogue initialProducts={products as any} />;
}
