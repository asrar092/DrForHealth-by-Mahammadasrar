import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Package, Download } from 'lucide-react';
import { purchaseApi, orderApi } from '@/api/ebookApi';
import { useAuthStore } from '@/store/authStore';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ library: 0, orders: 0, downloads: 0 });

  useEffect(() => {
    Promise.all([purchaseApi.myLibrary(), orderApi.myOrders(), purchaseApi.downloadHistory()])
      .then(([lib, orders, downloads]) => {
        setStats({
          library: lib.data.data.length,
          orders: orders.data.data.length,
          downloads: downloads.data.data.length,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'eBooks Owned', value: stats.library, icon: Library, to: '/dashboard/library' },
    { label: 'Total Orders', value: stats.orders, icon: Package, to: '/dashboard/orders' },
    { label: 'Downloads', value: stats.downloads, icon: Download, to: '/dashboard/downloads' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="text-charcoal/60 mb-8">Here's a quick look at your account.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="glass-card glass-card-hover p-6">
            <div className="bg-brand-gradient w-11 h-11 rounded-xl flex items-center justify-center mb-4">
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-display font-bold">{value}</p>
            <p className="text-sm text-charcoal/60">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
