import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { toBaseQuantity, computeLineTotalPaise } from '@/lib/units';
import type { Unit } from '@/lib/db';

// GET /api/orders
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === 'admin';

  let orders;
  if (isAdmin) {
    orders = await sql`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `;
  } else {
    orders = await sql`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.user_id = ${user.id}
      ORDER BY o.created_at DESC
    `;
  }

  // Attach items
  const orderIds = orders.map((o: any) => o.id);
  if (orderIds.length === 0) return NextResponse.json([]);

  const items = await sql`
    SELECT * FROM order_items WHERE order_id = ANY(${orderIds}::int[])
  `;

  const ordersWithItems = orders.map((o: any) => ({
    ...o,
    items: items.filter((i: any) => i.order_id === o.id),
  }));

  return NextResponse.json(ordersWithItems);
}

// POST /api/orders — place order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { items, notes } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items in order' }, { status: 400 });
  }

  // Fetch product prices for each item
  const productIds = items.map((i: any) => i.product_id);
  const products = await sql`
    SELECT id, name, base_unit, price_per_base_unit_paise, stock_quantity, is_active
    FROM products WHERE id = ANY(${productIds}::int[]) AND is_active = true
  `;

  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]));

  let totalPaise = 0;
  const lineItems: any[] = [];

  for (const item of items) {
    const product = productMap[item.product_id];
    if (!product) {
      return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
    }

    const orderedQty = Number(item.quantity);
    const orderedUnit: Unit = item.unit;
    const baseQty = toBaseQuantity(orderedQty, orderedUnit);
    const pricePerBase = Number(product.price_per_base_unit_paise);
    const lineTotalPaise = computeLineTotalPaise(orderedQty, orderedUnit, pricePerBase);

    if (baseQty > Number(product.stock_quantity)) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 400 }
      );
    }

    totalPaise += lineTotalPaise;
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      ordered_unit: orderedUnit,
      ordered_quantity: orderedQty,
      base_quantity: baseQty,
      unit_price_paise: pricePerBase,
      total_paise: lineTotalPaise,
    });
  }

  // Create order in a transaction-like sequence
  const [order] = await sql`
    INSERT INTO orders (user_id, notes, total_paise)
    VALUES (${user.id}, ${notes || ''}, ${totalPaise})
    RETURNING *
  `;

  for (const li of lineItems) {
    await sql`
      INSERT INTO order_items
        (order_id, product_id, product_name, ordered_unit, ordered_quantity, base_quantity, unit_price_paise, total_paise)
      VALUES
        (${order.id}, ${li.product_id}, ${li.product_name}, ${li.ordered_unit},
         ${li.ordered_quantity}, ${li.base_quantity}, ${li.unit_price_paise}, ${li.total_paise})
    `;
    // Deduct stock
    await sql`
      UPDATE products
      SET stock_quantity = stock_quantity - ${li.base_quantity}, updated_at = NOW()
      WHERE id = ${li.product_id}
    `;
  }

  return NextResponse.json({ ...order, items: lineItems }, { status: 201 });
}
