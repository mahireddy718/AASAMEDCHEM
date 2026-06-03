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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 20 }}>⚗</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0c4a6e', letterSpacing: '-0.5px' }}>AasaMedChem</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Inventory & Order Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: 13 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: 13 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0369a1, #0ea5e9)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          New here? <Link href="/signup" style={{ color: '#0369a1', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </div>

        <div style={{ marginTop: 28, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Test Credentials</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { role: 'Admin', email: 'admin@aasa.in', pass: 'admin123' },
              { role: 'Seller', email: 'seller@aasa.in', pass: 'seller123' },
            ].map(c => (
              <button
                key={c.role}
                onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                style={{ textAlign: 'left', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: '#475569' }}
              >
                <strong>{c.role}:</strong> {c.email} / {c.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};
