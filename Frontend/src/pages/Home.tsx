import { Link } from 'react-router';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { ImageWithFallback } from '../components/ImageWithFallback';

const HOME_CATEGORY_ORDER = [
  'Pottery & Ceramics',
  'Jewelry',
  'Art & Paintings',
  'Clothing',
  'Textiles & Fabrics',
  'Home Decor',
  'Crafts & Weaving',
];

const HOME_CATEGORY_META: Record<string, { emoji: string; accent: string; label: string }> = {
  'Pottery & Ceramics': { emoji: '🏺', accent: '#4B8B6F', label: 'Pottery & Ceramics' },
  Jewelry: { emoji: '💎', accent: '#B5851A', label: 'Jewelry' },
  'Art & Paintings': { emoji: '🎨', accent: '#7C3D12', label: 'Art & Paintings' },
  Clothing: { emoji: '👗', accent: '#9B2335', label: 'Clothing' },
  'Textiles & Fabrics': { emoji: '🧵', accent: '#6B4E8A', label: 'Textiles & Fabrics' },
  'Home Decor': { emoji: '🏮', accent: '#8B4513', label: 'Home Decor' },
  'Crafts & Weaving': { emoji: '🧶', accent: '#5A7A2E', label: 'Crafts & Weaving' },
};

