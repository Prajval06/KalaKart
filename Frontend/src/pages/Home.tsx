import { Link } from 'react-router';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';


import { products } from '../data/products';
import { useState, useEffect } from 'react';

const CATEGORY_CONFIG: Record<string, { emoji: string; accent: string; label: string }> = {
  'Jewelry':            { emoji: '💎', accent: '#B5851A', label: 'Jewelry' },
  'Art & Paintings':    { emoji: '🎨', accent: '#7C3D12', label: 'Art & Paintings' },
  'Pottery & Ceramics': { emoji: '🏺', accent: '#4B8B6F', label: 'Pottery & Ceramics' },
  'Clothing':           { emoji: '👗', accent: '#9B2335', label: 'Clothing' },
  'Textiles & Fabrics': { emoji: '🧵', accent: '#6B4E8A', label: 'Textiles & Fabrics' },
  'Miniatures':         { emoji: '🖼️', accent: '#1A6B8A', label: 'Miniatures' },
  'Crafts & Weaving':   { emoji: '🧶', accent: '#5A7A2E', label: 'Crafts & Weaving' },
  'Home Decor':         { emoji: '🏮', accent: '#8B4513', label: 'Home Decor' },
};

const FEATURED_CATEGORIES = [
  'Jewelry',
  'Art & Paintings',
  'Clothing',
  'Miniatures',
  'Pottery & Ceramics',
  'Crafts & Weaving',
  'Textiles & Fabrics',
  'Home Decor',
];

const artisanSlides = [
  {
    id: 1, artisanId: '1',
    image: 'https://images.unsplash.com/photo-1764344814985-83e326ba7e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Ramesh Kumar', region: 'Gujarat, India',
    craft: 'Terracotta & Blue Pottery',
    description: 'Third-generation potter crafting timeless terracotta and blue pottery',
    tagline: 'Shaped by Hands, Fired by Tradition',
  },
  {
    id: 2, artisanId: '3',
    image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Lakshmi Sharma', region: 'Jaipur, Rajasthan',
    craft: 'Kundan & Meenakari Jewelry',
    description: 'Exquisite Kundan jewelry crafted with semi-precious stones and enamel',
    tagline: 'The Royal Art of Jaipur',
  },
  {
    id: 3, artisanId: '2',
    image: 'https://images.unsplash.com/photo-1547702128-e8e44b310045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Meera Devi', region: 'Rajasthan, India',
    craft: 'Block Printing & Natural Dyes',
    description: 'Master of traditional block printing with natural vegetable dyes',
    tagline: 'Colours of the Earth',
  },
  {
    id: 4, artisanId: '4',
    image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Anjali Patel', region: 'Maharashtra, India',
    craft: 'Miniature & Mandala Paintings',
    description: 'Contemporary artist fusing ancient miniature techniques with mandala art',
    tagline: 'Stories in Monochrome',
  },
  {
    id: 5, artisanId: '6',
    image: 'https://images.unsplash.com/photo-1627726997943-6e397135f78a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Priya Singh', region: 'Assam, India',
    craft: 'Natural Fiber Weaving',
    description: 'Traditional basket weaver using indigenous techniques and natural materials',
    tagline: 'Woven with Nature',
  },
  {
    id: 6, artisanId: '7',
    image: 'https://images.unsplash.com/photo-1765443254299-eb5f69ab85a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    artisanName: 'Vikram Joshi', region: 'Uttar Pradesh, India',
    craft: 'Brass & Metal Sculpture',
    description: 'Fourth-generation brass artisan creating sacred and decorative metalwork',
    tagline: 'Divine Craftsmanship in Metal',
  },
];

