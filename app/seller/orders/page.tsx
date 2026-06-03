'use client';

import { useEffect, useState } from 'react';
import { paiseToCurrency, formatQuantity } from '@/lib/units';
import type { Order, Unit } from '@/lib/db';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading orders…</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 24, height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', margin: '0 0 4px' }}>My Orders</h1>
        <p style={{ color: '#64748b', margin: '0 0 24px' }}>{orders.length} orders placed</p>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Order #', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => setSelected(o)} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', background: selected?.id === o.id ? '#f0f9ff' : undefined }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#0369a1' }}>#{o.id}</td>
                  <td style={tdStyle}>{(o.items || []).length} item(s)</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{paiseToCurrency(o.total_paise)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }} className={`badge-${o.status}`}>{o.status}</span>
                  </td>
                  <td style={tdStyle}>{new Date((o as any).created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No orders yet. <a href="/seller" style={{ color: '#0369a1' }}>Browse products →</a></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{ width: 360, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#0c4a6e' }}>Order #{selected.id}</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4 }} className={`badge-${selected.status}`}>{selected.status}</span>
            <div style={{ marginTop: 16, fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Items</div>
            {(selected.items || []).map((item: any) => (
              <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{item.product_name}</div>
                <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>Ordered: <strong>{formatQuantity(item.ordered_quantity, item.ordered_unit)}</strong></div>
                  <div>Line Total: <strong style={{ color: '#0369a1' }}>{paiseToCurrency(item.total_paise)}</strong></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0369a1' }}>{paiseToCurrency(selected.total_paise)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: '#374151' };
