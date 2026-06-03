// scripts/migrate.js
// Run: node scripts/migrate.js
// Requires DATABASE_URL in environment

require('dotenv').config({ path: '.env' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

async function sql(strings, ...values) {
  let text = strings[0] || '';
  for (let index = 0; index < values.length; index += 1) {
    text += `$${index + 1}${strings[index + 1] || ''}`;
  }

  const result = await pool.query(text, values);
  return result.rows;
}

async function main() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      email          TEXT NOT NULL UNIQUE,
      name           TEXT NOT NULL,
      role           TEXT NOT NULL CHECK (role IN ('admin','seller')),
      password_hash  TEXT NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
  `;

  await sql`
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
  `;

  await sql`
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
  `;

  console.log('Seeding users...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const sellerHash = await bcrypt.hash('seller123', 10);

  await sql`
    INSERT INTO users (email, name, role, password_hash) VALUES
      ('admin@aasa.in', 'Admin User', 'admin', ${adminHash}),
      ('seller@aasa.in', 'Seller User', 'seller', ${sellerHash})
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('Seeding products...');

  const products = [
    { name: 'Paracetamol API', sku: 'PARA-001', description: 'Pharmaceutical grade paracetamol active pharmaceutical ingredient', category: 'APIs', dimension: 'weight', base_unit: 'g', stock: 500000, price_per_g_inr: 0.85 },
    { name: 'Ibuprofen API', sku: 'IBUP-001', description: 'High purity ibuprofen for pharmaceutical manufacturing', category: 'APIs', dimension: 'weight', base_unit: 'g', stock: 300000, price_per_g_inr: 1.20 },
    { name: 'Amoxicillin Trihydrate API', sku: 'AMOX-001', description: 'Semi-synthetic antibiotic active pharmaceutical ingredient', category: 'APIs', dimension: 'weight', base_unit: 'g', stock: 450000, price_per_g_inr: 1.45 },
    { name: 'Metformin Hydrochloride API', sku: 'METF-001', description: 'High purity antihyperglycemic active pharmaceutical ingredient', category: 'APIs', dimension: 'weight', base_unit: 'g', stock: 600000, price_per_g_inr: 0.95 },
    { name: 'Ethanol (96%)', sku: 'ETOH-001', description: 'Pharmaceutical grade ethanol, 96% purity', category: 'Solvents', dimension: 'volume', base_unit: 'mL', stock: 2000000, price_per_mL_inr: 0.065 },
    { name: 'Purified Water', sku: 'H2O-001', description: 'USP purified water for pharma use', category: 'Solvents', dimension: 'volume', base_unit: 'mL', stock: 5000000, price_per_mL_inr: 0.005 },
    { name: 'Glycerin USP', sku: 'GLYC-001', description: '99.5% pure pharmaceutical grade glycerin humectant and solvent', category: 'Solvents', dimension: 'volume', base_unit: 'mL', stock: 1500000, price_per_mL_inr: 0.075 },
    { name: 'Saline Solution (0.9%)', sku: 'SALI-001', description: 'Sterile isotonic sodium chloride solution for pharmaceutical compounding', category: 'Solvents', dimension: 'volume', base_unit: 'mL', stock: 3000000, price_per_mL_inr: 0.008 },
    { name: 'HPMC Capsules (Size 0)', sku: 'CAPS-001', description: 'Hydroxypropyl methylcellulose capsules, size 0, vegetarian', category: 'Excipients', dimension: 'count', base_unit: 'unit', stock: 500000, price_per_unit_inr: 1.80 },
    { name: 'Microcrystalline Cellulose', sku: 'MCC-001', description: 'PH-102 grade, excipient for tablet manufacturing', category: 'Excipients', dimension: 'weight', base_unit: 'g', stock: 200000, price_per_g_inr: 0.12 },
    { name: 'Citric Acid Anhydrous', sku: 'CITR-001', description: 'Acidifier and buffering agent for powder compounding and tablets', category: 'Excipients', dimension: 'weight', base_unit: 'g', stock: 250000, price_per_g_inr: 0.15 },
    { name: 'Lactose Monohydrate', sku: 'LACT-001', description: 'Filler and binder excipient for tablet and capsule formulations', category: 'Excipients', dimension: 'weight', base_unit: 'g', stock: 350000, price_per_g_inr: 0.11 },
    { name: 'Isopropyl Alcohol', sku: 'IPA-001', description: '99.9% IPA for cleaning and manufacturing', category: 'Solvents', dimension: 'volume', base_unit: 'mL', stock: 1000000, price_per_mL_inr: 0.055 },
    { name: 'Sodium Stearate', sku: 'NAST-001', description: 'Lubricant for tablet compression', category: 'Excipients', dimension: 'weight', base_unit: 'g', stock: 50000, price_per_g_inr: 0.45 },
  ];

  for (const p of products) {
    const pricePaise = p.price_per_g_inr || p.price_per_mL_inr || p.price_per_unit_inr;
    await sql`
      INSERT INTO products (name, sku, description, category, dimension, base_unit, stock_quantity, price_per_base_unit_paise)
      VALUES (${p.name}, ${p.sku}, ${p.description}, ${p.category}, ${p.dimension}, ${p.base_unit}, ${p.stock}, ${Math.round(pricePaise * 100)})
      ON CONFLICT (sku) DO NOTHING
    `;
  }

  console.log('✅ Migration & seed complete!');
  console.log('\nTest credentials:');
  console.log('  Admin:  admin@aasa.in  / admin123');
  console.log('  Seller: seller@aasa.in / seller123');
}

main().catch(console.error);
