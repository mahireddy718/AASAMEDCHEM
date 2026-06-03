'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Nav from '@/components/Nav';
import {
  paiseToCurrency,
  pricePerDisplayUnit,
  computeLineTotalPaise,
  DIMENSION_UNITS,
  UNIT_LABELS,
  fromBaseQuantity,
  toBaseQuantity,
  formatQuantity
} from '@/lib/units';
import type { Product, Unit, Role } from '@/lib/db';

interface Props {
  product: Product;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  } | null;
}

export default function ProductDetailClient({ product, user }: Props) {
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  // Units matching product dimension
  const units = DIMENSION_UNITS[product.dimension as keyof typeof DIMENSION_UNITS] as Unit[];
  const [selectedUnit, setSelectedUnit] = useState<Unit>(units[0]);
  const [qty, setQty] = useState<number>(1);
  const [addedMsg, setAddedMsg] = useState('');

  // Stock status
  const stockNum = Number(product.stock_quantity);
  const isLowStock = stockNum < 1000;
  const stockInDisplayUnit = fromBaseQuantity(stockNum, selectedUnit);

  // Live conversion & calculation
  const pricePerUnit = pricePerDisplayUnit(
    Number(product.price_per_base_unit_paise),
    product.base_unit as Unit,
    selectedUnit
  );
  const totalCostPaise = computeLineTotalPaise(
    qty,
    selectedUnit,
    Number(product.price_per_base_unit_paise)
  );

  // SVG selector based on category
  const renderChemicalIllustration = () => {
    const categoryLower = product.category.toLowerCase();
    if (categoryLower.includes('api')) {
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxHeight: 220, filter: 'drop-shadow(0 8px 16px rgba(14, 165, 233, 0.2))' }}>
          <defs>
            <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Flask Body */}
          <path d="M42 25 L42 12 L38 12 L38 8 L62 8 L62 12 L58 12 L58 25 L78 68 C82 76, 78 85, 70 85 L30 85 C22 85, 18 76, 22 68 Z" fill="none" stroke="url(#flaskGrad)" strokeWidth="3" />
          {/* Liquid level */}
          <path d="M29 62 C35 60, 45 64, 55 60 C65 57, 71 62, 71 62 L75 72 C76 74, 75 78, 72 78 L28 78 C25 78, 24 74, 25 72 Z" fill="url(#liquidGrad)" />
          {/* Bubbles */}
          <circle cx="38" cy="50" r="3" fill="#38bdf8" opacity="0.6">
            <animate attributeName="cy" values="70;30" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="52" cy="40" r="2.5" fill="#bae6fd" opacity="0.7">
            <animate attributeName="cy" values="70;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="62" cy="55" r="2" fill="#38bdf8" opacity="0.5">
            <animate attributeName="cy" values="70;25" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Measurement marks */}
          <line x1="50" y1="35" x2="55" y2="35" stroke="#bae6fd" strokeWidth="1.5" opacity="0.5" />
          <line x1="48" y1="48" x2="56" y2="48" stroke="#bae6fd" strokeWidth="1.5" opacity="0.5" />
          <line x1="45" y1="61" x2="55" y2="61" stroke="#bae6fd" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    } else if (categoryLower.includes('solvent')) {
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxHeight: 220, filter: 'drop-shadow(0 8px 16px rgba(20, 184, 166, 0.2))' }}>
          <defs>
            <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="solLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Bottle Structure */}
          <path d="M35 15 L65 15 L65 24 L72 28 L72 82 C72 85, 69 88, 66 88 L34 88 C31 88, 28 85, 28 82 L28 28 L35 24 Z" fill="none" stroke="url(#bottleGrad)" strokeWidth="3" />
          {/* Cap */}
          <rect x="42" y="7" width="16" height="8" rx="2" fill="#0d9488" />
          {/* Liquid level */}
          <path d="M30 45 Q35 48 40 45 T50 45 T60 45 T70 45 L70 82 C70 84, 68 86, 66 86 L34 86 C32 86, 30 84, 30 82 Z" fill="url(#solLiquidGrad)" />
          {/* Lab Label */}
          <rect x="36" y="52" width="28" height="20" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="40" y1="58" x2="60" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="40" y1="64" x2="54" y2="64" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      );
    } else if (categoryLower.includes('excipient')) {
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxHeight: 220, filter: 'drop-shadow(0 8px 16px rgba(139, 92, 246, 0.2))' }}>
          <defs>
            <linearGradient id="capsuleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="capsuleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          {/* Pill Capsule at 45 degrees */}
          <g transform="rotate(45 50 50)">
            {/* Left/Bottom Half */}
            <path d="M32 32 L32 50 C32 60, 40 68, 50 68 C60 68, 68 60, 68 50 L68 32 Z" fill="url(#capsuleGrad1)" />
            {/* Right/Top Half */}
            <path d="M32 32 L32 14 C32 4, 40 -4, 50 -4 C60 -4, 68 4, 68 14 L68 32 Z" fill="url(#capsuleGrad2)" />
            {/* Glossy Reflection */}
            <path d="M38 10 C38 6, 42 2, 48 2" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </g>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxHeight: 220, filter: 'drop-shadow(0 8px 16px rgba(100, 116, 139, 0.2))' }}>
          <defs>
            <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Nucleus */}
          <circle cx="50" cy="50" r="8" fill="#475569" />
          {/* Orbiting Rings */}
          <ellipse cx="50" cy="50" rx="36" ry="12" fill="none" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(30 50 50)" />
          <ellipse cx="50" cy="50" rx="36" ry="12" fill="none" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(90 50 50)" />
          <ellipse cx="50" cy="50" rx="36" ry="12" fill="none" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(150 50 50)" />
          {/* Electrons */}
          <circle cx="20" cy="33" r="3.5" fill="#64748b" />
          <circle cx="80" cy="67" r="3.5" fill="#64748b" />
          <circle cx="50" cy="14" r="3.5" fill="#64748b" />
        </svg>
      );
    }
  };

  // Cart helper (localStorage)
  const handleAddToCart = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    try {
      const cartKey = 'aasa_cart';
      const existingCartRaw = localStorage.getItem(cartKey);
      const existingCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      const existingIndex = existingCart.findIndex(
        (item: any) => item.product.id === product.id && item.unit === selectedUnit
      );

      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity += qty;
      } else {
        existingCart.push({
          product,
          unit: selectedUnit,
          quantity: qty,
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      setAddedMsg(`Successfully added ${qty} ${selectedUnit} to cart!`);
      setTimeout(() => setAddedMsg(''), 4000);
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      setQty(val);
    } else if (e.target.value === '') {
      setQty(0);
    }
  };

  // Layout selection based on logged in status
  const pageContent = (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            if (isSeller) router.push('/seller');
            else if (isAdmin) router.push('/admin/products');
            else router.push('/');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0369a1',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
          }}
        >
          ← Back to Catalogue
        </button>
      </div>

      {addedMsg && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)',
          animation: 'fadeIn 0.2s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{addedMsg}</span>
          {isSeller && (
            <Link href="/seller" style={{
              background: '#065f46',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              textDecoration: 'none',
              fontWeight: 700
            }}>
              Go to Cart & Checkout →
            </Link>
          )}
        </div>
      )}

      {/* Main product detail card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 28,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        marginBottom: 32
      }}>
        {/* Left Column - Image/SVG illustration & Chemical info */}
        <div style={{
          padding: 32,
          background: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 32px',
            width: '100%',
            maxWidth: 320,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 260
          }}>
            {renderChemicalIllustration()}
          </div>

          <div style={{ width: '100%', maxWidth: 360 }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: 10
            }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{product.name}</h1>
            <code style={{ fontSize: 13, color: '#0369a1', fontWeight: 700, display: 'block', marginBottom: 16 }}>
              SKU: {product.sku}
            </code>

            <div style={{
              textAlign: 'left',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Purity Grade</span>
                <strong style={{ color: '#0f172a' }}>99.9% Pharma Grade</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Regulatory Status</span>
                <strong style={{ color: '#059669' }}>GMP Certified</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                <span style={{ color: '#64748b' }}>Dimension</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{product.dimension}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product description, stock and live pricing calculator */}
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                color: product.is_active ? '#065f46' : '#991b1b',
                background: product.is_active ? '#d1fae5' : '#fee2e2',
                padding: '4px 10px',
                borderRadius: 6,
                textTransform: 'uppercase'
              }}>
                {product.is_active ? 'In Stock' : 'Inactive'}
              </span>

              {isAdmin && (
                <button
                  onClick={() => router.push(`/admin/products`)}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚙ Edit (Admin)
                </button>
              )}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Description</h3>
            <p style={{
              margin: '0 0 24px',
              fontSize: 14,
              color: '#475569',
              lineHeight: 1.6
            }}>
              {product.description || `High quality pharmaceutical grade ${product.name} synthesized under strict quality controls. Suitable for research laboratory tests and industrial distribution. Meets international compliance standards.`}
            </p>

            {/* Inventory Status Bar */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 28
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Available Stock</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: isLowStock ? '#d97706' : '#0369a1' }}>
                  {stockNum.toLocaleString(undefined, { maximumFractionDigits: 2 })} {product.base_unit}
                </span>
              </div>
              <div style={{ height: 8, background: '#cbd5e1', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stockNum / 2000000) * 100, 100)}%`,
                  background: isLowStock ? '#d97706' : '#0ea5e9',
                  borderRadius: 4
                }} />
              </div>
              {isLowStock && (
                <div style={{ color: '#b45309', fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                  ⚠️ Low Stock Level Alert: Consider ordering soon.
                </div>
              )}
            </div>

            {/* Unit display selector */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                Select Display Unit
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                {units.map(u => (
                  <button
                    key={u}
                    onClick={() => {
                      setSelectedUnit(u);
                      setQty(1);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: selectedUnit === u ? '#0369a1' : '#e2e8f0',
                      background: selectedUnit === u ? '#e0f2fe' : '#fff',
                      color: selectedUnit === u ? '#0369a1' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 13,
                      transition: 'all 0.15s'
                    }}
                  >
                    {UNIT_LABELS[u]}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator section */}
            <div style={{
              background: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24
            }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0369a1' }}>
                🧮 Live Volume Pricing Estimator
              </h4>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={qty || ''}
                    onChange={handleQtyChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ width: 80, paddingTop: 18, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                  {selectedUnit}
                </div>
              </div>

              {/* Slider for quick estimating */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="range"
                  min="1"
                  max={Math.min(stockInDisplayUnit, 10000)}
                  value={qty > 10000 ? 10000 : Math.round(qty)}
                  onChange={e => setQty(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: 4 }}>
                  <span>1 {selectedUnit}</span>
                  <span>{Math.round(Math.min(stockInDisplayUnit, 10000)).toLocaleString()} {selectedUnit} {stockInDisplayUnit > 10000 ? '+' : ''}</span>
                </div>
              </div>

              {/* Live result display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #bae6fd' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Unit Price</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {paiseToCurrency(pricePerUnit)} / {selectedUnit}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Estimated Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#0369a1' }}>
                    {paiseToCurrency(totalCostPaise)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger button */}
          <div>
            {!user ? (
              <button
                onClick={() => router.push(`/login?callbackUrl=/products/${product.id}`)}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: '#0369a1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(3, 105, 161, 0.2)'
                }}
              >
                🔑 Sign In to Order / Get Quote
              </button>
            ) : isSeller ? (
              <button
                onClick={handleAddToCart}
                disabled={!qty || qty <= 0}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: '#0369a1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  opacity: (!qty || qty <= 0) ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(3, 105, 161, 0.2)'
                }}
              >
                🛒 Add to Quotation Cart
              </button>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                fontSize: 13,
                color: '#475569',
                fontWeight: 600
              }}>
                You are logged in as Admin. Product is viewable.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap in Navigation if authenticated
  if (user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Nav />
        <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: '#f8f9fb' }}>
          {pageContent}
        </main>
      </div>
    );
  }

  // Render full page container for public guest
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Public Header */}
      <header style={{
        background: '#0c4a6e',
        color: '#fff',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>⚗</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>AasaMedChem</div>
            <div style={{ color: '#7dd3fc', fontSize: 11 }}>Chemical Distribution</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600
          }}>
            Sign In
          </Link>
          <Link href="/signup" style={{
            background: '#0284c7',
            color: '#fff',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700
          }}>
            Create Account
          </Link>
        </div>
      </header>
      
      {/* Body content */}
      <div style={{ flex: 1, padding: '40px 24px' }}>
        {pageContent}
      </div>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '24px 32px',
        textAlign: 'center',
        fontSize: 12,
        borderTop: '1px solid #1e293b'
      }}>
        © {new Date().getFullYear()} AasaMedChem. All rights reserved. High purity chemical distribution system.
      </footer>
    </div>
  );
}
