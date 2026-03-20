import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, Truck, LogIn } from 'lucide-react';
import { products } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import { calculateShipping, calculatePlatformFee, type DeliveryZone, ZONE_LABELS } from '../utils/shipping';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const [zone, setZone] = useState<DeliveryZone>('regional');

  const cartProducts = cartItems.map(item => ({
    ...products.find(p => p.id === item.productId)!,
    quantity: item.quantity,
  })).filter(item => item.id);

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping  = cartProducts.reduce((sum, item) => sum + calculateShipping(item.category, item.price, zone), 0);
  const total = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      // Redirect guest to Auth page; the redirect param brings them back to checkout after login
      navigate('/auth?redirect=/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }]} />
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
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
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }]} />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="mb-8">Shopping Cart</h1>

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
                      🚚 Shipping: ₹{calculateShipping(item.category, item.price, zone).toLocaleString('en-IN')}
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

                {/* Zone Selector */}
                <div className="mb-5">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--dark-brown)' }}>
                    <Truck className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                    Delivery Location
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(Object.keys(ZONE_LABELS) as DeliveryZone[]).map(z => (
                      <button
                        key={z}
                        onClick={() => setZone(z)}
                        className="px-3 py-2 rounded-lg text-sm text-left transition-all"
                        style={
                          zone === z
                            ? { backgroundColor: 'var(--saffron)', color: 'white', fontWeight: 600 }
                            : { backgroundColor: 'var(--beige)', color: 'var(--dark-brown)' }
                        }
                      >
                        {ZONE_LABELS[z]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-gray)' }}>
                    Shipping cost varies based on product type and delivery location
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-gray)' }}>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-gray)' }}>🚚 Shipping</span>
                    <span className="font-semibold">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-gray)' }}>
                    <span>🏪 Platform fee (10%)</span>
                    <span>₹{cartProducts.reduce((s, i) => s + calculatePlatformFee(i.price) * i.quantity, 0).toLocaleString('en-IN')}</span>
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
                  className="w-full px-6 py-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity mb-3 flex items-center justify-center gap-2"
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
                    '10% platform fee helps us operate and support artisans',
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
    </div>
  );
}