export default function Home() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { getDbProducts } = useAppContext();
  const dbProducts = getDbProducts();
  const featuredProducts = useMemo(
    () => [...dbProducts].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
    [dbProducts]
  );

  const productsByCategory = useMemo(() => {
    return HOME_CATEGORY_ORDER.reduce<Record<string, typeof dbProducts>>((acc, category) => {
      acc[category] = dbProducts
        .filter((product) => product.category === category)
        .sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {} as Record<string, typeof dbProducts>);
  }, [dbProducts]);

  // Artisan carousel slides with artisan profiles
  const artisanSlides = [
    {
      id: 1,
      artisanId: '1',
      image: 'https://images.unsplash.com/photo-1764344814985-83e326ba7e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMHBhaW50aW5nJTIwZm9sayUyMGFydHxlbnwxfHx8fDE3NzE5NDk3MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Ramesh Kumar',
      region: 'Gujarat, India',
      craft: 'Terracotta & Blue Pottery',
      description: 'Third-generation potter crafting timeless terracotta and blue pottery',
      tagline: 'Shaped by Hands, Fired by Tradition'
    },
    {
      id: 2,
      artisanId: '3',
      image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGpld2Vscnl8ZW58MXx8fHwxNzcxMTY2NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Lakshmi Sharma',
      region: 'Jaipur, Rajasthan',
      craft: 'Kundan & Meenakari Jewelry',
      description: 'Exquisite Kundan jewelry crafted with semi-precious stones and enamel',
      tagline: 'The Royal Art of Jaipur'
    },
    {
      id: 3,
      artisanId: '2',
      image: 'https://images.unsplash.com/photo-1547702128-e8e44b310045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYW5hcmFzaSUyMHNpbGslMjBzYXJlZSUyMHdlYXZpbmd8ZW58MXx8fHwxNzcxOTQ5NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Meera Devi',
      region: 'Rajasthan, India',
      craft: 'Block Printing & Natural Dyes',
      description: 'Master of traditional block printing with natural vegetable dyes',
      tagline: 'Colours of the Earth'
    },
    {
      id: 4,
      artisanId: '4',
      image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnQlMjBwYWludGluZyUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTE2Njc4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Anjali Patel',
      region: 'Maharashtra, India',
      craft: 'Miniature & Mandala Paintings',
      description: 'Contemporary artist fusing ancient miniature techniques with mandala art',
      tagline: 'Stories in Monochrome'
    },
    {
      id: 5,
      artisanId: '6',
      image: 'https://images.unsplash.com/photo-1627726997943-6e397135f78a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXNobWluYSUyMEthc2htaXIlMjBzaGF3bCUyMGhhbmRpY3JhZnR8ZW58MXx8fHwxNzcxOTQ5NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Priya Singh',
      region: 'Assam, India',
      craft: 'Natural Fiber Weaving',
      description: 'Traditional basket weaver using indigenous techniques and natural materials',
      tagline: 'Woven with Nature'
    },
    {
      id: 6,
      artisanId: '7',
      image: 'https://images.unsplash.com/photo-1765443254299-eb5f69ab85a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFzcyUyMHNjdWxwdHVyZSUyMEluZGlhbiUyMG1ldGFsJTIwY3JhZnR8ZW58MXx8fHwxNzcxOTQ5NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      artisanName: 'Vikram Joshi',
      region: 'Uttar Pradesh, India',
      craft: 'Brass & Metal Sculpture',
      description: 'Fourth-generation brass artisan creating sacred and decorative metalwork',
      tagline: 'Divine Craftsmanship in Metal'
    }
  ];
  
  const categories = [
    {
      name: 'Pottery & Ceramics',
      emoji: '🏺',
      image: 'https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBwb3R0ZXJ5JTIwY2VyYW1pY3MlMjBjcmFmdHxlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Textiles & Fabrics',
      emoji: '🧵',
      image: 'https://images.unsplash.com/photo-1759738096144-b43206226765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZXh0aWxlJTIwZmFicmljJTIwd2VhdmluZ3xlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Jewelry',
      emoji: '💍',
      image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGpld2Vscnl8ZW58MXx8fHwxNzcxMTY2NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Art & Paintings',
      emoji: '🎨',
      image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnQlMjBwYWludGluZyUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTE2Njc4Mnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Home Decor',
      emoji: '🏮',
      image: 'https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBob21lJTIwZGVjb3IlMjBoYW5kaWNyYWZ0c3xlbnwxfHx8fDE3NzExNjY3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Crafts & Weaving',
      emoji: '🧺',
      image: 'https://images.unsplash.com/photo-1768902406144-a348c559c73c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBiYW1ib28lMjBjYW5lJTIwd2VhdmluZyUyMGJhc2tldCUyMGNyYWZ0JTIwaGFuZG1hZGV8ZW58MXx8fHwxNzczOTA0NDk2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
  ];



  const nextSlide = () => {
    setCurrentSlide((prev: number) => (prev + 1) % artisanSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev: number) => (prev - 1 + artisanSlides.length) % artisanSlides.length);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Side Banner */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Main Hero Slider */}
          <div className="rounded-3xl overflow-hidden relative min-h-[400px] hero-slider">
            <div className="absolute inset-0 w-full h-full">
              <ImageWithFallback 
                src={artisanSlides[currentSlide].image}
                alt={artisanSlides[currentSlide].artisanName}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ height: '400px' }}
              />
              <div 
                className="absolute inset-0"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(127, 169, 155, 0.9) 0%, rgba(127, 169, 155, 0.7) 100%)'
                }}
              />
              <div className="relative z-10 p-12 flex flex-col justify-center" style={{ height: '400px' }}>
                <div className="mb-4">
                  <p className="text-white text-sm uppercase tracking-wider mb-2 opacity-80">
                    {artisanSlides[currentSlide].tagline}
                  </p>
                  <h1 className="text-white mb-2" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                    {artisanSlides[currentSlide].craft}
                  </h1>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-white" />
                    <p className="text-white text-lg font-medium">
                      Crafted by {artisanSlides[currentSlide].artisanName}
                    </p>
                  </div>
                  <p className="text-white text-base opacity-90 ml-7">
                    {artisanSlides[currentSlide].region}
                  </p>
                  <p className="text-white text-base mt-2 max-w-2xl opacity-90 ml-7">
                    {artisanSlides[currentSlide].description}
                  </p>
                </div>
                
                <Link
                  to={`/artisan/${artisanSlides[currentSlide].artisanId}`}
                  className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity self-start"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  {t('home.visitStore')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            
            {/* Arrow Controls & Dot Indicators */}
            <div className="absolute bottom-6 left-0 right-0 px-8">
              <div className="flex items-center justify-between">
                {/* Left Arrow */}
                <button
                  className="bg-white text-gray-800 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg z-20"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Dot Indicators */}
                <div className="flex gap-2">
                  {artisanSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: currentSlide === index ? '32px' : '10px',
                        height: '10px',
                        backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)'
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Right Arrow */}
                <button
                  className="bg-white text-gray-800 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg z-20"
                  onClick={nextSlide}
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="mb-6" style={{ color: 'var(--dark-brown)' }}>{t('home.shopByCategory')}</h2>
          {/* Horizontal scrollable row — all 6 cards in one line */}
          <div className="flex flex-row gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--saffron) var(--beige)' }}>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/category/${encodeURIComponent(category.name)}`}
                className="flex-shrink-0 rounded-2xl overflow-hidden relative hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                style={{ width: '180px', height: '200px' }}
              >
                <ImageWithFallback
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(70,30,10,0.82) 0%, rgba(70,30,10,0.35) 55%, rgba(70,30,10,0.05) 100%)'
                  }}
                />
                {/* Hover shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(139,37,0,0.18) 100%)' }}
                />
                {/* Card content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 px-2 text-center">
                  <span className="text-2xl mb-2 drop-shadow">{category.emoji}</span>
                  <h3
                    className="font-semibold leading-tight drop-shadow-md"
                    style={{ color: 'white', fontSize: '0.9rem' }}
                  >
                    {category.name}
                  </h3>
                  <span
                    className="mt-2 text-xs px-3 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: 'var(--saffron)', color: 'white' }}
                  >
                    {t('home.exploreArrow')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Product Showcase */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 style={{ color: 'var(--dark-brown)' }}>{t('home.featuredCatalog')}</h2>
              <p className="text-sm mt-1" style={{ color: '#8B7765' }}>
                {t('home.catalogDesc')}
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: 'var(--rust-red)' }}
            >
              {t('home.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl p-8 bg-white text-center" style={{ border: '1px solid var(--beige)' }}>
              <p className="text-lg mb-2" style={{ color: 'var(--dark-brown)' }}>{t('home.noProductsYet')}</p>
              <p className="text-sm" style={{ color: '#8B7765' }}>
                {t('home.seedDatabase')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(80,34,14,0.72), transparent 60%)' }}
                    />
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: 'rgba(80,34,14,0.78)' }}
                    >
                      {product.category}
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className="line-clamp-2 mb-1"
                      style={{ color: 'var(--dark-brown)', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.35 }}
                    >
                      {product.name}
                    </p>
                    <p className="truncate mt-0.5" style={{ color: '#9B8B7A', fontSize: '0.7rem' }}>
                      {t('home.craftedBy')} {product.artisan}
                    </p>
                    <p style={{ color: 'var(--rust-red)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Mongo Product Showcase ── */}
        <div className="space-y-12 mb-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: 'var(--dark-brown)' }}>{t('home.productCatalog')}</h2>
              <p className="text-sm mt-1" style={{ color: '#8B7765' }}>
                {t('home.catalogFetch')}
              </p>
            </div>
          </div>

          {HOME_CATEGORY_ORDER.map((categoryName) => {
            const categoryProducts = productsByCategory[categoryName] || [];
            if (categoryProducts.length === 0) return null;
            const cfg = HOME_CATEGORY_META[categoryName];

            return (
              <div key={categoryName}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: cfg.accent }} />
                    <span className="text-2xl">{cfg.emoji}</span>
                    <h3 style={{ color: 'var(--dark-brown)' }}>{cfg.label}</h3>
                    <span
                      className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs text-white"
                      style={{ backgroundColor: cfg.accent, opacity: 0.85 }}
                    >
                      {categoryProducts.length} {t('home.items')}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="flex gap-4 overflow-x-auto pb-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: `${cfg.accent}40 transparent` }}
                  >
                    {categoryProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex-none w-40 sm:w-44 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                        style={{ backgroundColor: 'white' }}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `linear-gradient(to top, ${cfg.accent}cc, ${cfg.accent}22)` }}
                          />
                        </div>
                        <div className="px-3 py-2.5">
                          <p
                            className="line-clamp-2 mb-1"
                            style={{ color: 'var(--dark-brown)', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.35 }}
                          >
                            {product.name}
                          </p>
                          <p style={{ color: cfg.accent, fontSize: '0.75rem', fontWeight: 700 }}>
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                          <p className="truncate mt-0.5" style={{ color: '#9B8B7A', fontSize: '0.65rem' }}>
                            {t('home.craftedBy')} {product.artisan}
                          </p>
                        </div>
                      </Link>
                    ))}

                    <Link
                      to={`/category/${encodeURIComponent(categoryName)}`}
                      className="flex-none w-40 sm:w-44 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-dashed"
                      style={{ borderColor: `${cfg.accent}60`, minHeight: '200px', backgroundColor: `${cfg.accent}08` }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cfg.accent}20` }}>
                        <ArrowRight className="w-5 h-5" style={{ color: cfg.accent }} />
                      </div>
                      <p className="text-xs text-center px-4" style={{ color: cfg.accent, fontWeight: 600 }}>
                        {t('home.seeAllCategory', { category: cfg.label })}
                      </p>
                    </Link>
                  </div>

                  <div className="mt-2 h-px" style={{ background: `linear-gradient(to right, ${cfg.accent}40, transparent)` }} />
                </div>
              </div>
            );
          })}

          {dbProducts.length === 0 && (
            <div className="rounded-2xl p-8 bg-white text-center" style={{ border: '1px solid var(--beige)' }}>
              <p className="text-lg mb-2" style={{ color: 'var(--dark-brown)' }}>{t('home.noDbProducts')}</p>
              <p className="text-sm" style={{ color: '#8B7765' }}>
                {t('home.addProductsRefresh')}
              </p>
            </div>
          )}
        </div>

          <div className="text-center mt-4 md:hidden">
            <Link
              to="/artisans"
              className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--rust-red)' }}
            >
              {t('home.meetOurArtisans')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

        {/* About Section */}
        <div 
          className="mt-16 rounded-3xl overflow-hidden relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMGJhbm5lcnxlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Supporting Artisans"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(135deg, rgba(127, 169, 155, 0.9) 0%, rgba(127, 169, 155, 0.8) 100%)'
            }}
          />
          <div className="relative z-10 p-12 text-center">
            <h2 className="text-white mb-4">{t('home.supportTitle')}</h2>
            <p className="text-white text-lg mb-8 max-w-3xl mx-auto opacity-90">
              {t('home.supportDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/artisans"
                className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--rust-red)' }}
              >
                Meet Our Artisans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 rounded-full font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}