import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingBag, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';
import { products } from '../data/products';
import { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';

const CATEGORY_ACCENTS: Record<string, { accent: string; emoji: string; bg: string }> = {
  'Jewelry':            { accent: '#B5851A', emoji: '💎', bg: '#FDF6E3' },
  'Art & Paintings':    { accent: '#7C3D12', emoji: '🎨', bg: '#FDF0E8' },
  'Pottery & Ceramics': { accent: '#4B8B6F', emoji: '🏺', bg: '#EDF7F2' },
  'Clothing':           { accent: '#9B2335', emoji: '👗', bg: '#FCF0F1' },
  'Textiles & Fabrics': { accent: '#6B4E8A', emoji: '🧵', bg: '#F3EEF9' },
  'Miniatures':         { accent: '#1A6B8A', emoji: '🖼️', bg: '#EAF4F8' },
  'Crafts & Weaving':   { accent: '#5A7A2E', emoji: '🧶', bg: '#EFF5E7' },
  'Home Decor':         { accent: '#8B4513', emoji: '🏮', bg: '#F8F0E8' },
};

const ALL_CATEGORIES = [
  'Jewelry',
  'Art & Paintings',
  'Clothing',
  'Miniatures',
  'Pottery & Ceramics',
  'Crafts & Weaving',
  'Textiles & Fabrics',
  'Home Decor',
];

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(categoryName || '');
  const cfg = CATEGORY_ACCENTS[decoded] ?? { accent: 'var(--rust-red)', emoji: '🛍️', bg: '#F8F4EA' };

  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const getProductRating = (id: string) => {
    const numId = parseInt(id) || 4;
    return 3 + (numId % 3); // 3, 4, or 5
  };

  const categoryProducts = useMemo(() => {
    let base = [...products].filter(p => p.category === decoded);
    base = base.filter(p => p.price <= maxPrice);
    if (minRating > 0) {
      base = base.filter(p => getProductRating(p.id) >= minRating);
    }

    if (sortOrder === 'price-asc') {
      base.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      base.sort((a, b) => b.price - a.price);
    }

    return base;
  }, [decoded, maxPrice, minRating, sortOrder]);

  if (!decoded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: decoded },
        ]}
      />

      {/* Category Hero Banner */}
      <div
        className="py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: cfg.bg, borderBottom: `3px solid ${cfg.accent}22` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/70 transition-colors"
              style={{ color: cfg.accent }}
            >
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl">{cfg.emoji}</span>
                <h1 style={{ color: 'var(--dark-brown)' }}>{decoded}</h1>
              </div>
              <p className="text-sm ml-14" style={{ color: '#7A6A5A' }}>
                {categoryProducts.length} handcrafted {decoded.toLowerCase()} by Indian artisans
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Other categories quick jump */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {ALL_CATEGORIES.map(cat => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat)}`}
              className="flex-none px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap"
              style={
                cat === decoded
                  ? { backgroundColor: cfg.accent, color: 'white', fontWeight: 600 }
                  : { backgroundColor: 'white', color: 'var(--dark-brown)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              }
            >
              {CATEGORY_ACCENTS[cat]?.emoji ?? '🛍️'} {cat}
            </Link>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" style={{ color: cfg.accent }} />
            <span className="text-sm text-gray-600">
              Showing <span style={{ fontWeight: 700, color: 'var(--dark-brown)' }}>{categoryProducts.length}</span> products
            </span>
          </div>

          {/* Filter Dropdown */}
          <div className="relative group/filter">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm transition-all shadow-sm focus:outline-none"
              style={{ color: 'var(--dark-brown)' }}
            >
              Filter By
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover/filter:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all duration-300 translate-y-2 group-hover/filter:translate-y-0">
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Price Range</h4>
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full cursor-pointer"
                    style={{ accentColor: cfg.accent }}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span className="font-semibold text-gray-700">Up to ₹{maxPrice.toLocaleString('en-IN')}</span>
                    <span>₹15k+</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Rating</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="rating"
                      value="all"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span>All Ratings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="rating"
                      value="4"
                      checked={minRating === 4}
                      onChange={() => setMinRating(4)}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span className="flex items-center">4 <Star className="w-3 h-3 mx-1 fill-yellow-400 text-yellow-400"/> & above</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="rating"
                      value="3"
                      checked={minRating === 3}
                      onChange={() => setMinRating(3)}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span className="flex items-center">3 <Star className="w-3 h-3 mx-1 fill-yellow-400 text-yellow-400"/> & above</span>
                  </label>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Sort By</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="sort"
                      value="default"
                      checked={sortOrder === 'default'}
                      onChange={() => setSortOrder('default')}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="sort"
                      value="price-asc"
                      checked={sortOrder === 'price-asc'}
                      onChange={() => setSortOrder('price-asc')}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span>Price: Low to High</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="radio"
                      name="sort"
                      value="price-desc"
                      checked={sortOrder === 'price-desc'}
                      onChange={() => setSortOrder('price-desc')}
                      className="cursor-pointer"
                      style={{ accentColor: cfg.accent }}
                    />
                    <span>Price: High to Low</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2" style={{ color: 'var(--dark-brown)' }}>No products found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any products matching your filters.</p>
            <button
              onClick={() => { setMaxPrice(15000); setMinRating(0); setSortOrder('default'); }}
              className="inline-flex items-center px-6 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cfg.accent }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {categoryProducts.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-400"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to top, ${cfg.accent}bb, transparent 60%)` }}
                  />
                  {/* Category badge */}
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs"
                    style={{ backgroundColor: `${cfg.accent}dd`, backdropFilter: 'blur(4px)' }}
                  >
                    {cfg.emoji}
                  </div>
                </div>
                <div className="p-3">
                  <p
                    className="line-clamp-2 mb-1"
                    style={{ color: 'var(--dark-brown)', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.35 }}
                  >
                    {product.name}
                  </p>
                  <p style={{ color: cfg.accent, fontSize: '0.85rem', fontWeight: 700 }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <p className="truncate mt-0.5" style={{ color: '#9B8B7A', fontSize: '0.7rem' }}>
                    by {product.artisan} · {product.state}
                  </p>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < getProductRating(product.id) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}