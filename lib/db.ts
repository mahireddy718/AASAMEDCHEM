import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

let bootstrapPromise: Promise<void> | null = null;

async function bootstrapSchema() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id             SERIAL PRIMARY KEY,
          email          TEXT NOT NULL UNIQUE,
          name           TEXT NOT NULL,
          role           TEXT NOT NULL CHECK (role IN ('admin','seller')),
          password_hash  TEXT NOT NULL,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id                          SERIAL PRIMARY KEY,
          name                        TEXT NOT NULL,
          sku                         TEXT NOT NULL UNIQUE,
          description                 TEXT NOT NULL DEFAULT '',
          category                    TEXT NOT NULL DEFAULT 'General',
          dimension                   TEXT NOT NULL CHECK (dimension IN ('weight','volume','count')),
          base_unit                   TEXT NOT NULL CHECK (base_unit IN ('g','kg','mL','L','unit')),
          stock_quantity              NUMERIC(20,6) NOT NULL DEFAULT 0,
          price_per_base_unit_paise   NUMERIC(20,6) NOT NULL DEFAULT 0,
          is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
          created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id           SERIAL PRIMARY KEY,
          user_id      INTEGER NOT NULL REFERENCES users(id),
          status       TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','fulfilled','cancelled')),
          notes        TEXT NOT NULL DEFAULT '',
          total_paise  NUMERIC(20,2) NOT NULL DEFAULT 0,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id                   SERIAL PRIMARY KEY,
          order_id             INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id           INTEGER NOT NULL REFERENCES products(id),
          product_name         TEXT NOT NULL,
          ordered_unit         TEXT NOT NULL CHECK (ordered_unit IN ('g','kg','mL','L','unit')),
          ordered_quantity     NUMERIC(20,6) NOT NULL,
          base_quantity        NUMERIC(20,6) NOT NULL,
          unit_price_paise     NUMERIC(20,6) NOT NULL,
          total_paise          NUMERIC(20,2) NOT NULL
        )
      `);
    })().catch(error => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}

interface SqlFunction {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  unsafe(text: string): { isUnsafeRawSql: boolean; text: string };
}

const sql: SqlFunction = Object.assign(
  async function (strings: TemplateStringsArray, ...values: any[]) {
    await bootstrapSchema();
    let text = '';
    const queryValues: any[] = [];
    let paramIndex = 1;

    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) {
        const val = values[i];
        if (val && typeof val === 'object' && val.isUnsafeRawSql) {
          text += val.text;
        } else {
          text += `$${paramIndex++}`;
          queryValues.push(val);
        }
      }
    }

    const result = await pool.query(text, queryValues);
    return result.rows;
  },
  {
    unsafe: (text: string) => ({ isUnsafeRawSql: true, text }),
  }
);

export default sql;

// ─── Types matching DB schema ─────────────────────────────────────────────────

export type Unit = 'g' | 'kg' | 'L' | 'mL' | 'unit';
export type Dimension = 'weight' | 'volume' | 'count';
export type Role = 'admin' | 'seller';
export type OrderStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: string;
  dimension: Dimension;
  base_unit: Unit;
  // stored as NUMERIC(20,6) – always in base_unit
  stock_quantity: string;
  // stored as NUMERIC(20,6) – price per 1 base_unit in paise (INR × 100)
  price_per_base_unit_paise: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  ordered_unit: Unit;
  // quantity in the unit the customer chose
  ordered_quantity: string;
  // quantity converted to base_unit (what we deduct from stock)
  base_quantity: string;
  // unit price in paise at time of order
  unit_price_paise: string;
  // total in paise
  total_paise: string;
}

export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  status: OrderStatus;
  notes: string;
  // grand total in paise
  total_paise: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
