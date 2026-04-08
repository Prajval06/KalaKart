import { Link } from 'react-router';
import { Package, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Processing: { bg: 'rgba(180,140,90,0.12)', color: '#8B6914' },
  Shipped: { bg: 'rgba(74,100,180,0.12)', color: '#3A5AB4' },
  Delivered: { bg: 'rgba(74,140,74,0.12)', color: '#2A7A2A' },
};

const STATUS_ICON: Record<string, ReactNode> = {
  Processing: <Package className="w-4 h-4" />,
  Shipped: <Truck className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
};

export default function Orders() {
  const { t } = useTranslation();
  const { orders, isLoggedIn } = useAppContext();

  const ongoingOrders = orders.filter((order) => order.status !== 'Delivered');
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered');

  const renderOrderCard = (order: (typeof orders)[number]) => {
    const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.Processing;
    const date = new Date(order.placedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <article
        key={order.id}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid var(--beige)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          style={{ backgroundColor: 'rgba(180,140,90,0.05)', borderBottom: '1px solid var(--beige)' }}
        >
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--saffron)' }}>#{order.id}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-gray)' }}>{date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: style.bg, color: style.color }}
            >
              {STATUS_ICON[order.status] ?? STATUS_ICON.Processing}
              {order.status}
            </span>
            <span className="font-bold text-sm" style={{ color: 'var(--dark-brown)' }}>
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--dark-brown)' }}>
                  {item.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-gray)' }}>
                  {t('cart.byArtisan', { artisan: item.artisan })} · ×{item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--saffron)' }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb items={[{ label: t('header.home'), href: '/' }, { label: t('cart.myOrders') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2">{t('cart.myOrders')}</h1>
            <p style={{ color: 'var(--text-gray)' }}>
              Track your ongoing orders and view your delivered purchases.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full" style={{ backgroundColor: '#FFF0D0', color: 'var(--dark-brown)' }}>
              Ongoing: {ongoingOrders.length}
            </span>
            <span className="px-3 py-1 rounded-full" style={{ backgroundColor: '#EAF7EA', color: 'var(--dark-brown)' }}>
              Delivered: {deliveredOrders.length}
            </span>
          </div>
        </header>

        {!isLoggedIn ? (
          <section className="bg-white rounded-2xl p-8 text-center" style={{ border: '1.5px solid var(--beige)' }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--saffron)' }} />
            <h3 className="mb-2">Login to view your orders</h3>
            <p className="mb-5" style={{ color: 'var(--text-gray)' }}>
              Please sign in to see your ongoing and delivered orders.
            </p>
            <Link
              to="/auth?redirect=/orders"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              {t('header.loginSignup')}
            </Link>
          </section>
        ) : orders.length === 0 ? (
          <section className="bg-white rounded-2xl p-8 text-center" style={{ border: '1.5px solid var(--beige)' }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--saffron)' }} />
            <h3 className="mb-2">{t('cart.noOrdersYet')}</h3>
            <p className="mb-5" style={{ color: 'var(--text-gray)' }}>{t('cart.noOrdersDesc')}</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              {t('cart.startShopping')}
            </Link>
          </section>
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2>Ongoing Orders</h2>
              </div>
              {ongoingOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-sm" style={{ border: '1.5px solid var(--beige)', color: 'var(--text-gray)' }}>
                  No ongoing orders right now.
                </div>
              ) : (
                <div className="space-y-4">{ongoingOrders.map(renderOrderCard)}</div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2>Delivered Orders</h2>
              </div>
              {deliveredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-sm" style={{ border: '1.5px solid var(--beige)', color: 'var(--text-gray)' }}>
                  Your delivered orders will appear here.
                </div>
              ) : (
                <div className="space-y-4">{deliveredOrders.map(renderOrderCard)}</div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
