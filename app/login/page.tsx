'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      color: '#fff',
      background: '#0c4a6e',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .left-panel {
            display: none !important;
          }
          .right-panel {
            width: 100% !important;
          }
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }
        .btn-primary {
          width: 100%;
          padding: 14px 0;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.45);
          filter: brightness(1.1);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary:disabled {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.35);
          cursor: not-allowed;
          box-shadow: none;
        }
        .test-cred-btn {
          text-align: left;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          color: #e2e8f0;
          transition: all 0.15s ease;
        }
        .test-cred-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
      `}} />

      {/* Left Panel - Corporate Showcase (Hidden on Mobile) */}
      <div className="left-panel" style={{
        width: '50%',
        position: 'relative',
        backgroundImage: 'url("/pharmaceutical_banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.88) 0%, rgba(15, 23, 42, 0.94) 100%)',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <span style={{ fontSize: 32 }}>⚗</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: 0.5, lineHeight: 1.2 }}>AasaMedChem</div>
                <div style={{ color: '#7dd3fc', fontSize: 11, fontWeight: 600 }}>Chemical Distribution System</div>
              </div>
            </Link>
          </div>

          <div style={{ maxWidth: 500, margin: '40px 0' }}>
            <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 24, lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              Reliable Sourcing for High-Purity Compounds & APIs
            </h1>
            <p style={{ color: '#bae6fd', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Powering compounding pharmacies, clinical trials, and manufacturing laboratories with fully audited, temperature-controlled chemical logistics.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '🧪', title: '99.9% Certified Purity', desc: 'Every batch is analyzed and delivered with a Certificate of Analysis.' },
                { icon: '📦', title: 'GMP Compliant Handling', desc: 'Secure packaging under strict clean-room quality protocols.' },
                { icon: '❄️', title: 'Cold-Chain SLA Logistics', desc: 'Preserves molecular integrity and stability during dispatch.' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: '#93c5fd', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8' }}>99.9%</div>
              <div style={{ fontSize: 11, color: '#bae6fd', fontWeight: 600 }}>Purity SLA</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8' }}>24 Hours</div>
              <div style={{ fontSize: 11, color: '#bae6fd', fontWeight: 600 }}>Logistics Dispatch SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Centered glass container) */}
      <div className="right-panel" style={{
        width: '50%',
        background: 'linear-gradient(135deg, #072e44 0%, #090d16 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative'
      }}>
        {/* Glassmorphic card container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8, textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 20 }}>⚗</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AasaMedChem</span>
            </Link>
            <p style={{ color: '#bae6fd', fontSize: 13, margin: 0 }}>Inventory & Order Management</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#93c5fd', fontSize: 13 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="glass-input"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#93c5fd', fontSize: 13 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="glass-input"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#bae6fd' }}>
            New here? <Link href="/signup" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </div>

          <div style={{ marginTop: 28, padding: 16, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 12, color: '#bae6fd', textTransform: 'uppercase', letterSpacing: 0.5 }}>Test Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { role: 'Admin', email: 'admin@aasa.in', pass: 'admin123' },
                { role: 'Seller', email: 'seller@aasa.in', pass: 'seller123' },
              ].map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                  className="test-cred-btn"
                >
                  <strong style={{ color: '#38bdf8' }}>{c.role}:</strong> {c.email} / {c.pass}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.07)',
  border: '1.5px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 10,
  fontSize: 14,
  color: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
};
