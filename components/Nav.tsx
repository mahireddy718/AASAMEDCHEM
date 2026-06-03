'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem { href: string; label: string; icon: string; }

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/products', label: 'Products', icon: '◈' },
  { href: '/admin/orders', label: 'Orders', icon: '📋' },
];

const sellerNav: NavItem[] = [
  { href: '/seller', label: 'Catalogue', icon: '◈' },
  { href: '/seller/orders', label: 'My Orders', icon: '📋' },
];

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : sellerNav;

  return (
    <nav style={{
      width: 220,
      minHeight: '100vh',
      background: '#0c4a6e',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
          <span style={{ fontSize: 22 }}>⚗</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>AasaMedChem</div>
            <div style={{ color: '#7dd3fc', fontSize: 11 }}>{isAdmin ? 'Admin Panel' : 'Seller Portal'}</div>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && item.href !== '/seller' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px',
              color: active ? '#fff' : '#93c5fd',
              background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
              textDecoration: 'none',
              fontWeight: active ? 600 : 400,
              fontSize: 14,
              borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: '#7dd3fc', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Signed in as</div>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{user?.name}</div>
        <div style={{ color: '#93c5fd', fontSize: 12, marginBottom: 12, wordBreak: 'break-all' }}>{user?.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', padding: '8px 0',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
