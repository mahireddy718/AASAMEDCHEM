'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'seller'>('seller');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to create account');
        return;
      }

      setSuccess('Account created. You can now sign in.');
      setTimeout(() => router.push('/login'), 900);
    } catch {
      setError('Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("/pharmaceutical_banner.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: 20,
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .glass-input:focus, .glass-select:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }
        .glass-select option {
          background: #0f172a;
          color: #ffffff;
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
      `}} />

      {/* Dark premium overlay to match homepage */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.9) 0%, rgba(15, 23, 42, 0.94) 100%)',
        zIndex: 1
      }} />

      {/* Glassmorphic card container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: '44px 40px',
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 20 }}>⚗</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AasaMedChem</span>
          </Link>
          <p style={{ color: '#bae6fd', fontSize: 13, margin: 0 }}>Create an admin or seller account</p>
        </div>

        <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 10, color: '#e0f2fe', fontSize: 13 }}>
          Choose the role you want to create. Admins can access the admin area; sellers can access the seller portal.
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'seller')} required className="glass-select" style={inputStyle}>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className="glass-input" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="glass-input" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required className="glass-input" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className="glass-input" style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#a7f3d0', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating account…' : `Create ${role === 'admin' ? 'Admin' : 'Seller'} Account`}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#bae6fd' }}>
          Already have an account? <Link href="/login" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 6,
  color: '#93c5fd',
  fontSize: 13,
};

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