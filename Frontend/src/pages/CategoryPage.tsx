import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingBag, SlidersHorizontal, ChevronDown } from 'lucide-react';
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

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

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

  const [sort, setSort] = useState('default');
  const [showSort, setShowSort] = useState(false);

  const categoryProducts = useMemo(() => {
    const base = products.filter(p => p.category === decoded);
    switch (sort) {
      case 'price-asc':  return [...base].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...base].sort((a, b) => b.price - a.price);
      case 'name-asc':   return [...base].sort((a, b) => a.name.localeCompare(b.name));
      default:           return base;
    }
  }, [decoded, sort]);

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

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm hover:border-gray-300 transition-colors"
              style={{ color: 'var(--dark-brown)' }}
            >
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSort(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                      style={{
                        color: sort === opt.value ? cfg.accent : 'var(--dark-brown)',
                        fontWeight: sort === opt.value ? 600 : 400,
                        backgroundColor: sort === opt.value ? `${cfg.accent}10` : 'transparent',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2" style={{ color: 'var(--dark-brown)' }}>No products found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any products in this category.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cfg.accent }}
            >
              Back to Home
            </Link>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}