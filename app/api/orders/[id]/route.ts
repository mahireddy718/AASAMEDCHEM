import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

// PATCH /api/orders/[id] — update status (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await req.json();
  const validStatuses = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const [order] = await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  return NextResponse.json(order);
}

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [order] = await sql`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON u.id = o.user_id
    WHERE o.id = ${params.id}
  `;

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = await sql`SELECT * FROM order_items WHERE order_id = ${params.id}`;

  return NextResponse.json({ ...order, items });
}
