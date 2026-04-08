import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Filter } from 'lucide-react';
import { categories } from '../data/products';
import { ImageWithFallback, DEFAULT_FALLBACK_IMAGE } from '../components/ImageWithFallback';
import { productService } from '../services/product.service';
import { useTranslation } from 'react-i18next';

type ShopProduct = {
  id: string;
  _id?: string;
  slug?: string | null;
  name: string;
  image: string;
  price: number;
  category: string;
  artisan: string;
  state?: string;
};

function normalizeShopProduct(raw: any): ShopProduct {
  const p = raw?.product ?? raw ?? {};
  return {
    id: p.id || p._id || '',
    _id: p._id,
    slug: p.slug ?? null,
    name: p.name || 'Unnamed Product',
    image: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || DEFAULT_FALLBACK_IMAGE,
    price: Number(p.price || 0),
    category: typeof p.category === 'string' ? p.category : 'Craft',
    artisan: p.artisanName || p.artisan || 'KalaKart Artisan',
    state: p.state || 'India',
  };
}

export default function Shop() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productService.getProducts({ per_page: 100 });
        const list = res?.data?.products ?? res?.products ?? [];
        const normalized = list.map(normalizeShopProduct).filter((p: ShopProduct) => !!p.id);
        setAllProducts(normalized);
      } catch (e) {
        setError(t('shop.noProductsFound'));
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return allProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">{t('shop.title')}</h1>
          <p>{t('shop.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <h3>{t('shop.filterByCategory')}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: selectedCategory === category ? 'var(--saffron)' : 'white',
                  color: selectedCategory === category ? 'white' : 'var(--text-dark)',
                  border: `2px solid ${selectedCategory === category ? 'var(--saffron)' : 'var(--beige)'}`,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mb-6">
            <p style={{ color: 'var(--text-gray)' }}>{t('shop.loadingProducts')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6">
            <p style={{ color: 'var(--rust-red)' }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Product Count */}
            <div className="mb-6">
              <p style={{ color: 'var(--text-gray)' }}>
                {t('shop.showing', {
                  count: filteredProducts.length,
                  label: filteredProducts.length === 1 ? t('shop.product') : t('shop.products')
                })}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${encodeURIComponent(product.slug || product.id || product._id || '')}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="w-4 h-4" style={{ color: 'var(--text-gray)' }} />
                    </button>
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white"
                      style={{ backgroundColor: 'var(--saffron)' }}
                    >
                      {product.state}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>
                      {product.category}
                    </p>
                    <h3 className="text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-gray)' }}>
                      {t('shop.by')} {product.artisan}
                    </p>
                    <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl mb-2">{t('shop.noProductsFound')}</p>
                <p style={{ color: 'var(--text-gray)' }}>
                  {t('shop.tryDifferentCategory')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}