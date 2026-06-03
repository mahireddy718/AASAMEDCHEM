'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { paiseToCurrency, pricePerDisplayUnit, computeLineTotalPaise, DIMENSION_UNITS, UNIT_LABELS, formatQuantity, fromBaseQuantity } from '@/lib/units';
import type { Product, Unit } from '@/lib/db';

interface CartItem {
  product: Product;
  unit: Unit;
  quantity: number;
}

export default function SellerCatalogue({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aasa_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, []);

  // Custom cart updater that writes to localStorage
  const updateCart = (newCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCart(prev => {
      const resolved = typeof newCart === 'function' ? newCart(prev) : newCart;
      try {
        localStorage.setItem('aasa_cart', JSON.stringify(resolved));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
      return resolved;
    });
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat && p.is_active;
  });

  function addToCart(product: Product, unit: Unit, qty: number) {
    updateCart(prev => {
      const existing = prev.findIndex(i => i.product.id === product.id && i.unit === unit);
      if (existing >= 0) {
        return prev.map((item, idx) => idx === existing ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, unit, quantity: qty }];
    });
    setSuccess(`Added ${qty} ${unit} of ${product.name} to cart`);
    setTimeout(() => setSuccess(''), 2500);
  }

  function removeFromCart(idx: number) {
    updateCart(prev => prev.filter((_, i) => i !== idx));
  }

  const cartTotal = cart.reduce((sum, item) => {
    return sum + computeLineTotalPaise(item.quantity, item.unit, Number(item.product.price_per_base_unit_paise));
  }, 0);

  async function placeOrder() {
    setPlacing(true);
    setError('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ product_id: i.product.id, unit: i.unit, quantity: i.quantity })),
        notes,
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (res.ok) {
      updateCart([]);
      setNotes('');
      setShowCart(false);
      setSuccess(`Order #${data.id} placed successfully! Total: ${paiseToCurrency(data.total_paise)}`);
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(data.error || 'Failed to place order');
    }
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', margin: '0 0 4px' }}>Product Catalogue</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{filtered.length} products available</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          style={{ position: 'relative', padding: '10px 20px', background: cart.length ? '#0369a1' : '#f1f5f9', color: cart.length ? '#fff' : '#64748b', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          🛒 Cart
          {cart.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{cart.length}</span>
          )}
        </button>
      </div>

      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{ flex: 1, maxWidth: 360, padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1.5px solid',
              borderColor: category === c ? '#0369a1' : '#e2e8f0',
              background: category === c ? '#e0f2fe' : '#fff',
              color: category === c ? '#0369a1' : '#64748b',
              fontWeight: 600, cursor: 'pointer', fontSize: 13,
            }}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            No products match your search
          </div>
        )}
      </div>

      {/* Cart modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ background: '#fff', height: '100%', width: 460, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontWeight: 800, color: '#0c4a6e' }}>Quotation Cart</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 60 }}>Cart is empty</p>
              ) : cart.map((item, idx) => {
                const linePaise = computeLineTotalPaise(item.quantity, item.unit, Number(item.product.price_per_base_unit_paise));
                return (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{item.product.name}</div>
                        <div style={{ color: '#64748b', fontSize: 12 }}>{item.product.sku}</div>
                      </div>
                      <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, color: '#475569' }}>
                      <div>Qty: <strong>{item.quantity} {item.unit}</strong></div>
                      <div>Rate: <strong>{paiseToCurrency(pricePerDisplayUnit(Number(item.product.price_per_base_unit_paise), item.product.base_unit as Unit, item.unit))}/{item.unit}</strong></div>
                      <div style={{ gridColumn: '1/-1', fontWeight: 700, color: '#0369a1', fontSize: 14 }}>
                        Line Total: {paiseToCurrency(linePaise)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13, color: '#374151' }}>Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Add any special instructions…"
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12 }}>{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Grand Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#0369a1' }}>{paiseToCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  style={{ width: '100%', padding: '13px 0', background: placing ? '#94a3b8' : '#0369a1', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: placing ? 'not-allowed' : 'pointer' }}
                >
                  {placing ? 'Placing Order…' : 'Place Order / Quotation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product, u: Unit, qty: number) => void }) {
  const units = DIMENSION_UNITS[product.dimension as keyof typeof DIMENSION_UNITS] as Unit[];
  const [unit, setUnit] = useState<Unit>(units[0]);
  const [qty, setQty] = useState('1');

  const pricePerUnit = pricePerDisplayUnit(Number(product.price_per_base_unit_paise), product.base_unit as Unit, unit);
  const lineTotal = qty ? computeLineTotalPaise(Number(qty), unit, Number(product.price_per_base_unit_paise)) : 0;

  // Available stock in current display unit
  const stockInUnit = fromBaseQuantity(Number(product.stock_quantity), unit);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Card header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 2, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0f172a')}
              >
                {product.name}
              </div>
            </Link>
            <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700, letterSpacing: 0.3, cursor: 'pointer' }}>{product.sku}</div>
            </Link>
          </div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{product.category}</span>
        </div>
        {product.description && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{product.description}</p>}
      </div>

      {/* Pricing */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          {units.map(u => (
            <button key={u} onClick={() => setUnit(u)} style={{
              padding: '5px 12px', borderRadius: 6, border: '1.5px solid',
              borderColor: unit === u ? '#0369a1' : '#e2e8f0',
              background: unit === u ? '#e0f2fe' : '#fff',
              color: unit === u ? '#0369a1' : '#64748b',
              fontWeight: 600, cursor: 'pointer', fontSize: 12,
            }}>
              {u}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#374151' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0369a1' }}>{paiseToCurrency(pricePerUnit)}</span>
          <span style={{ color: '#94a3b8' }}> / {unit}</span>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          Stock: {stockInUnit.toLocaleString(undefined, { maximumFractionDigits: 3 })} {unit}
        </div>
      </div>

      {/* Order input */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="number"
            min="0.001"
            step="any"
            value={qty}
            onChange={e => setQty(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
          />
          <span style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>{unit}</span>
        </div>
        {qty && Number(qty) > 0 && (
          <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 700, marginBottom: 8 }}>
            Estimated: {paiseToCurrency(lineTotal)}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/products/${product.id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button
              type="button"
              style={{ width: '100%', padding: '9px 0', background: '#f8fafc', color: '#475569', border: '1.5px solid #cbd5e1', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
            >
              Details
            </button>
          </Link>
          <button
            onClick={() => { if (Number(qty) > 0) onAdd(product, unit, Number(qty)); }}
            disabled={!qty || Number(qty) <= 0}
            style={{ flex: 1, padding: '9px 0', background: '#0369a1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, opacity: (!qty || Number(qty) <= 0) ? 0.5 : 1 }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
