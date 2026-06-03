'use client';

import { useState } from 'react';
import Link from 'next/link';
import { paiseToCurrency } from '@/lib/units';
import type { Product, Unit } from '@/lib/db';

interface Props {
  products: Product[];
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function PublicCatalogueClient({ products, user }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic Header */}
      <header style={{
        background: '#0c4a6e',
        color: '#fff',
        padding: '18px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, animation: 'pulse 2s infinite' }}>⚗</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1.1, letterSpacing: 0.5 }}>AasaMedChem</div>
            <div style={{ color: '#7dd3fc', fontSize: 11, fontWeight: 600 }}>Chemical Distribution System</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#e0f2fe', fontSize: 13, marginRight: 6 }}>
                Welcome, <strong>{user.name}</strong> ({user.role})
              </span>
              <Link href={user.role === 'admin' ? '/admin' : '/seller'} style={{
                background: '#0ea5e9',
                color: '#fff',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
                transition: 'transform 0.15s'
              }}>
                Go to Portal →
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: '#bae6fd',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign In
              </Link>
              <Link href="/signup" style={{
                background: '#fff',
                color: '#0c4a6e',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
              }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{
        position: 'relative',
        height: 380,
        backgroundImage: 'url("/pharmaceutical_banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center'
      }}>
        {/* Dark overlay with blue filter */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', maxWidth: 800 }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 900,
            margin: '0 0 16px',
            lineHeight: 1.2,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            letterSpacing: -0.5
          }}>
            Next-Generation API & Chemical Distribution
          </h1>
          <p style={{
            fontSize: 17,
            color: '#cbd5e1',
            margin: '0 0 28px',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Seamless inventory tracking, certified pharmaceutical purity, and automated quote generation. We power research, pharmaceutical manufacturing, and retail compounding.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={heroBadgeStyle}>🧪 99.9% Certified Purity</div>
            <div style={heroBadgeStyle}>📦 GMP Compliant Handling</div>
            <div style={heroBadgeStyle}>⚡ Instant Quote Estimator</div>
          </div>
        </div>
      </section>

      {/* Main Showcase Section */}
      <main style={{ flex: 1, padding: '50px 40px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Product Catalogue
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Browse our list of available chemicals, solvents, and excipients. Click any item to calculate rates.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Search Catalogue
              </label>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by chemical name or SKU (e.g. Paracetamol, ETOH-001)..."
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Stock Status
              </label>
              <div style={{
                padding: '11px 16px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: '#0369a1'
              }}>
                🟢 {products.length} Items Live in Stock
              </div>
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              Filter by Category
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: category === c ? '#0284c7' : '#cbd5e1',
                    background: category === c ? '#e0f2fe' : '#fff',
                    color: category === c ? '#0369a1' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.15s'
                  }}
                >
                  {c === 'all' ? 'All Categories' : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20
        }}>
          {filtered.map(p => {
            const stockNum = Number(p.stock_quantity);
            const isLowStock = stockNum < 1000;
            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                }}
              >
                {/* Header info */}
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {p.category}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#64748b'
                    }}>
                      {p.sku}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineBreak: 'anywhere' }}>
                    {p.name}
                  </h3>

                  <p style={{
                    fontSize: 12,
                    color: '#64748b',
                    margin: '0 0 16px',
                    height: 36,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.5
                  }}>
                    {p.description || `Certified high-grade ${p.name} active pharmaceutical component.`}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#475569',
                    paddingTop: 10,
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span>Purity Grade:</span>
                    <strong>99.9% USP</strong>
                  </div>
                </div>

                {/* Footer action and pricing */}
                <div style={{ padding: 20, background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Base Price</span>
                      <strong style={{ fontSize: 15, color: '#0369a1' }}>
                        {paiseToCurrency(p.price_per_base_unit_paise)}
                      </strong>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}> / {p.base_unit}</span>
                    </div>
                    
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isLowStock ? '#d97706' : '#059669'
                    }}>
                      {isLowStock ? '⚠️ Low Stock' : '🟢 In Stock'}
                    </span>
                  </div>

                  <Link href={`/products/${p.id}`} style={{
                    display: 'block',
                    background: '#0c4a6e',
                    color: '#fff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '9px 0',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0c4a6e'}
                  >
                    View Details & Rates
                  </Link>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              color: '#94a3b8'
            }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 10 }}>🔍</span>
              No chemical products match your filters.
            </div>
          )}
        </div>
      </main>

      {/* Premium Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#64748b',
        padding: '40px 40px 30px',
        borderTop: '1px solid #1e293b',
        marginTop: 60
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 30,
          marginBottom: 30
        }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span>⚗</span> AasaMedChem
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Providing medical and research laboratories with GMP-compliant, high-purity chemical compounds, solvents, and raw pharmaceutical materials since 2012.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Portal Login</Link>
              <Link href="/signup" style={{ color: '#94a3b8', textDecoration: 'none' }}>Create Account</Link>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Quality Control Spec Sheets</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Compliance & Safety</h4>
            <ul style={{ fontSize: 13, paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
              <li>GMP Certified Facility</li>
              <li>ISO 9001:2015 Registered</li>
              <li>WHO-GMP Approved Standards</li>
            </ul>
          </div>
        </div>

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingTop: 20,
          borderTop: '1px solid #1e293b',
          textAlign: 'center',
          fontSize: 12,
          color: '#475569'
        }}>
          © {new Date().getFullYear()} AasaMedChem Private Limited. All licensing and certifications are active.
        </div>
      </footer>
    </div>
  );
}

const heroBadgeStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  padding: '8px 16px',
  borderRadius: 30,
  fontSize: 13,
  fontWeight: 600,
  color: '#f0f9ff'
};
