'use client';

import { useState } from 'react';
import Link from 'next/link';
import { paiseToCurrency, DIMENSION_UNITS, UNIT_LABELS } from '@/lib/units';
import type { Product, Dimension } from '@/lib/db';
import { getProductImage } from '@/app/PublicCatalogueClient';

interface Props { initialProducts: Product[] }

export default function AdminProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  async function refreshProducts() {
    const res = await fetch('/api/products?active=false');
    const data = await res.json();
    setProducts(data);
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setMsg('Product deactivated');
    refreshProducts();
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', margin: '0 0 4px' }}>Products</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{products.filter(p => p.is_active).length} active products</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }} style={btnPrimary}>
          + Add Product
        </button>
      </div>

      {msg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            style={{ ...inputStyle, maxWidth: 320 }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['', 'SKU', 'Name', 'Category', 'Dimension', 'Base Unit', 'Stock', 'Price / Base Unit', 'Status', ''].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ ...tdStyle, paddingRight: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={getProductImage(p.category, p.sku)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </td>
                <td style={tdStyle}>
                  <Link href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                    <code style={{ fontSize: 12, color: '#0369a1', cursor: 'pointer' }}>{p.sku}</code>
                  </Link>
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0284c7')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                    >
                      {p.name}
                    </span>
                  </Link>
                </td>
                <td style={tdStyle}><span style={tagStyle}>{p.category}</span></td>
                <td style={tdStyle}>{p.dimension}</td>
                <td style={tdStyle}>{p.base_unit}</td>
                <td style={tdStyle}>{Number(p.stock_quantity).toLocaleString()} {p.base_unit}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: '#0369a1' }}>{paiseToCurrency(p.price_per_base_unit_paise)}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: p.is_active ? '#d1fae5' : '#f1f5f9', color: p.is_active ? '#065f46' : '#94a3b8', fontWeight: 600 }}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditProduct(p); setShowForm(true); }} style={btnSmall}>Edit</button>
                    {p.is_active && <button onClick={() => handleDelete(p.id)} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fca5a5' }}>Deactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSaved={(msg: string) => { setMsg(msg); setShowForm(false); setEditProduct(null); refreshProducts(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category || 'General',
    dimension: product?.dimension || 'weight' as Dimension,
    stock_quantity: product ? Number(product.stock_quantity).toString() : '',
    price_per_base_unit_inr: product ? (Number(product.price_per_base_unit_paise) / 100).toFixed(4) : '',
  });
  const [saving, setSaving] = useState(false);

  const baseUnit = { weight: 'g', volume: 'mL', count: 'unit' }[form.dimension];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      onSaved(product ? 'Product updated!' : 'Product created!');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 800, color: '#0c4a6e' }}>
          {product ? 'Edit Product' : 'New Product'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Product Name', key: 'name', required: true },
            { label: 'SKU', key: 'sku', required: !product, disabled: !!product },
            { label: 'Category', key: 'category' },
            { label: 'Description', key: 'description' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}{f.required ? ' *' : ''}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                required={f.required}
                disabled={f.disabled}
                style={{ ...inputStyle, opacity: f.disabled ? 0.6 : 1 }}
              />
            </div>
          ))}

          {!product && (
            <div>
              <label style={labelStyle}>Dimension *</label>
              <select value={form.dimension} onChange={e => setForm(prev => ({ ...prev, dimension: e.target.value as Dimension }))} style={inputStyle}>
                <option value="weight">Weight (base: g)</option>
                <option value="volume">Volume (base: mL)</option>
                <option value="count">Count (base: unit)</option>
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Price per {baseUnit} (INR) *</label>
            <input type="number" step="0.0001" min="0" value={form.price_per_base_unit_inr}
              onChange={e => setForm(prev => ({ ...prev, price_per_base_unit_inr: e.target.value }))}
              required style={inputStyle} />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>e.g. 0.85 means ₹0.85 per {baseUnit}</div>
          </div>

          <div>
            <label style={labelStyle}>Stock Quantity ({baseUnit})</label>
            <input type="number" step="0.000001" min="0" value={form.stock_quantity}
              onChange={e => setForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
              style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={btnOutline}>Cancel</button>
            <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: '#374151' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 5, color: '#374151', fontSize: 13 };
const tagStyle: React.CSSProperties = { background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
const btnPrimary: React.CSSProperties = { padding: '10px 20px', background: '#0369a1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 };
const btnOutline: React.CSSProperties = { padding: '10px 20px', background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 };
const btnSmall: React.CSSProperties = { padding: '5px 12px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 };
