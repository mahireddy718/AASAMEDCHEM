'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getProductImage } from '@/app/PublicCatalogueClient';

interface Props {
  product: Product;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  } | null;
}

// Density preset maps for solvents (g/mL)
const DENSITY_PRESETS: Record<string, number> = {
  'ETOH-001': 0.789, // Ethanol
  'IPA-001': 0.786,  // Isopropyl Alcohol
  'H2O-001': 1.000,  // Purified Water
  'GLYC-001': 1.261, // Glycerin
  'SALI-001': 1.005, // Saline Solution
};

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

  // --- Advanced Conversion Calculator State ---
  const initialDensity = DENSITY_PRESETS[product.sku] || 1.0;
  const [density, setDensity] = useState<number>(initialDensity);
  const [convDirection, setConvDirection] = useState<'volToWt' | 'wtToVol'>('volToWt');
  const [convInput, setConvInput] = useState<number>(1000);
  const [convVolUnit, setConvVolUnit] = useState<'mL' | 'L'>('mL');
  const [convWtUnit, setConvWtUnit] = useState<'g' | 'kg'>('g');

  const [weightInput, setWeightInput] = useState<number>(1000);
  const [weightUnit, setWeightUnit] = useState<'g' | 'kg'>('g');

  const [countInput, setCountInput] = useState<number>(1000);

  // Live picture url
  const livePic = getProductImage(product.category, product.sku);

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

  // Density solver outputs
  const calculateDensityConversion = () => {
    const d = density;
    const inputVal = convInput;
    if (convDirection === 'volToWt') {
      // mL -> g
      const mlQty = convVolUnit === 'mL' ? inputVal : inputVal * 1000;
      const gWeight = mlQty * d;
      const outputVal = convWtUnit === 'g' ? gWeight : gWeight / 1000;
      return `${inputVal} ${convVolUnit} = ${outputVal.toLocaleString('en-US', { maximumFractionDigits: 3 })} ${convWtUnit}`;
    } else {
      // g -> mL
      const gQty = convWtUnit === 'g' ? inputVal : inputVal * 1000;
      const mlVol = gQty / d;
      const outputVal = convVolUnit === 'mL' ? mlVol : mlVol / 1000;
      return `${inputVal} ${convWtUnit} = ${outputVal.toLocaleString('en-US', { maximumFractionDigits: 3 })} ${convVolUnit}`;
    }
  };

  // Mass unit outputs
  const calculateMassConversions = () => {
    const inputInGrams = weightUnit === 'g' ? weightInput : weightInput * 1000;
    return {
      mcg: inputInGrams * 1000000,
      mg: inputInGrams * 1000,
      g: inputInGrams,
      kg: inputInGrams / 1000,
      lbs: inputInGrams / 453.59237,
      oz: inputInGrams / 28.34952
    };
  };

  // Count unit outputs
  const calculateCountConversions = () => {
    const units = countInput;
    return {
      units,
      packs: units / 1000,
      boxes: units / 10000,
      cartons: units / 50000
    };
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
        {/* Left Column - Image & Chemical info & Advanced Converter */}
        <div style={{
          padding: 32,
          background: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Live Product Image Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 320,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            marginBottom: 24,
            height: 250,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img src={livePic} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ width: '100%', maxWidth: 360, marginBottom: 28 }}>
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

          {/* Advanced Metric Conversion Assistant Card */}
          <div style={{
            width: '100%',
            maxWidth: 360,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #bae6fd',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            padding: 20
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
              🎛️ Dynamic Metric Conversion
            </h3>

            {/* Render Solvents Density Calculator */}
            {product.dimension === 'volume' && (
              <div>
                <span style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                  WEIGHT-VOLUME DENSITY SOLVER
                </span>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setConvDirection('volToWt')}
                    style={{
                      flex: 1, padding: '5px 8px', fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: 'pointer', border: '1px solid',
                      background: convDirection === 'volToWt' ? '#e0f2fe' : '#fff',
                      color: convDirection === 'volToWt' ? '#0369a1' : '#64748b',
                      borderColor: convDirection === 'volToWt' ? '#0284c7' : '#cbd5e1'
                    }}
                  >
                    Vol → Wt
                  </button>
                  <button
                    onClick={() => setConvDirection('wtToVol')}
                    style={{
                      flex: 1, padding: '5px 8px', fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: 'pointer', border: '1px solid',
                      background: convDirection === 'wtToVol' ? '#e0f2fe' : '#fff',
                      color: convDirection === 'wtToVol' ? '#0369a1' : '#64748b',
                      borderColor: convDirection === 'wtToVol' ? '#0284c7' : '#cbd5e1'
                    }}
                  >
                    Wt → Vol
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <input
                      type="number"
                      value={convInput}
                      onChange={e => setConvInput(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }}
                    />
                  </div>
                  <div>
                    {convDirection === 'volToWt' ? (
                      <select value={convVolUnit} onChange={e => setConvVolUnit(e.target.value as any)} style={{ width: '100%', padding: '6px 4px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                        <option value="mL">Milliliters (mL)</option>
                        <option value="L">Liters (L)</option>
                      </select>
                    ) : (
                      <select value={convWtUnit} onChange={e => setConvWtUnit(e.target.value as any)} style={{ width: '100%', padding: '6px 4px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                        <option value="g">Grams (g)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Density preset slider */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                    <span>Liquid Density</span>
                    <strong>{density.toFixed(3)} g/mL</strong>
                  </div>
                  <input
                    type="range"
                    min="0.700"
                    max="1.500"
                    step="0.001"
                    value={density}
                    onChange={e => setDensity(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Output display */}
                <div style={{ background: '#f0f9ff', padding: '10px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0369a1', textAlign: 'center', border: '1px solid #bae6fd' }}>
                  {calculateDensityConversion()}
                </div>
              </div>
            )}

            {/* Render Weight/API Mass conversions */}
            {product.dimension === 'weight' && (
              <div>
                <span style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                  COMPREHENSIVE MASS CONVERTER
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, marginBottom: 14 }}>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={e => setWeightInput(parseFloat(e.target.value) || 0)}
                    style={{ padding: '6px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }}
                  />
                  <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)} style={{ padding: '6px 4px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>

                {/* Conversion Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px 12px', fontSize: 11 }}>
                  {[
                    { label: 'Kilograms', val: `${calculateMassConversions().kg.toLocaleString('en-US')} kg` },
                    { label: 'Grams', val: `${calculateMassConversions().g.toLocaleString('en-US')} g` },
                    { label: 'Milligrams', val: `${calculateMassConversions().mg.toLocaleString('en-US')} mg` },
                    { label: 'Micrograms', val: `${calculateMassConversions().mcg.toLocaleString('en-US')} mcg` },
                    { label: 'Pounds', val: `${calculateMassConversions().lbs.toFixed(3)} lbs` },
                    { label: 'Ounces', val: `${calculateMassConversions().oz.toFixed(2)} oz` }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'contents' }}>
                      <span style={{ color: '#64748b' }}>{item.label}</span>
                      <strong style={{ color: '#334155', textAlign: 'right' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Capsules count conversions */}
            {product.dimension === 'count' && (
              <div>
                <span style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                  BULK PACKAGING CALCULATOR
                </span>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10, color: '#64748b', marginBottom: 4 }}>Quantity (units)</label>
                  <input
                    type="number"
                    value={countInput}
                    onChange={e => setCountInput(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '6px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }}
                  />
                </div>

                {/* Output List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px 12px', fontSize: 11 }}>
                  {[
                    { label: 'Individual Count', val: `${calculateCountConversions().units.toLocaleString('en-US')} units` },
                    { label: 'Packs (1,000s)', val: `${calculateCountConversions().packs.toFixed(2)} packs` },
                    { label: 'Boxes (10,000s)', val: `${calculateCountConversions().boxes.toFixed(2)} boxes` },
                    { label: 'Cartons (50,000s)', val: `${calculateCountConversions().cartons.toFixed(2)} cartons` }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'contents' }}>
                      <span style={{ color: '#64748b' }}>{item.label}</span>
                      <strong style={{ color: '#334155', textAlign: 'right' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {stockNum.toLocaleString('en-US', { maximumFractionDigits: 2 })} {product.base_unit}
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
                  <span>{Math.round(Math.min(stockInDisplayUnit, 10000)).toLocaleString('en-US')} {selectedUnit} {stockInDisplayUnit > 10000 ? '+' : ''}</span>
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
