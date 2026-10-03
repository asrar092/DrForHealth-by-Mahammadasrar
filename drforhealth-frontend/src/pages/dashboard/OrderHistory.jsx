import { useEffect, useState } from 'react';
import { orderApi } from '@/api/ebookApi';

const statusStyles = {
  paid: 'bg-success/10 text-success',
  created: 'bg-warning/10 text-warning',
  failed: 'bg-danger/10 text-danger',
  refunded: 'bg-charcoal/10 text-charcoal/60',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .myOrders()
      .then(({ data }) => setOrders(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-charcoal/50">Loading orders…</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center text-charcoal/60">No orders yet.</div>
      ) : (
        <div className="glass-card divide-y divide-border">
          {orders.map((o) => (
            <div key={o._id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{o.ebook?.title}</p>
                <p className="text-xs text-charcoal/50">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display font-semibold">₹{o.amount / 100}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[o.status]}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
