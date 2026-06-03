'use client';

import { useState } from 'react';
import Link from 'next/link';
import { paiseToCurrency } from '@/lib/units';
import type { Product } from '@/lib/db';

interface Props {
  products: Product[];
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

// Category image mapper helper
export function getProductImage(category: string, sku: string): string {
  const cat = category.toLowerCase();
  const itemSku = sku.toLowerCase();
  if (cat.includes('solvent')) {
    return '/solvent_bottle.png';
  } else if (cat.includes('excipient') && itemSku.includes('caps')) {
    return '/capsules_pill.png';
  } else {
    return '/api_powder.png';
  }
}

export default function PublicCatalogueClient({ products, user }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div id="home" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' }}>
      
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
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, animation: 'pulse 2s infinite' }}>⚗</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1.1, letterSpacing: 0.5 }}>AasaMedChem</div>
            <div style={{ color: '#7dd3fc', fontSize: 11, fontWeight: 600 }}>Chemical Distribution System</div>
          </div>
        </div>

        {/* Anchor links navbar */}
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#home" style={navLinkStyle}>Home</a>
          <a href="#catalogue" style={navLinkStyle}>Catalogue</a>
          <a href="#services" style={navLinkStyle}>Services</a>
          <a href="#about" style={navLinkStyle}>About Us</a>
          <a href="#contact" style={navLinkStyle}>Contact</a>
        </nav>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#e0f2fe', fontSize: 13, marginRight: 6 }} className="hidden-mobile">
                Welcome, <strong>{user.name}</strong>
              </span>
              <Link href={user.role === 'admin' ? '/admin' : '/seller'} style={{
                background: '#0ea5e9',
                color: '#fff',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)'
              }}>
                Portal →
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
                borderRadius: 8
              }}>
                Sign In
              </Link>
              <Link href="/signup" style={{
                background: '#fff',
                color: '#0c4a6e',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{
        position: 'relative',
        height: 420,
        backgroundImage: 'url("/pharmaceutical_banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', maxWidth: 850 }}>
          <h1 style={{
            fontSize: 44,
            fontWeight: 900,
            margin: '0 0 16px',
            lineHeight: 1.2,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            letterSpacing: -0.5
          }}>
            Next-Generation API & Chemical Distribution
          </h1>
          <p style={{
            fontSize: 18,
            color: '#cbd5e1',
            margin: '0 0 32px',
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

      {/* Catalogue Anchor Container */}
      <div id="catalogue" style={{ scrollMarginTop: 80 }}></div>

      {/* Main Catalogue Grid */}
      <main style={{ padding: '60px 40px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Interactive Chemical Catalogue
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Browse live active inventory. Click any item to convert units, check density, and calculate custom quotation rates.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
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
                  padding: '12px 16px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Active Stock List
              </label>
              <div style={{
                padding: '12px 16px',
                background: '#f0f9ff',
                border: '1.5px solid #bae6fd',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                color: '#0369a1'
              }}>
                🟢 {products.length} Items Live in Database
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
          gap: 24
        }}>
          {filtered.map(p => {
            const stockNum = Number(p.stock_quantity);
            const isLowStock = stockNum < 1000;
            const livePic = getProductImage(p.category, p.sku);

            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 28px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                }}
              >
                {/* Product Live Picture Header */}
                <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: '#f8fafc' }}>
                  <img
                    src={livePic}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#0369a1',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {p.category}
                  </div>
                </div>

                {/* Card Info */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{p.sku}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isLowStock ? '#d97706' : '#059669' }}>
                        {isLowStock ? '⚠️ Low Stock' : '🟢 Active'}
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
                      {p.description || `Certified high-grade pharmaceutical compound, raw chemical material.`}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 12,
                      borderTop: '1px solid #f1f5f9',
                      marginBottom: 16
                    }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Base Rate</span>
                        <strong style={{ fontSize: 16, color: '#0369a1' }}>
                          {paiseToCurrency(p.price_per_base_unit_paise)}
                        </strong>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}> / {p.base_unit}</span>
                      </div>
                      
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Stock: {Number(p.stock_quantity).toLocaleString('en-US')} {p.base_unit}
                      </span>
                    </div>

                    <Link href={`/products/${p.id}`} style={{
                      display: 'block',
                      background: '#0c4a6e',
                      color: '#fff',
                      textDecoration: 'none',
                      textAlign: 'center',
                      padding: '10px 0',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(12, 74, 110, 0.15)'
                    }}>
                      View Details & Live Conversions
                    </Link>
                  </div>
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

      {/* Services Section Anchor */}
      <div id="services" style={{ scrollMarginTop: 80 }}></div>

      {/* Services Section */}
      <section style={{ background: '#f1f5f9', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ color: '#0284c7', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>What We Do</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 6, marginBottom: 12 }}>Our Services & Capabilities</h2>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
              We provide state-of-the-art logistics, bulk pharmaceutical sourcing, and documentation to support compliance standards.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { title: 'Bulk API Sourcing', icon: '🧪', desc: 'Direct procurement of high-purity Active Pharmaceutical Ingredients from FDA-approved global manufacturers with complete regulatory files.' },
              { title: 'Excipient Formulation', icon: '💊', desc: 'Providing top-grade binders, disintegrants, lubricants, and vegetarian capsule shells to support dry powder compression and encapsulations.' },
              { title: 'High-Purity Solvents', icon: '🛢️', desc: 'Supplying compounding pharmacies and chemical manufacturing lines with grade-certified ethanol, IPA, and purified solvents.' },
              { title: 'Cold-Chain Logistics', icon: '❄️', desc: 'Secure, temperature-regulated transit and warehousing to preserve molecule stability and prevent degradation during delivery.' },
              { title: 'Regulatory Compliance', icon: '📋', desc: 'All materials supplied with detailed Certificates of Analysis (CoA), GMP documentation, and full batch traceability metrics.' },
              { title: 'Compounding Customization', icon: '⚖️', desc: 'Custom unit subdivisions and package sizing solutions to meet research laboratory specifications and reduce physical inventory waste.' }
            ].map((s, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: 16,
                padding: 30,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section Anchor */}
      <div id="about" style={{ scrollMarginTop: 80 }}></div>

      {/* About Us Section */}
      <section style={{ background: '#fff', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ color: '#0284c7', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Who We Are</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 6, marginBottom: 16 }}>Trusted Partner in Chemical & API Supply</h2>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
              Founded in 2012, Aasa MedChem is a leading distributor of high-purity pharmaceutical raw materials, solvents, and excipients. We bridge the gap between world-class chemical synthesis facilities and local pharmacies, hospitals, and manufacturing laboratories.
            </p>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 24 }}>
              Our operations comply strictly with global pharmaceutical distribution protocols. From initial quality audits to clean-room packaging and climate-monitored transportation, we guarantee that every batch meets the highest compliance benchmarks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e' }}>99.9%</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Chemical Purity Guaranteed</div>
              </div>
              <div style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e' }}>24 Hours</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Logistics Dispatch SLA</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            borderRadius: 24,
            padding: 40,
            border: '1px solid #bae6fd',
            boxShadow: '0 10px 30px rgba(14, 165, 233, 0.08)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', margin: '0 0 16px' }}>Quality Assurance Commitments</h3>
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#334155', fontWeight: 500 }}>
              <li>WHO-GMP Audited partner labs ensure raw compliance parameters are strictly met.</li>
              <li>Fully automated batch-tracking systems link SKU histories with individual Certificates of Analysis.</li>
              <li>All solvents and liquid materials undergo rigorous purity validation testing before dispatch.</li>
              <li>Compounding containers utilize hermetic induction-sealed lids for shelf stability.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section Anchor */}
      <div id="contact" style={{ scrollMarginTop: 80 }}></div>

      {/* Contact Us Section */}
      <section style={{ background: '#f8fafc', padding: '80px 40px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: '#0284c7', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Get in touch</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginTop: 6, marginBottom: 12 }}>Contact Our Experts</h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>
              For custom volume orders, regulatory document requests, or sales inquiries.
            </p>
          </div>

          {contactSuccess && (
            <div style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '16px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 24,
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.1)'
            }}>
              ✅ Inquiry submitted successfully! Our pharmaceutical sales team will respond within 2 hours.
            </div>
          )}

          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 36,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 25px rgba(0,0,0,0.03)'
          }}>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={contactLabelStyle}>Your Name *</label>
                  <input
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Dr. Mahir Reddy"
                    style={contactInputStyle}
                  />
                </div>
                <div>
                  <label style={contactLabelStyle}>Business Email *</label>
                  <input
                    required
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. mahir@hospital.org"
                    style={contactInputStyle}
                  />
                </div>
              </div>
              
              <div>
                <label style={contactLabelStyle}>Subject *</label>
                <input
                  required
                  value={contactForm.subject}
                  onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="e.g. Certificate of Analysis Request for Metformin API"
                  style={contactInputStyle}
                />
              </div>

              <div>
                <label style={contactLabelStyle}>Inquiry Message *</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Explain your batch size constraints or regulatory specifications..."
                  style={{ ...contactInputStyle, resize: 'vertical' }}
                />
              </div>

              <button type="submit" style={{
                background: '#0c4a6e',
                color: '#fff',
                border: 'none',
                padding: '14px 0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(12, 74, 110, 0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
              onMouseLeave={e => e.currentTarget.style.background = '#0c4a6e'}
              >
                Submit Inquiry / Request Call
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#64748b',
        padding: '40px 40px 30px',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto'
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
            <h4 style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <a href="#home" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
              <a href="#catalogue" style={{ color: '#94a3b8', textDecoration: 'none' }}>Catalogue</a>
              <a href="#services" style={{ color: '#94a3b8', textDecoration: 'none' }}>Services</a>
              <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
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

const navLinkStyle: React.CSSProperties = {
  color: '#bae6fd',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
  transition: 'color 0.15s'
};

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

const contactInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const contactLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: '#334155',
  marginBottom: 6
};
