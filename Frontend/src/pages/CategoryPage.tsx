import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingBag, SlidersHorizontal, ChevronDown, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

const CATEGORY_ACCENTS: Record<string, { accent: string; emoji: string; bg: string }> = {
  'Jewelry':            { accent: '#B5851A', emoji: '💎', bg: '#FDF6E3' },
  'Art & Paintings':    { accent: '#7C3D12', emoji: '🎨', bg: '#FDF0E8' },
  'Pottery & Ceramics': { accent: '#4B8B6F', emoji: '🏺', bg: '#EDF7F2' },
  'Clothing':           { accent: '#9B2335', emoji: '👗', bg: '#FCF0F1' },
  'Textiles & Fabrics': { accent: '#6B4E8A', emoji: '🧵', bg: '#F3EEF9' },
  'Crafts & Weaving':   { accent: '#5A7A2E', emoji: '🧶', bg: '#EFF5E7' },
  'Home Decor':         { accent: '#8B4513', emoji: '🏮', bg: '#F8F0E8' },
};

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A–Z' },
];

const ALL_CATEGORIES = [
  'Jewelry',
  'Art & Paintings',
  'Clothing',
  'Pottery & Ceramics',
  'Crafts & Weaving',
  'Textiles & Fabrics',
  'Home Decor',
];

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

// ── Dual-handle range slider ──────────────────────────────────────────────────
function RangeSlider({
  min, max, low, high, accent,
  onChange,
}: {
  min: number; max: number; low: number; high: number; accent: string;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  function clamp(v: number, lo: number, hi: number) { return Math.min(Math.max(v, lo), hi); }

  function posToValue(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return Math.round((ratio * (max - min) + min) / 100) * 100;
  }

  function startDrag(which: 'low' | 'high') {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const v = posToValue(clientX);
      if (which === 'low')  onChange(clamp(v, min, high - 100), high);
      else                  onChange(low, clamp(v, low + 100, max));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  return (
    <div className="px-1 py-2 select-none">
      {/* Track */}
      <div ref={trackRef} className="relative h-2 rounded-full bg-gray-200 mx-2">
        {/* Filled range */}
        <div
          className="absolute h-2 rounded-full"
          style={{
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
            backgroundColor: accent,
          }}
        />
        {/* Low thumb */}
        <button
          onMouseDown={() => startDrag('low')}
          onTouchStart={() => startDrag('low')}
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform focus:outline-none"
          style={{ left: `${pct(low)}%`, top: '50%', backgroundColor: accent, zIndex: 2 }}
          aria-label={`Minimum price ₹${low}`}
        />
        {/* High thumb */}
        <button
          onMouseDown={() => startDrag('high')}
          onTouchStart={() => startDrag('high')}
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform focus:outline-none"
          style={{ left: `${pct(high)}%`, top: '50%', backgroundColor: accent, zIndex: 2 }}
          aria-label={`Maximum price ₹${high}`}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-3 text-xs font-semibold" style={{ color: accent }}>
        <span>₹{low.toLocaleString('en-IN')}</span>
        <span>₹{high.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const { getAllProducts } = useAppContext();
  const decoded = decodeURIComponent(categoryName || '');
  const cfg = CATEGORY_ACCENTS[decoded] ?? { accent: 'var(--rust-red)', emoji: '🛍️', bg: '#F8F4EA' };

  // Sort + price filter state
  const [sort, setSort]         = useState('default');
  const [showFilter, setShowFilter] = useState(false);
  const [priceLow, setPriceLow]   = useState(PRICE_MIN);
  const [priceHigh, setPriceHigh] = useState(PRICE_MAX);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const categoryProducts = useMemo(() => {
    const allProducts = getAllProducts();
    const base = allProducts
      .filter(p => p.category === decoded)
      .filter(p => p.price >= priceLow && p.price <= priceHigh);
    switch (sort) {
      case 'price-asc':  return [...base].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...base].sort((a, b) => b.price - a.price);
      case 'name-asc':   return [...base].sort((a, b) => a.name.localeCompare(b.name));
      default:           return base;
    }
  }, [decoded, sort, priceLow, priceHigh, getAllProducts]);

  // Badge to show when filters are active
  const filtersActive = sort !== 'default' || priceLow > PRICE_MIN || priceHigh < PRICE_MAX;

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
              <ArrowLeft className="w-6 h-6" />
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
        {/* Category quick-jump pills */}
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

          {/* ── Filter By dropdown ── */}
          <div ref={dropdownRef} className="relative">
            <button
              id="filter-by-btn"
              onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border text-sm hover:border-gray-300 transition-colors"
              style={{
                color: 'var(--dark-brown)',
                borderColor: filtersActive ? cfg.accent : '#E5E7EB',
                boxShadow: filtersActive ? `0 0 0 2px ${cfg.accent}22` : undefined,
              }}
            >
              <SlidersHorizontal className="w-4 h-4" style={{ color: filtersActive ? cfg.accent : '#9CA3AF' }} />
              Filter By
              {filtersActive && (
                <span
                  className="ml-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.accent }}
                />
              )}
              <ChevronDown
                className="w-4 h-4 text-gray-400 transition-transform"
                style={{ transform: showFilter ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {showFilter && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30"
                style={{ minWidth: '288px' }}
              >
                {/* ── Sort section ── */}
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: cfg.accent }}>
                    Sort By
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors"
                        style={{
                          color: sort === opt.value ? cfg.accent : 'var(--dark-brown)',
                          fontWeight: sort === opt.value ? 600 : 400,
                          backgroundColor: sort === opt.value ? `${cfg.accent}12` : 'transparent',
                        }}
                      >
                        {opt.label}
                        {sort === opt.value && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cfg.accent }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mx-4" style={{ backgroundColor: `${cfg.accent}20` }} />

                {/* ── Price range section ── */}
                <div className="px-4 pt-3 pb-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: cfg.accent }}>
                    Price Range
                  </p>
                  <RangeSlider
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    low={priceLow}
                    high={priceHigh}
                    accent={cfg.accent}
                    onChange={(lo, hi) => { setPriceLow(lo); setPriceHigh(hi); }}
                  />
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 text-center rounded-xl py-1.5 text-xs border" style={{ borderColor: `${cfg.accent}40`, color: '#7A6A5A' }}>
                      Min: <strong style={{ color: cfg.accent }}>₹{priceLow.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex-1 text-center rounded-xl py-1.5 text-xs border" style={{ borderColor: `${cfg.accent}40`, color: '#7A6A5A' }}>
                      Max: <strong style={{ color: cfg.accent }}>₹{priceHigh.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mx-4" style={{ backgroundColor: `${cfg.accent}20` }} />

                {/* Reset */}
                <div className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSort('default');
                      setPriceLow(PRICE_MIN);
                      setPriceHigh(PRICE_MAX);
                    }}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ backgroundColor: `${cfg.accent}15`, color: cfg.accent }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2" style={{ color: 'var(--dark-brown)' }}>No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your price range or sort order.</p>
            <button
              onClick={() => { setPriceLow(PRICE_MIN); setPriceHigh(PRICE_MAX); setSort('default'); }}
              className="inline-flex items-center px-6 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cfg.accent }}
            >
              Reset Filters
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
                  <ImageWithFallback
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