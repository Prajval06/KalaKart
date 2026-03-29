import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ShoppingCart, Heart, MapPin, Award, ArrowRight,
  Clock, User, ChevronDown, ChevronUp,
  Shield, Star, X, BadgeCheck, Sparkles, Truck,
} from 'lucide-react';
import { products } from '../data/products';
import { artisans } from '../data/artisans';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import { getProductStory } from '../data/productStories';
import { calculateShipping, type DeliveryZone, ZONE_LABELS } from '../utils/shipping';

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
        onClick={e => e.stopPropagation()}
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
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>KalaKart Authenticity Programme</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: <MapPin className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Location Verified',
              desc: 'Artisan\'s workshop address physically verified by our field team.',
            },
            {
              icon: <Award className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Craft Authenticity',
              desc: 'Products inspected and certified as 100% handcrafted — no machine involvement.',
            },
            {
              icon: <User className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Identity & KYC',
              desc: 'Government-issued ID collected and verified during on-boarding.',
            },
            {
              icon: <Star className="w-5 h-5" style={{ color: 'var(--saffron)' }} />,
              title: 'Quality Review',
              desc: 'Each batch inspected for finish, cultural accuracy, and fair pricing.',
            },
          ].map(item => (
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
          This artisan's products carry the KalaKart Seal of Authenticity
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────────── */
export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlistItems } = useAppContext();

  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [pricingOpen, setPricingOpen]             = useState(false);
  const [zone, setZone]                           = useState<DeliveryZone>('regional');

  const product = products.find(p => p.id === id);
  const artisan = product ? artisans.find(a => a.id === product.artisanId) : null;

  if (!product) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <h2 className="mb-4">Product not found</h2>
        <Link
          to="/"
          className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--saffron)' }}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistItems.includes(product.id);
  const story = getProductStory(product, artisan);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: product.category, href: `/category/${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      {/* ══════════════ SECTION 1: Product Image + Purchase Info ══════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Left: Product Image ── */}
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Wishlist button */}
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
                {/* Authenticity ribbon */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center gap-2"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}
                >
                  <Shield className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-white text-sm">100% Handmade or Money Back Guarantee</span>
                </div>
              </div>

              {/* Proof-of-craft artisan thumbnail strip */}
              {artisan && (
                <div
                  className="mt-4 p-4 rounded-xl flex items-center gap-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid var(--beige)' }}
                >
                  <img
                    src={artisan.image}
                    alt={`${artisan.name} — artisan at work`}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2"
                    style={{ borderColor: 'var(--saffron)' }}
                  />
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-gray)' }}>Proof of Craft — Artisan at Work</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--dark-brown)' }}>{artisan.name}</p>
                    <p className="text-xs" style={{ color: 'var(--saffron)' }}>{artisan.specialization}</p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(74,140,74,0.1)', color: '#4A8C4A' }}
                    >
                      ✔ Verified
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Purchase Info ── */}
            <div className="flex flex-col">

              {/* Verified Artisan Badge */}
              <button
                onClick={() => setShowVerifiedModal(true)}
                className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(74,140,74,0.1)', border: '1px solid rgba(74,140,74,0.25)' }}
              >
                <BadgeCheck className="w-4 h-4" style={{ color: '#4A8C4A' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A8C4A' }}>✔ Verified Artisan Product</span>
                <span className="text-xs" style={{ color: '#4A8C4A', opacity: 0.7 }}>— tap to learn more</span>
              </button>

              {/* Category pill */}
              <div
                className="self-start px-3 py-1 rounded-full text-sm mb-3"
                style={{ backgroundColor: 'var(--cream)', color: 'var(--saffron)' }}
              >
                {product.category}
              </div>

              {/* Product Title */}
              <h1 className="mb-3" style={{ color: 'var(--dark-brown)' }}>{product.name}</h1>

              {/* Price */}
              <p className="mb-6" style={{ color: 'var(--saffron)', fontSize: '2rem', fontWeight: 700 }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              {/* ── Artisan Identity Card ── */}
              {artisan ? (
                <Link
                  to={`/artisan/${artisan.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl mb-6 hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#FFFDF8', border: '1.5px solid var(--beige)' }}
                >
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    style={{ outline: '2px solid var(--saffron)', outlineOffset: 2 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-gray)' }}>Made by</p>
                    <p className="font-semibold truncate" style={{ color: 'var(--dark-brown)' }}>{artisan.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                      {story.artisanCity} &nbsp;·&nbsp; {artisan.yearsOfExperience} years experience
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--saffron)' }} />
                </Link>
              ) : (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-6"
                  style={{ backgroundColor: '#FFFDF8', border: '1.5px solid var(--beige)' }}
                >
                  <User className="w-8 h-8" style={{ color: 'var(--saffron)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-gray)' }}>Made by</p>
                    <p className="font-semibold" style={{ color: 'var(--dark-brown)' }}>{product.artisan}</p>
                  </div>
                </div>
              )}

              {/* Origin Verification */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 self-start"
                style={{ backgroundColor: 'rgba(180,140,90,0.08)', border: '1px solid rgba(180,140,90,0.2)' }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--saffron)' }} />
                <span className="text-sm" style={{ color: 'var(--dark-brown)' }}>
                  Sourced directly from: <strong>{story.artisanCity}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => addToCart(product.id, product.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--saffron)' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Authenticity Guarantee strip */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(74,140,74,0.07)', border: '1px solid rgba(74,140,74,0.2)' }}
              >
                <Shield className="w-5 h-5 flex-shrink-0" style={{ color: '#4A8C4A' }} />
                <p className="text-sm" style={{ color: '#4A8C4A' }}>
                  <strong>100% Handmade or Money Back Guarantee</strong> — if this product was machine-made, we'll refund in full.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 2: Story Layer ════════════════════════════════ */}
      <section
        className="py-14 px-4"
        style={{ background: 'linear-gradient(135deg, #FDF6EC 0%, #FFF9F2 60%, #F9F3E8 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Decorative top element */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(180,140,90,0.3)' }} />
            <Sparkles className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <span className="text-sm tracking-widest uppercase" style={{ color: 'var(--saffron)' }}>The Story Behind This Piece</span>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(180,140,90,0.3)' }} />
          </div>

          {/* Emotional Title */}
          <h2
            className="text-center mb-6 leading-snug"
            style={{ color: 'var(--dark-brown)', maxWidth: 700, margin: '0 auto 1.5rem' }}
          >
            {story.emotionalTitle}
          </h2>

          {/* Narrative */}
          <p
            className="text-center leading-relaxed mb-10"
            style={{ color: 'var(--text-dark)', maxWidth: 680, margin: '0 auto 2.5rem', fontSize: '1.05rem' }}
          >
            {story.narrative}
          </p>

          {/* Effort & Time Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Clock className="w-6 h-6" />, label: story.effortMetrics.timeToMake, sub: 'Time to Make' },
              { icon: <User className="w-6 h-6" />, label: story.effortMetrics.generationsCrafted, sub: 'Heritage' },
              { icon: <Award className="w-6 h-6" />, label: story.effortMetrics.technique, sub: 'Technique' },
            ].map(item => (
              <div
                key={item.sub}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--beige)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(180,140,90,0.1)', color: 'var(--saffron)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--dark-brown)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-gray)' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cultural Context Tags */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { emoji: '📍', label: `Origin: ${story.culturalTags.origin}` },
              { emoji: '🪡', label: `Craft Type: ${story.culturalTags.craftType}` },
              { emoji: '🎉', label: `Occasion: ${story.culturalTags.occasion}` },
            ].map(tag => (
              <span
                key={tag.label}
                className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: '#FFFDF8', border: '1.5px solid var(--beige)', color: 'var(--dark-brown)' }}
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

    

      {/* ══════════════ SECTION 4: Transparent Pricing ════════════════════════ */}
      <section
        className="py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #FDF6EC, #FFF9F2)' }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setPricingOpen(v => !v)}
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
              : <ChevronDown className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            }
          </button>

          {pricingOpen && (() => {
            const shipping    = calculateShipping(product.category, product.price, zone);
            const total       = product.price + shipping;
            const artisanPct  = Math.round((story.pricingBreakdown.artisanEarns / product.price) * 100);
            const platformPct = 100 - artisanPct;

            return (
              <div
                className="mt-2 p-6 rounded-2xl"
                style={{ backgroundColor: 'white', border: '1.5px solid var(--beige)' }}
              >
                {/* ── Zone Selector ── */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--dark-brown)' }}>
                    <Truck className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                    Delivery Location
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(ZONE_LABELS) as DeliveryZone[]).map(z => (
                      <button
                        key={z}
                        onClick={() => setZone(z)}
                        className="px-3 py-1.5 rounded-full text-sm transition-all"
                        style={
                          zone === z
                            ? { backgroundColor: 'var(--saffron)', color: 'white', fontWeight: 600 }
                            : { backgroundColor: 'var(--beige)', color: 'var(--dark-brown)', border: '1px solid transparent' }
                        }
                      >
                        {ZONE_LABELS[z]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-gray)' }}>
                    Shipping cost varies based on product type and delivery location
                  </p>
                </div>

                {/* ── Price Summary ── */}
                <div
                  className="rounded-xl p-4 mb-6 space-y-2"
                  style={{ backgroundColor: 'var(--cream)' }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>Product Price</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>🚚 Shipping ({ZONE_LABELS[zone]})</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: 'var(--beige)' }} />
                  <div className="flex justify-between">
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>Total Payable</span>
                    <span style={{ color: 'var(--saffron)', fontWeight: 700, fontSize: '1.1rem' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* ── Breakdown Bars ── */}
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-gray)' }}>
                  Breakdown of Base Price
                </p>
                <div className="space-y-4 mb-5">
                  {[
                    {
                      emoji: '🧑‍🎨',
                      label: 'Artisan Earnings',
                      amount: story.pricingBreakdown.artisanEarns,
                      pct: artisanPct,
                      color: '#4A8C4A',
                      note: `Goes directly to ${product.artisan}`,
                    },
                    {
                      emoji: '🏪',
                      label: 'Platform Fee (10%)',
                      amount: story.pricingBreakdown.platformFee,
                      pct: platformPct,
                      color: 'var(--saffron)',
                      note: '10% platform fee helps us operate and support artisans',
                    },
                    {
                      emoji: '🚚',
                      label: `Shipping Cost`,
                      amount: shipping,
                      pct: null,     // shipping is separate — no bar
                      color: 'var(--rust-red)',
                      note: `Calculated for ${ZONE_LABELS[zone]} delivery`,
                    },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--dark-brown)' }}>
                          {row.emoji} {row.label}
                        </span>
                        <span className="text-sm font-bold" style={{ color: row.color }}>
                          ₹{row.amount.toLocaleString('en-IN')}
                          {row.pct !== null && (
                            <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-gray)' }}>({row.pct}%)</span>
                          )}
                        </span>
                      </div>
                      {row.pct !== null && (
                        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--beige)' }}>
                          <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                            style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          />
                        </div>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>{row.note}</p>
                    </div>
                  ))}
                </div>

                {/* ── UX rule confirmation ── */}
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{ backgroundColor: 'rgba(74,140,74,0.07)', color: '#4A8C4A' }}
                >
                  ✔ Artisan Earnings + Platform Fee = ₹{product.price.toLocaleString('en-IN')} (base price) · Shipping shown separately
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══════════════ SECTION 5: Related Products ═══════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="py-14 px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--rust-red)' }} />
              <h2 style={{ color: 'var(--dark-brown)' }}>More from {product.category}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <Link
                  key={rp.id}
                  to={`/product/${rp.id}`}
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

      {/* Verified Artisan Modal */}
      {showVerifiedModal && (
        <VerifiedModal onClose={() => setShowVerifiedModal(false)} />
      )}
    </div>
  );
}