import sql from '@/lib/db';
import { paiseToCurrency } from '@/lib/units';

async function getStats() {
  const [{ count: totalProducts }] = await sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
  const [{ count: totalOrders }] = await sql`SELECT COUNT(*) FROM orders`;
  const [{ count: pendingOrders }] = await sql`SELECT COUNT(*) FROM orders WHERE status = 'pending'`;
  const [{ sum: revenue }] = await sql`SELECT COALESCE(SUM(total_paise),0) as sum FROM orders WHERE status IN ('confirmed','fulfilled')`;
  const recentOrders = await sql`
    SELECT o.id, o.status, o.total_paise, o.created_at, u.name as user_name
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC LIMIT 5
  `;
  const lowStock = await sql`
    SELECT id, name, sku, base_unit, stock_quantity
    FROM products WHERE is_active = true AND stock_quantity < 1000
    ORDER BY stock_quantity ASC LIMIT 5
  `;
  return { totalProducts, totalOrders, pendingOrders, revenue, recentOrders, lowStock };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Active Products', value: stats.totalProducts, icon: '◈', color: '#0369a1' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📋', color: '#7c3aed' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: '#d97706' },
    { label: 'Revenue (Confirmed)', value: paiseToCurrency(stats.revenue), icon: '₹', color: '#059669' },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', margin: '0 0 6px' }}>Dashboard</h1>
      <p style={{ color: '#64748b', margin: '0 0 32px' }}>Welcome back, Admin</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Orders</h2>
            <a href="/admin/orders" style={{ fontSize: 13, color: '#0369a1', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <div>
            {stats.recentOrders.length === 0 ? (
              <p style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>No orders yet</p>
            ) : stats.recentOrders.map((o: any) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>#{o.id} — {o.user_name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{paiseToCurrency(o.total_paise)}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }} className={`badge-${o.status}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Low Stock Alert</h2>
          </div>
          <div>
            {stats.lowStock.length === 0 ? (
              <p style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>All products well stocked</p>
            ) : stats.lowStock.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{p.sku}</div>
                </div>
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  {Number(p.stock_quantity).toLocaleString('en-US')} {p.base_unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
