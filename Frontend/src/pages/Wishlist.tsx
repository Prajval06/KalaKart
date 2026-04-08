import { Link } from 'react-router';
import { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useTranslation } from 'react-i18next';

export default function Wishlist() {
  const { t } = useTranslation();
  const { wishlistItems, toggleWishlist, addToCart, getAllProducts } = useAppContext();
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});

  const getQty = (productId: string) => qtyByProduct[productId] || 1;

  const changeQty = (productId: string, change: number) => {
    setQtyByProduct((prev) => {
      const current = prev[productId] || 1;
      return {
        ...prev,
        [productId]: Math.max(1, current + change),
      };
    });
  };
  
  const allProducts = getAllProducts();
  const wishlistProducts = allProducts.filter((product) =>
    wishlistItems.includes(product.id)
  );

  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh' }}>
      <Breadcrumb items={[{ label: t('header.home'), href: '/' }, { label: t('wishlist.title') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" style={{ color: 'var(--rust-red)' }} fill="var(--rust-red)" />
            <h1 style={{ color: 'var(--dark-brown)' }}>{t('wishlist.title')}</h1>
          </div>
          <p style={{ color: 'var(--text-dark)' }}>
            {t('wishlist.savedCount', {
              count: wishlistProducts.length,
              label: wishlistProducts.length === 1 ? t('wishlist.item') : t('wishlist.items')
            })}
          </p>
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto mb-6 opacity-30" style={{ color: 'var(--dark-brown)' }} />
            <h2 className="mb-4" style={{ color: 'var(--dark-brown)' }}>
              {t('wishlist.emptyTitle')}
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-dark)' }}>
              {t('wishlist.emptySubtitle')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--rust-red)' }}
            >
              {t('wishlist.exploreProducts')}
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
                    <ImageWithFallback
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
                    {t('wishlist.by')} {product.artisan}
                  </p>
                  <p className="mb-4 font-semibold" style={{ color: 'var(--rust-red)', fontSize: '1.25rem' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => changeQty(product.id, -1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold" style={{ color: 'var(--dark-brown)' }}>
                      {getQty(product.id)}
                    </span>
                    <button
                      onClick={() => changeQty(product.id, 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product.id, product.name, getQty(product.id))}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--sage-green)' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t('wishlist.addToCart')}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="px-4 py-3 rounded-full hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: '#FEE' }}
                      title={t('wishlist.removeFromWishlist')}
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