import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ShoppingCart, Heart, MapPin, Award,
  User, ChevronDown, ChevronUp,
  Shield, Star, X, BadgeCheck, Sparkles, Plus, Minus,
} from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ImageWithFallback, DEFAULT_FALLBACK_IMAGE } from '../components/ImageWithFallback';
import { useAppContext } from '../context/AppContext';
import { productService } from '../services/product.service';
import { useAutoRedirectOnNotFound } from '../hooks/useAutoRedirectOnNotFound';
import { useTranslation } from 'react-i18next';

/* ─────────────────────────── Verified Artisan Modal ─────────────────────── */
function VerifiedModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-7 shadow-2xl"
        style={{ backgroundColor: '#FFFDF8', border: '2px solid var(--beige)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(74,140,74,0.1)' }}
          >
            <BadgeCheck className="w-7 h-7" style={{ color: '#4A8C4A' }} />
          </div>
          <div>
            <h3 style={{ color: 'var(--dark-brown)' }}>Verified Artisan</h3>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
              KalaKart Authenticity Programme
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: <MapPin className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Location Verified',
              desc: 'Artisan workshop address physically verified by our field team.',
            },
            {
              icon: <Award className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Craft Authenticity',
              desc: 'Products inspected and certified as handcrafted.',
            },
            {
              icon: <User className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Identity & KYC',
              desc: 'Government-issued ID collected and verified during onboarding.',
            },
            {
              icon: <Star className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Quality Review',
              desc: 'Each batch inspected for finish, cultural accuracy, and fair pricing.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--dark-brown)' }}>{item.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 p-3 rounded-xl text-center text-sm"
          style={{ backgroundColor: 'rgba(74,140,74,0.08)', color: '#4A8C4A' }}
        >
          This artisan&apos;s products carry the KalaKart Seal of Authenticity
        </div>
      </div>
    </div>
  );
}

type UiProduct = {
  id: string;
  slug?: string | null;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image: string;
  images?: string[];
  artisan: string;
  artisanId?: string;
  state?: string;
  imageProvider?: string;
  imageAttribution?: {
    photographer?: string | null;
    photographerUsername?: string | null;
    photographerProfile?: string | null;
    photoPage?: string | null;
  } | null;
};

