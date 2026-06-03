'use client';

import { useState } from 'react';
import { paiseToCurrency, formatQuantity } from '@/lib/units';
import type { Order, OrderStatus } from '@/lib/db';

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  async function updateStatus(orderId: number, status: OrderStatus) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : null);
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 24, height: 'calc(100vh - 64px)' }}>
      {/* Left — order list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', margin: '0 0 4px' }}>Orders</h1>
            <p style={{ color: '#64748b', margin: 0 }}>{orders.length} total quotations</p>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => setSelected(o)} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', background: selected?.id === o.id ? '#f0f9ff' : undefined }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#0369a1' }}>#{o.id}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{(o as any).user_name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>{(o as any).user_email}</div>
                  </td>
                  <td style={tdStyle}>{(o.items || []).length} item(s)</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{paiseToCurrency(o.total_paise)}</td>
                  <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }} className={`badge-${o.status}`}>{o.status}</span></td>
                  <td style={tdStyle}>{new Date((o as any).created_at).toLocaleDateString('en-IN')}</td>
                  <td style={tdStyle}>
                    <select
                      value={o.status}
                      onChange={e => { e.stopPropagation(); updateStatus(o.id, e.target.value as OrderStatus); }}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — detail panel */}
      {selected && (
        <div style={{ width: 380, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 2px', fontWeight: 800, color: '#0c4a6e' }}>Order #{selected.id}</h3>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }} className={`badge-${selected.status}`}>{selected.status}</span>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>✕</button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Customer</div>
              <div style={{ fontWeight: 600 }}>{(selected as any).user_name}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{(selected as any).user_email}</div>
            </div>

            {selected.notes && (
              <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                <strong>Notes:</strong> {selected.notes}
              </div>
            )}

            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Order Items</div>
            {(selected.items || []).map((item: any) => (
              <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.product_name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12 }}>
                  <div><span style={{ color: '#64748b' }}>Ordered:</span> {formatQuantity(item.ordered_quantity, item.ordered_unit)}</div>
                  <div><span style={{ color: '#64748b' }}>Base qty:</span> {Number(item.base_quantity).toLocaleString()} {/* we can derive unit */}</div>
                  <div><span style={{ color: '#64748b' }}>Unit price:</span> {paiseToCurrency(item.unit_price_paise)}/base</div>
                  <div><span style={{ color: '#64748b' }}>Line total:</span> <strong>{paiseToCurrency(item.total_paise)}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>Grand Total</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0369a1' }}>{paiseToCurrency(selected.total_paise)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 };
const tdStyle: React.CSSProperties = { padding: '12px 14px', fontSize: 13, color: '#374151' };
