import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { products } from '../data/products';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem }: CartProps) {
  const cartProducts = cartItems.map(item => ({
    ...products.find(p => p.id === item.productId)!,
    quantity: item.quantity,
  })).filter(item => item.id); // Filter out any undefined products

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 100 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4">
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
            to="/shop"
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--saffron)' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartProducts.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-xl flex gap-4"
              >
                <Link 
                  to={`/product/${item.id}`}
                  className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="mb-1 hover:opacity-70 transition-opacity">{item.name}</h3>
                  </Link>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>
                    by {item.artisan}
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--saffron)' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
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
            <div 
              className="bg-white p-6 rounded-xl sticky top-24"
              style={{ border: '2px solid var(--beige)' }}
            >
              <h3 className="mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-gray)' }}>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-gray)' }}>Shipping</span>
                  <span className="font-semibold">₹{shipping.toLocaleString('en-IN')}</span>
                </div>
                <div 
                  className="border-t pt-3"
                  style={{ borderColor: 'var(--beige)' }}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl" style={{ color: 'var(--saffron)' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full px-6 py-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity mb-3"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center py-3 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--saffron)' }}
              >
                Continue Shopping
              </Link>

              {/* Benefits */}
              <div 
                className="mt-6 pt-6 space-y-3"
                style={{ borderTop: '2px solid var(--beige)' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                    Free shipping on orders over ₹2,000
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                    100% authentic handcrafted products
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                    Support local artisan communities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
