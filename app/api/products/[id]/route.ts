import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [product] = await sql`SELECT * FROM products WHERE id = ${params.id}`;
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

// PATCH /api/products/[id] — update (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, category, price_per_base_unit_inr, stock_quantity, is_active } = body;

  const pricePaise = price_per_base_unit_inr !== undefined
    ? Math.round(Number(price_per_base_unit_inr) * 100)
    : undefined;

  // Build dynamic update
  const updates: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (name !== undefined) { updates.push(`name = $${i++}`); vals.push(name); }
  if (description !== undefined) { updates.push(`description = $${i++}`); vals.push(description); }
  if (category !== undefined) { updates.push(`category = $${i++}`); vals.push(category); }
  if (pricePaise !== undefined) { updates.push(`price_per_base_unit_paise = $${i++}`); vals.push(pricePaise); }
  if (stock_quantity !== undefined) { updates.push(`stock_quantity = $${i++}`); vals.push(Number(stock_quantity)); }
  if (is_active !== undefined) { updates.push(`is_active = $${i++}`); vals.push(is_active); }

  if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  updates.push(`updated_at = NOW()`);

  const [product] = await sql`
    UPDATE products SET ${sql.unsafe(updates.join(', '))}
    WHERE id = ${params.id}
    RETURNING *
  `;

  return NextResponse.json(product);
}

// DELETE /api/products/[id] — soft delete (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await sql`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}
