import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import AdminOrdersClient from './AdminOrdersClient';

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const orders = await sql`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
  `;
  const orderIds = orders.map((o: any) => o.id);
  let items: any[] = [];
  if (orderIds.length > 0) {
    items = await sql`SELECT * FROM order_items WHERE order_id = ANY(${orderIds}::int[])`;
  }
  const ordersWithItems = orders.map((o: any) => ({
    ...o,
    items: items.filter((i: any) => i.order_id === o.id),
  }));

  return <AdminOrdersClient initialOrders={ordersWithItems as any} />;
}