function normalizeProduct(raw: any): UiProduct {
  const p = raw?.product ?? raw ?? {};
  const canonicalId = p.id || p._id || '';
  return {
    id: canonicalId,
    slug: p.slug ?? null,
    name: p.name || 'Unnamed Product',
    description: p.description || '',
    price: Number(p.price || 0),
    category: typeof p.category === 'string' ? p.category : 'Craft',
    image: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || DEFAULT_FALLBACK_IMAGE,
    images: p.images || [],
    artisan: p.artisanName || p.artisan || 'KalaKart Artisan',
    artisanId: String(
      (typeof p.artisan_id === 'object'
        ? (p.artisan_id?.id || p.artisan_id?._id || String(p.artisan_id || ''))
        : p.artisan_id)
      || p.artisanId
      || ''
    ),
    state: p.state || 'India',
    imageProvider: p.imageProvider,
    imageAttribution: p.imageAttribution || null,
  };
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlistItems, getAllProducts } = useAppContext();
  const [selectedQty, setSelectedQty] = useState(1);

  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isNotFound } = useAutoRedirectOnNotFound({
    error,
    notFoundMessage: 'Product not found',
    redirectTo: '/shop',
    delayMs: 2000,
  });

  const isWishlisted = useMemo(
    () => (product ? wishlistItems.includes(product.id) : false),
    [wishlistItems, product]
  );

  const applyLocalFallback = (identifier: string) => {
    const localList = getAllProducts();
    const localMatch = localList.find((p: any) => {
      const pid = String(p?.id || '').trim();
      const pslug = String(p?.slug || '').trim();
      return pid === identifier || (!!pslug && pslug === identifier);
    });

    if (!localMatch) return false;

    const normalized = normalizeProduct(localMatch);
    if (!normalized.id) return false;

    setProduct(normalized);

    const normalizedList = localList.map(normalizeProduct);
    const related = normalizedList
      .filter((p: UiProduct) => p.category === normalized.category && p.id !== normalized.id)
      .slice(0, 4);

    setRelatedProducts(related);
    setError('');
    return true;
  };

  useEffect(() => {
    const run = async () => {
      const rawIdentifier = id || '';
      const identifier = decodeURIComponent(rawIdentifier).trim();

      if (!identifier) {
        setError('Product not found');
        setProduct(null);
        setLoading(false);
        return;
      }

      // Legacy/static cards still use numeric IDs (e.g. "4"); resolve locally first.
      if (/^\d+$/.test(identifier) && applyLocalFallback(identifier)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const detailRes = await productService.getProductByIdentifier(identifier);
        const detailRaw = detailRes?.data?.product ?? detailRes?.product ?? null;

        if (!detailRaw) {
          const resolved = applyLocalFallback(identifier);
          if (!resolved) {
            setError('Product not found');
            setProduct(null);
          }
          return;
        }

        const normalized = normalizeProduct(detailRaw);

        if (!normalized.id) {
          const resolved = applyLocalFallback(identifier);
          if (!resolved) {
            setError('Product not found');
            setProduct(null);
          }
          return;
        }

        setProduct(normalized);

        const listRes = await productService.getProducts({ per_page: 20 });
        const list = listRes?.data?.products ?? listRes?.products ?? [];
        const normalizedList = list.map(normalizeProduct);

        const related = normalizedList
          .filter((p: UiProduct) => p.category === normalized.category && p.id !== normalized.id)
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (e: any) {
        const status = e?.response?.status;
        const code = e?.response?.data?.code;
        const resolved = applyLocalFallback(identifier);

        if (resolved) {
          return;
        }

        if (status === 404 || code === 'PRODUCT_NOT_FOUND') {
          setError('Product not found');
        } else {
          setError('Failed to load product. Please try again.');
        }

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <h2 className="mb-4">Loading product...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <h2 className="mb-3">{error || 'Product not found'}</h2>

        {isNotFound && (
          <p className="mb-5" style={{ color: 'var(--text-gray)' }}>
            Redirecting you to Shop in 2 seconds...
          </p>
        )}

        <Link
          to="/shop"
          className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--saffron)' }}
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: product.category || 'Craft', href: `/category/${encodeURIComponent(product.category || 'craft')}` },
          { label: product.name },
        ]}
      />

      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    className="w-5 h-5"
                    style={{ color: isWishlisted ? 'var(--rust-red)' : 'var(--text-gray)' }}
                    fill={isWishlisted ? 'var(--rust-red)' : 'none'}
                  />
                </button>
                <div
                  className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center gap-2"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}
                >
                  <Shield className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-white text-sm">100% Handmade or Money Back Guarantee</span>
                </div>
              </div>
              {product.imageAttribution?.photographer && (
                <p className="mt-2 text-xs" style={{ color: 'var(--text-gray)' }}>
                  Photo: {product.imageAttribution.photoPage ? (
                    <a
                      href={product.imageAttribution.photoPage}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                      style={{ color: 'var(--saffron)' }}
                    >
                      {product.imageAttribution.photographer}
                    </a>
                  ) : (
                    product.imageAttribution.photographer
                  )}
                  {product.imageProvider ? ` via ${product.imageProvider}` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <button
                onClick={() => setShowVerifiedModal(true)}
                className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(74,140,74,0.1)', border: '1px solid rgba(74,140,74,0.25)' }}
              >
                <BadgeCheck className="w-4 h-4" style={{ color: '#4A8C4A' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A8C4A' }}>✔ {t('productDetail.verifiedArtisanProduct')}</span>
              </button>

              <div
                className="self-start px-3 py-1 rounded-full text-sm mb-3"
                style={{ backgroundColor: 'var(--cream)', color: 'var(--saffron)' }}
              >
                {product.category || 'Craft'}
              </div>

              <h1 className="mb-3" style={{ color: 'var(--dark-brown)' }}>{product.name}</h1>

              <p className="mb-6" style={{ color: 'var(--saffron)', fontSize: '2rem', fontWeight: 700 }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-6"
                style={{ backgroundColor: '#FFFDF8', border: '1.5px solid var(--beige)' }}
              >
                <User className="w-8 h-8" style={{ color: 'var(--saffron)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-gray)' }}>{t('productDetail.madeBy')}</p>
                  {product.artisanId ? (
                    <Link
                      to={`/artisan/${encodeURIComponent(product.artisanId)}`}
                      className="font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--dark-brown)' }}
                    >
                      {product.artisan}
                    </Link>
                  ) : (
                    <p className="font-semibold" style={{ color: 'var(--dark-brown)' }}>{product.artisan}</p>
                  )}
                </div>
              </div>

              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 self-start"
                style={{ backgroundColor: 'rgba(180,140,90,0.08)', border: '1px solid rgba(180,140,90,0.2)' }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--saffron)' }} />
                <span className="text-sm" style={{ color: 'var(--dark-brown)' }}>
                  {t('productDetail.sourcedFrom')} <strong>{product.state || 'India'}</strong>
                </span>
              </div>

              <div className="flex gap-3 mb-6">
                <div className="flex items-center gap-2 px-2 rounded-xl" style={{ border: '1px solid var(--beige)', backgroundColor: 'white' }}>
                  <button
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold" style={{ color: 'var(--dark-brown)' }}>{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty((q) => q + 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart(product.id, product.name, selectedQty)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--saffron)' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('productDetail.addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {product.description && (
        <section
          className="py-14 px-4"
          style={{ background: 'linear-gradient(135deg, #FDF6EC 0%, #FFF9F2 60%, #F9F3E8 100%)' }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(180,140,90,0.3)' }} />
              <Sparkles className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
              <span className="text-sm tracking-widest uppercase" style={{ color: 'var(--saffron)' }}>{t('productDetail.aboutThisProduct')}</span>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(180,140,90,0.3)' }} />
            </div>

            <p
              className="text-center leading-relaxed"
              style={{ color: 'var(--text-dark)', maxWidth: 680, margin: '0 auto', fontSize: '1.05rem' }}
            >
              {product.description}
            </p>
          </div>
        </section>
      )}

      <section className="py-10 px-4" style={{ background: 'linear-gradient(135deg, #FDF6EC, #FFF9F2)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setPricingOpen((v) => !v)}
            className="w-full flex items-center justify-between p-5 rounded-2xl hover:shadow-md transition-shadow"
            style={{ backgroundColor: 'white', border: '1.5px solid var(--beige)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(180,140,90,0.1)' }}
              >
                <span className="text-lg">💰</span>
              </div>
              <div className="text-left">
                <p className="font-semibold" style={{ color: 'var(--dark-brown)' }}>See where your money goes</p>
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Transparent pricing — no hidden costs</p>
              </div>
            </div>
            {pricingOpen
              ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
              : <ChevronDown className="w-5 h-5" style={{ color: 'var(--saffron)' }} />}
          </button>

          {pricingOpen && (() => {
            const platformFees = Math.round(product.price * 0.10);
            const artisanEarns = product.price - platformFees;
            const deliveryCharge = Math.round(product.price * 0.03);
            const total = product.price + deliveryCharge;

            return (
              <div className="mt-2 p-6 rounded-2xl" style={{ backgroundColor: 'white', border: '1.5px solid var(--beige)' }}>
                <div className="rounded-xl p-4 mb-6 space-y-2" style={{ backgroundColor: 'var(--cream)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>Product Price</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>Platform Fee (10%)</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{platformFees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>Artisan Earnings (90%)</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{artisanEarns.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>🚚 Delivery Charge (3%)</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{deliveryCharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: 'var(--beige)' }} />
                  <div className="flex justify-between">
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>Total Payable</span>
                    <span style={{ color: 'var(--saffron)', fontWeight: 700, fontSize: '1.1rem' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: 'rgba(74,140,74,0.07)', color: '#4A8C4A' }}>
                  ✔ Platform fee is deducted from product price (10%), artisan receives 90%, delivery is added separately (3%)
                </div>

                <p className="text-xs mt-3" style={{ color: 'var(--text-gray)' }}>
                  Base ₹{product.price.toLocaleString('en-IN')} = Artisan ₹{artisanEarns.toLocaleString('en-IN')} + Platform ₹{platformFees.toLocaleString('en-IN')} · Delivery ₹{deliveryCharge.toLocaleString('en-IN')}
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="py-14 px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--rust-red)' }} />
              <h2 style={{ color: 'var(--dark-brown)' }}>More from {product.category}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/product/${encodeURIComponent(rp.slug || rp.id || '')}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ border: '1px solid var(--beige)' }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>{rp.category}</p>
                    <h3 className="text-base mb-1 line-clamp-1" style={{ color: 'var(--dark-brown)' }}>{rp.name}</h3>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-gray)' }}>by {rp.artisan}</p>
                    <p className="font-semibold" style={{ color: 'var(--dark-brown)' }}>
                      ₹{rp.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {showVerifiedModal && <VerifiedModal onClose={() => setShowVerifiedModal(false)} />}
    </div>
  );
}