const categories = [
  { name: 'Pottery & Ceramics', emoji: '🏺', image: 'https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
  { name: 'Textiles & Fabrics', emoji: '🧵', image: 'https://images.unsplash.com/photo-1759738096144-b43206226765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
  { name: 'Jewelry', emoji: '💍', image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
  { name: 'Art & Paintings', emoji: '🎨', image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
  { name: 'Home Decor', emoji: '🏮', image: 'https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
  { name: 'Crafts & Weaving', emoji: '🧺', image: 'https://images.unsplash.com/photo-1768902406144-a348c559c73c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const productsByCategory = FEATURED_CATEGORIES.reduce<Record<string, typeof products>>((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % artisanSlides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + artisanSlides.length) % artisanSlides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const slide = artisanSlides[currentSlide];

  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh' }}>
      {/* ── HERO SLIDER ─────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ height: 'clamp(340px, 55vh, 600px)' }}>
        {/* Background image */}
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.artisanName}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transition: 'opacity 0.6s ease' }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(40,15,10,0.88) 0%, rgba(40,15,10,0.65) 60%, rgba(74,44,42,0.3) 100%)' }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] opacity-75 mb-2" style={{ color: 'white', letterSpacing: '0.18em' }}>
            {slide.tagline}
          </p>
          <h1
            className="font-bold leading-tight mb-3"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', maxWidth: '680px', color: 'white' }}
          >
            {slide.craft}
          </h1>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: 'white' }} />
            <p className="text-sm sm:text-base font-medium" style={{ color: 'white' }}>
              Crafted by {slide.artisanName}
            </p>
          </div>
          <p className="text-sm opacity-80 ml-6 mb-5" style={{ color: 'white', maxWidth: '480px' }}>
            {slide.region} · {slide.description}
          </p>
          <div>
            <Link
              to={`/artisan/${slide.artisanId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--rust-red)' }}
            >
              Visit Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>


        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {artisanSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? '28px' : '8px',
                height: '8px',
                backgroundColor: i === currentSlide ? 'white' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES — full bleed section ──────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--dark-brown)' }}>
              Shop by Category
            </h2>
            <Link
              to="/shop"
              className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--rust-red)' }}
            >
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6 equal columns that fill all available width */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '12px',
            }}
          >
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/category/${encodeURIComponent(cat.name)}`}
                className="group relative rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(74,44,42,0.85) 0%, rgba(74,44,42,0.25) 55%, transparent 100%)' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-2 text-center">
                  <span className="text-2xl mb-1 drop-shadow">{cat.emoji}</span>
                  <h3
                    className="font-semibold leading-tight drop-shadow"
                    style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)', color: 'white' }}
                  >
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 space-y-12" style={{ maxWidth: '100%' }}>

        {/* ── FEATURED PRODUCTS BY CATEGORY ─ */}
        <section className="space-y-10">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--dark-brown)' }}>
            Featured Products
          </h2>

          {FEATURED_CATEGORIES.map(cat => {
            const catProducts = productsByCategory[cat];
            if (!catProducts || catProducts.length === 0) return null;
            const cfg = CATEGORY_CONFIG[cat];

            return (
              <div key={cat}>
                {/* Row header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: cfg.accent }} />
                    <span className="text-xl leading-none">{cfg.emoji}</span>
                    <h3
                      className="font-semibold"
                      style={{ color: 'var(--dark-brown)', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)' }}
                    >
                      {cfg.label}
                    </h3>
                    <span
                      className="hidden sm:inline-block text-xs text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.accent }}
                    >
                      {catProducts.length} items
                    </span>
                  </div>
                  <Link
                    to={`/category/${encodeURIComponent(cat)}`}
                    className="text-xs sm:text-sm flex items-center gap-1 hover:opacity-70 transition-opacity font-semibold"
                    style={{ color: cfg.accent }}
                  >
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Product grid — 6 equal columns fill all available width */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '10px',
                  }}
                >
                  {catProducts.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-white"
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(to top, ${cfg.accent}bb, ${cfg.accent}22)` }}
                        />
                      </div>
                      <div className="px-2.5 py-2">
                        <p
                          className="line-clamp-2 mb-0.5 leading-snug font-semibold"
                          style={{ color: 'var(--dark-brown)', fontSize: '0.72rem' }}
                        >
                          {product.name}
                        </p>
                        <p className="font-bold" style={{ color: cfg.accent, fontSize: '0.78rem' }}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <p className="truncate mt-0.5" style={{ color: '#9B8B7A', fontSize: '0.63rem' }}>
                          by {product.artisan}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Separator */}
                <div className="mt-2 h-px" style={{ background: `linear-gradient(to right, ${cfg.accent}50, transparent)` }} />
              </div>
            );
          })}
        </section>

        {/* ── ABOUT BANNER ─ */}
        <section
          className="rounded-3xl overflow-hidden relative"
          style={{ minHeight: 'clamp(200px, 28vw, 340px)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
            alt="Supporting Artisans"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(127,169,155,0.92) 0%, rgba(127,169,155,0.78) 100%)' }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 py-12">
            <h2 className="text-white font-bold mb-3" style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
              Supporting Indian Artisans
            </h2>
            <p className="text-white opacity-90 mb-7 max-w-xl text-sm sm:text-base">
              Every purchase helps preserve traditional crafts and provides sustainable livelihoods
              to artisan communities across India.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/artisans"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--rust-red)' }}
              >
                Meet Our Artisans <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 rounded-full font-semibold text-sm border-2 border-white text-white hover:bg-white hover:text-gray-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}