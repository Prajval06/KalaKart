import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, LogIn, ClipboardList, X, Package, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import { calculatePlatformFee } from '../utils/shipping';
import { ImageWithFallback } from '../components/ImageWithFallback';

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Processing: { bg: 'rgba(180,140,90,0.12)', color: '#8B6914' },
  Shipped:    { bg: 'rgba(74,100,180,0.12)', color: '#3A5AB4' },
  Delivered:  { bg: 'rgba(74,140,74,0.12)',  color: '#2A7A2A' },
};

// ── Orders slide-in panel ─────────────────────────────────────────────────────
function OrdersPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { orders } = useAppContext();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.40)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 'min(420px, 100vw)',
          backgroundColor: 'var(--cream-bg)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '2px solid var(--beige)', backgroundColor: 'white' }}
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <h3 style={{ color: 'var(--dark-brown)' }}>My Orders</h3>
            {orders.length > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--saffron)', color: 'white' }}
              >
                {orders.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close orders panel"
          >
            <X className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(180,140,90,0.10)' }}
              >
                <Package className="w-10 h-10" style={{ color: 'var(--saffron)' }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: 'var(--dark-brown)' }}>No orders yet</p>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                Your past orders will appear here after checkout.
              </p>
              <Link
                to="/"
                onClick={onClose}
                className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                Start Shopping <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            orders.map(order => {
              const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.Processing;
              const date = new Date(order.placedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid var(--beige)' }}
                >
                  {/* Order header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: 'rgba(180,140,90,0.05)', borderBottom: '1px solid var(--beige)' }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--saffron)' }}>#{order.id}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-gray)' }}>{date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {order.status}
                      </span>
                      <span className="font-bold text-sm" style={{ color: 'var(--dark-brown)' }}>
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 space-y-3">
                    {order.items.map(item => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold line-clamp-1"
                            style={{ color: 'var(--dark-brown)' }}
                          >
                            {item.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-gray)' }}>
                            by {item.artisan} · ×{item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--saffron)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Cart page ────────────────────────────────────────────────────────────
export default function Cart() {
  const { cartItems, updateQuantity, removeItem, isLoggedIn, orders, getAllProducts } = useAppContext();
  const navigate = useNavigate();
  const [ordersOpen, setOrdersOpen] = useState(false);

  const allProducts = getAllProducts();
  const cartProducts = cartItems.map(item => ({
    ...allProducts.find(p => p.id === item.productId)!,
    quantity: item.quantity,
  })).filter(item => item.id);

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryCharge;
  const platformFee = cartProducts.reduce((sum, item) => sum + calculatePlatformFee(item.price) * item.quantity, 0);
  const artisanEarnings = subtotal - platformFee;

  const handleProceedToCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/auth?redirect=/checkout');
    }
  };

  const emptyState = cartItems.length === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }]} />

      {/* ── Orders panel ── */}
      <OrdersPanel open={ordersOpen} onClose={() => setOrdersOpen(false)} />

      {emptyState ? (
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Orders icon even on empty state */}
            <div className="flex justify-end mb-6">
              <button
                id="orders-icon-btn"
                onClick={() => setOrdersOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm hover:shadow-md transition-all"
                style={{ color: 'var(--dark-brown)' }}
              >
                <ClipboardList className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                <span className="font-semibold">My Orders</span>
                {orders.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            <div className="text-center">
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--cream)' }}
              >
                <ShoppingBag className="w-12 h-12" style={{ color: 'var(--saffron)' }} />
              </div>
              <h2 className="mb-4">Your Cart is Empty</h2>
              <p className="mb-8" style={{ color: 'var(--text-gray)' }}>
                Discover beautiful handcrafted products and add them to your cart
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Page title row with Orders icon */}
            <div className="flex items-center justify-between mb-8">
              <h1>Shopping Cart</h1>
              <button
                id="orders-icon-btn"
                onClick={() => setOrdersOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm hover:shadow-md transition-all"
                style={{ color: 'var(--dark-brown)' }}
              >
                <ClipboardList className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                <span className="font-semibold hidden sm:inline">My Orders</span>
                {orders.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartProducts.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl flex gap-4">
                    <Link to={`/product/${item.id}`} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="mb-1 hover:opacity-70 transition-opacity">{item.name}</h3>
                      </Link>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-gray)' }}>by {item.artisan}</p>
                      <p className="font-semibold mb-1" style={{ color: 'var(--saffron)' }}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-gray)' }}>
                        Delivery share: ₹{Math.round(item.price * 0.03).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl sticky top-24" style={{ border: '2px solid var(--beige)' }}>
                  <h3 className="mb-5">Order Summary</h3>



                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-gray)' }}>Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-gray)' }}>🛵 Delivery (3%)</span>
                      <span className="font-semibold">₹{deliveryCharge.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--text-gray)' }}>
                      <span>🏪 Platform fee (10%)</span>
                      <span>₹{platformFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--text-gray)' }}>
                      <span>🧑‍🎨 Artisan earnings (90%)</span>
                      <span>₹{artisanEarnings.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-3" style={{ borderColor: 'var(--beige)' }}>
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-xl" style={{ color: 'var(--saffron)' }}>
                          ₹{total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={cartProducts.length === 0}
                    className="w-full px-6 py-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity mb-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    {!isLoggedIn && <LogIn className="w-4 h-4" />}
                    {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </button>

                  {!isLoggedIn && (
                    <p className="text-xs text-center mb-3" style={{ color: 'var(--text-gray)' }}>
                      Your cart is saved — login to complete your order
                    </p>
                  )}

                  <Link
                    to="/"
                    className="block text-center py-3 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--saffron)' }}
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '2px solid var(--beige)' }}>
                    {[
                      '10% platform fee is deducted from product price',
                      '90% of each product price goes to the artisan',
                      '3% delivery charge is added separately',
                      '100% authentic handcrafted products',
                      'Support local artisan communities',
                    ].map(txt => (
                      <div key={txt} className="flex items-start gap-2">
                        <span className="text-lg">✓</span>
                        <p className="text-sm" style={{ color: 'var(--text-gray)' }}>{txt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
