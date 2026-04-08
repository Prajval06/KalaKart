import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUpRight, Send, ChevronUp } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const quickLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Meet Our Artisans', to: '/artisans' },
    { label: 'About Us', to: '/about' },
    { label: 'Your Cart', to: '/cart' },
    { label: 'Wishlist', to: '/wishlist' },
  ];

  const categories = [
    'Pottery & Ceramics',
    'Textiles & Fabrics',
    'Jewelry',
    'Home Decor',
    'Art & Paintings',
  ];

  const categoryToPath = (category: string) => `/category/${encodeURIComponent(category)}`;

  const handleNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isEmail) {
      setStatus('error');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('kk_newsletter_subscribers') || '[]') as string[];
    const next = Array.from(new Set([...existing, trimmed.toLowerCase()]));
    localStorage.setItem('kk_newsletter_subscribers', JSON.stringify(next));

    setStatus('success');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="mt-16 border-t-2"
      style={{
        borderTopColor: 'var(--sage-green)',
        backgroundColor: 'var(--cream-bg)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl p-6 sm:p-8 lg:p-10"
          style={{
            background: 'linear-gradient(140deg, rgba(180,140,90,0.12) 0%, rgba(198,210,172,0.28) 45%, rgba(255,255,255,0.96) 100%)',
            border: '1px solid rgba(145, 128, 97, 0.2)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="font-bold text-xl"
                  style={{
                    color: 'var(--rust-red)',
                    fontFamily: 'Cinzel, Georgia, serif',
                    letterSpacing: '0.06em',
                  }}
                >
                  KALAKART
                </span>
              </div>
              <p className="text-sm leading-6" style={{ color: 'var(--text-gray)' }}>
                Celebrating India&apos;s rich heritage through authentic handcrafted products made by local artisans.
              </p>

              <button
                type="button"
                onClick={scrollToTop}
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--sage-green)', color: 'var(--dark-brown)', backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                Back to top <ChevronUp className="w-3 h-3" />
              </button>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                Shop by Category
              </h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      to={categoryToPath(category)}
                      className="text-sm hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                Contact & Updates
              </h3>
              <ul className="space-y-3 mb-5">
                <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-gray)' }}>
                  <Mail className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
                  <a href="mailto:hello@kalakart.in" className="hover:opacity-75 transition-opacity">hello@kalakart.in</a>
                </li>
                <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-gray)' }}>
                  <Phone className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
                  <a href="tel:+919876543210" className="hover:opacity-75 transition-opacity">+91 98765 43210</a>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-gray)' }}>
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'var(--rust-red)' }} />
                  <a
                    href="https://maps.google.com/?q=Mumbai+Maharashtra+India"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-75 transition-opacity"
                  >
                    Mumbai, Maharashtra, India
                  </a>
                </li>
              </ul>

              <form onSubmit={handleNewsletter} className="space-y-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--dark-brown)' }}>
                  Newsletter
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder="Enter your email"
                    className="w-full text-sm rounded-lg px-3 py-2 border"
                    style={{ borderColor: 'var(--beige)', backgroundColor: 'white', color: 'var(--dark-brown)' }}
                  />
                  <button
                    type="submit"
                    className="px-3 rounded-lg text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--saffron)' }}
                    aria-label="Subscribe to newsletter"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {status === 'success' && (
                  <p className="text-xs" style={{ color: '#2F7A3D' }}>
                    You are subscribed. We&apos;ll share artisan stories and new drops.
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-xs" style={{ color: '#B43232' }}>
                    Please enter a valid email address.
                  </p>
                )}
              </form>

              <div className="flex gap-3 mt-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ backgroundColor: 'var(--sage-green)' }}
                  aria-label="KalaKart on Facebook"
                >
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ backgroundColor: 'var(--sage-green)' }}
                  aria-label="KalaKart on Instagram"
                >
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ backgroundColor: 'var(--sage-green)' }}
                  aria-label="KalaKart on Twitter"
                >
                  <Twitter className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTopColor: 'rgba(145, 128, 97, 0.28)' }}>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
              Copyright 2026 KALAKART. Crafted with love for Indian heritage.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-gray)' }}>
              <Link to="/about" className="hover:opacity-75 transition-opacity">About</Link>
              <Link to="/shop" className="hover:opacity-75 transition-opacity">Shop</Link>
              <Link to="/artisans" className="hover:opacity-75 transition-opacity">Artisans</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}