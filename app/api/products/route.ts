import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { BASE_UNITS } from '@/lib/units';
import type { Dimension, Unit } from '@/lib/db';

// GET /api/products — list products (filtered)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const activeOnly = searchParams.get('active') !== 'false';

  let rows;
  if (search && category) {
    rows = await sql`
      SELECT * FROM products
      WHERE (name ILIKE ${'%' + search + '%'} OR sku ILIKE ${'%' + search + '%'})
        AND category = ${category}
        AND (${!activeOnly} OR is_active = true)
      ORDER BY name
    `;
  } else if (search) {
    rows = await sql`
      SELECT * FROM products
      WHERE (name ILIKE ${'%' + search + '%'} OR sku ILIKE ${'%' + search + '%'})
        AND (${!activeOnly} OR is_active = true)
      ORDER BY name
    `;
  } else if (category) {
    rows = await sql`
      SELECT * FROM products
      WHERE category = ${category}
        AND (${!activeOnly} OR is_active = true)
      ORDER BY name
    `;
  } else {
    rows = await sql`
      SELECT * FROM products
      WHERE (${!activeOnly} OR is_active = true)
      ORDER BY name
    `;
  }

  return NextResponse.json(rows);
}

// POST /api/products — create product (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, sku, description, category, dimension, price_per_base_unit_inr, stock_quantity, ordered_unit } = body;

  if (!name || !sku || !dimension || !price_per_base_unit_inr) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const base_unit: Unit = BASE_UNITS[dimension as Dimension];
  const pricePaise = Math.round(Number(price_per_base_unit_inr) * 100);

  const [product] = await sql`
    INSERT INTO products (name, sku, description, category, dimension, base_unit, stock_quantity, price_per_base_unit_paise)
    VALUES (${name}, ${sku.toUpperCase()}, ${description || ''}, ${category || 'General'}, ${dimension}, ${base_unit}, ${Number(stock_quantity) || 0}, ${pricePaise})
    RETURNING *
  `;

  return NextResponse.json(product, { status: 201 });
}
