import { Link } from 'react-router';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { products } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist, addToCart } = useAppContext();
  const wishlistProducts = products.filter((product) =>
    wishlistItems.includes(product.id)
  );

  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh' }}>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Wishlist' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" style={{ color: 'var(--rust-red)' }} fill="var(--rust-red)" />
            <h1 style={{ color: 'var(--dark-brown)' }}>My Wishlist</h1>
          </div>
          <p style={{ color: 'var(--text-dark)' }}>
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto mb-6 opacity-30" style={{ color: 'var(--dark-brown)' }} />
            <h2 className="mb-4" style={{ color: 'var(--dark-brown)' }}>
              Your wishlist is empty
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-dark)' }}>
              Start exploring and save your favorite handicrafts!
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--rust-red)' }}
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="mb-2 line-clamp-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--dark-brown)' }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-dark)' }}>
                    by {product.artisan}
                  </p>
                  <p className="mb-4 font-semibold" style={{ color: 'var(--rust-red)', fontSize: '1.25rem' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product.id, product.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--sage-green)' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="px-4 py-3 rounded-full hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: '#FEE' }}
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" style={{ color: 'var(--rust-red)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold border-2 hover:bg-white transition-colors"
              style={{ 
                borderColor: 'var(--dark-brown)', 
                color: 'var(--dark-brown)' 
              }}
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}