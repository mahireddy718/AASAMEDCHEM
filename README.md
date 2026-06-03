# AasaMedChem — Inventory & Order Management

A pharmaceutical-grade inventory and quotation/order management system built with Next.js 14, Neon PostgreSQL, and deployed on Vercel.

---

## Live URL

> **[https://aasa-medchem.vercel.app](https://aasa-medchem.vercel.app)**  
> *(Replace with your actual Vercel URL after deployment)*

---

## Test Credentials

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@aasa.in       | admin123   |
| Seller | seller@aasa.in      | seller123  |

---

## Features

### Admin Panel
- **Dashboard** — live stats (active products, orders, revenue, low-stock alerts)
- **Products** — create, edit, deactivate products; set SKU, category, dimension, price, stock
- **Orders** — view all quotations with full item breakdown; update order status

### Seller Portal
- **Catalogue** — browse/search/filter products by name, SKU, or category
- **Flexible unit selection** — order any product in any supported unit (e.g. kg or g for weight products)
- **Live price preview** — see per-unit price and estimated total before adding to cart
- **Cart & Quotation** — add multiple products, review totals, add notes, place order
- **My Orders** — view order history with full item detail

---

## Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Framework    | Next.js 14 (App Router)               |
| Auth         | NextAuth.js (JWT + credentials)       |
| Database     | Neon PostgreSQL (serverless)          |
| DB Client    | @neondatabase/serverless              |
| Deployment   | Vercel                                |
| Styling      | Tailwind CSS + inline styles          |

---

## System Design

```
Browser
  │
  ├─ /login         — NextAuth credentials provider
  ├─ /admin/*       — Server components (SSR) + Client islands
  └─ /seller/*      — Server components (SSR) + Client islands

Next.js API Routes (/app/api/*)
  ├─ POST /api/auth/[...nextauth]  — auth
  ├─ GET/POST /api/products        — list/create
  ├─ GET/PATCH/DELETE /api/products/[id]
  ├─ GET/POST /api/orders          — list/place
  └─ GET/PATCH /api/orders/[id]   — detail/status

Neon PostgreSQL
  └─ Tables: users, products, orders, order_items
```

---

## Database Schema

### `users`
| Column        | Type       | Notes                        |
|---------------|------------|------------------------------|
| id            | SERIAL PK  |                              |
| email         | TEXT UNIQUE|                              |
| name          | TEXT       |                              |
| role          | TEXT       | 'admin' or 'seller'          |
| password_hash | TEXT       | bcrypt hash                  |
| created_at    | TIMESTAMPTZ|                              |

### `products`
| Column                      | Type           | Notes                                      |
|-----------------------------|----------------|--------------------------------------------|
| id                          | SERIAL PK      |                                            |
| name                        | TEXT           |                                            |
| sku                         | TEXT UNIQUE    |                                            |
| description                 | TEXT           |                                            |
| category                    | TEXT           |                                            |
| dimension                   | TEXT           | 'weight', 'volume', or 'count'             |
| base_unit                   | TEXT           | 'g', 'mL', or 'unit'                       |
| stock_quantity              | NUMERIC(20,6)  | always in base_unit                        |
| price_per_base_unit_paise   | NUMERIC(20,6)  | price in paise per 1 base_unit             |
| is_active                   | BOOLEAN        | soft delete                                |
| created_at / updated_at     | TIMESTAMPTZ    |                                            |

### `orders`
| Column      | Type           | Notes                                |
|-------------|----------------|--------------------------------------|
| id          | SERIAL PK      |                                      |
| user_id     | INTEGER FK     | references users                     |
| status      | TEXT           | pending/confirmed/fulfilled/cancelled|
| notes       | TEXT           |                                      |
| total_paise | NUMERIC(20,2)  | grand total in paise                 |
| created_at / updated_at | TIMESTAMPTZ |                            |

### `order_items`
| Column           | Type           | Notes                                    |
|------------------|----------------|------------------------------------------|
| id               | SERIAL PK      |                                          |
| order_id         | INTEGER FK     | references orders (CASCADE DELETE)       |
| product_id       | INTEGER FK     | references products                      |
| product_name     | TEXT           | snapshot at time of order                |
| ordered_unit     | TEXT           | unit customer chose (g, kg, mL, L, unit) |
| ordered_quantity | NUMERIC(20,6)  | qty in ordered_unit                      |
| base_quantity    | NUMERIC(20,6)  | qty converted to base_unit               |
| unit_price_paise | NUMERIC(20,6)  | price per 1 base_unit at order time      |
| total_paise      | NUMERIC(20,2)  | line total                               |

---

## Why NUMERIC(20,6) and NUMERIC(20,2)?

- **NUMERIC** is an exact decimal type (no floating-point drift). Critical for financial calculations.
- **NUMERIC(20,6)** for quantities and per-unit prices: supports up to 14 digits before the decimal and 6 after. Handles sub-milligram quantities (e.g. 0.000500 g) and very large stocks (millions of mL) within one type.
- **NUMERIC(20,2)** for totals in paise: monetary totals need exactly 2 decimal places; no more precision is meaningful at the final sum level.
- **Float types (FLOAT, DOUBLE)** were rejected because `0.1 + 0.2 ≠ 0.3` in IEEE 754 — unacceptable for pricing.

---

## Unit Storage & Conversion Strategy

### Canonical Base Units

| Dimension | Base Unit | Rationale                              |
|-----------|-----------|----------------------------------------|
| Weight    | **g** (gram)    | Smallest pharma-relevant weight unit   |
| Volume    | **mL** (millilitre) | Smallest pharma-relevant volume unit |
| Count     | **unit**    | Indivisible                           |

All stock quantities are stored in the base unit. This means:
- 5 kg of Paracetamol → stored as `5000.000000 g`
- 2 L of Ethanol → stored as `2000.000000 mL`

### Price Storage

Prices are stored as **paise** (₹1 = 100 paise) to avoid decimal arithmetic in financial calculations. Paise is an integer-like unit stored in NUMERIC(20,6) to support fractional paise for very small per-unit rates.

### Conversion Factors (`lib/units.ts`)

```
TO_BASE = { g: 1, kg: 1000, mL: 1, L: 1000, unit: 1 }
```

To convert: `baseQty = orderedQty × TO_BASE[orderedUnit]`

### Where Conversions Happen

| Location | What happens |
|---|---|
| `lib/units.ts` → `toBaseQuantity()` | Ordered qty → base qty (before saving to DB) |
| `lib/units.ts` → `pricePerDisplayUnit()` | Base price → display unit price (for UI) |
| `lib/units.ts` → `computeLineTotalPaise()` | Ordered qty × base rate → paise total |
| `lib/units.ts` → `fromBaseQuantity()` | Base qty → display unit (stock display) |
| `lib/units.ts` → `paiseToCurrency()` | Paise → formatted INR string (UI only) |

Conversions are **never** stored implicitly — the DB always holds base quantities plus the original ordered unit and quantity for audit purposes.

---

## Local Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd aasa-medchem
npm install

# 2. Set environment
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://...
#   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
#   NEXTAUTH_URL=http://localhost:3000

# 3. Run migrations & seed
node scripts/migrate.js

# 4. Start dev server
npm run dev
# Open http://localhost:3000
```

---

## Neon Database Setup

1. Go to [neon.tech](https://neon.tech) → create a project
2. Copy the connection string (with `?sslmode=require`)
3. Paste into `DATABASE_URL` in `.env`
4. Run `node scripts/migrate.js`

---

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (set to your Vercel URL)
```

Or connect your GitHub repo in the Vercel dashboard for automatic deployments.

---

## How to Use

### Admin
1. Sign in as `admin@aasa.in`
2. **Dashboard** — see summary stats
3. **Products → + Add Product** — fill in name, SKU, category, dimension, price, stock
4. **Products** — edit existing products, update price/stock
5. **Orders** — view all incoming quotations, click a row to see items, use dropdown to update status

### Seller
1. Sign in as `seller@aasa.in`
2. **Catalogue** — search or filter by category
3. On each product card, select your preferred unit (e.g. kg or g), enter quantity, see live price
4. **Add to Cart** — repeat for multiple products
5. Click **🛒 Cart** → review, add notes, click **Place Order / Quotation**
6. **My Orders** — track status of your quotations

---

## Design Decisions

- **Soft deletes** for products (`is_active = false`) — preserves referential integrity with historical orders
- **Price snapshot in order_items** — `unit_price_paise` is stored at order time so historical orders aren't affected by price changes
- **Product name snapshot** — stored in `order_items.product_name` so renames don't corrupt history
- **Role-based middleware** — layout-level server-side auth checks; API routes also verify session
- **No ORM** — raw SQL via `@neondatabase/serverless` for full control and query transparency
