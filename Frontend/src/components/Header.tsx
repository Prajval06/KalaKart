import {
  ShoppingCart, Menu, X, User, Heart, Search,
  LogOut, LayoutDashboard,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { artisans } from '../data/artisans';

const logoImage =
  'https://raw.githubusercontent.com/Prajval06/KalaKart/refs/heads/main/Kalakart%20logo.png';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalize(s: string) {
  return s.toLowerCase().replace(/[&]/g, 'and');
}

interface Suggestion {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  type: 'product' | 'artisan';
}

function getSuggestions(query: string, allProducts: any[], limit = 6): Suggestion[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const results: Suggestion[] = [];

  for (const p of allProducts) {
    const hay = normalize([p.name, p.category, p.artisan, p.state].join(' '));
    if (results.length >= limit) break;
    if (hay.includes(q)) {
      results.push({
        id: `p-${p.id}`,
        label: p.name,
        sublabel: `${p.category} · ₹${p.price.toLocaleString('en-IN')}`,
        href: `/product/${p.id}`,
        type: 'product',
      });
    }
  }

  for (const a of artisans) {
    const hay = normalize([a.name, a.craft, a.state].join(' '));
    if (results.length >= limit) break;
    if (hay.includes(q)) {
      results.push({
        id: `a-${a.id}`,
        label: a.name,
        sublabel: `Artisan · ${a.craft}`,
        href: `/artisan/${a.id}`,
        type: 'artisan',
      });
    }
  }

  return results;
}

// ── Avatar component ──────────────────────────────────────────────────────────
function UserAvatar({ name, photoURL }: { name: string; photoURL?: string }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover rounded-full"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return <span className="text-sm font-bold text-[#4A2C2A] select-none">{initials}</span>;
}

// ── SearchBox ────────────────────────────────────────────────────────────────
function SearchBox({ mobile = false }: { mobile?: boolean }) {
  const { getAllProducts }       = useAppContext();
  const allProducts              = getAllProducts();
  const navigate                 = useNavigate();
  const [searchParams]           = useSearchParams();
  const [query, setQuery]        = useState(searchParams.get('q') ?? '');
  const [focused, setFocused]    = useState(false);
  const [activeIdx, setActiveIdx]= useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  // Keep input in sync when navigating with URL bar
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const suggestions = getSuggestions(query, allProducts);
  const showDropdown = focused && query.trim().length > 0 && suggestions.length > 0;

  const commitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setFocused(false);
      setActiveIdx(-1);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        navigate(suggestions[activeIdx].href);
        setFocused(false);
        setActiveIdx(-1);
      } else {
        commitSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setFocused(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        ref={inputRef}
        type="search"
        id={mobile ? 'search-mobile' : 'search-desktop'}
        value={query}
        onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={mobile ? 'Search...' : 'Search for handicrafts, artisans...'}
        autoComplete="off"
        className={`w-full ${mobile ? 'px-4 py-2 pr-10 text-sm' : 'px-4 py-3 pr-12'} rounded-full border-2 focus:outline-none focus:ring-2 transition-shadow`}
        style={{
          borderColor: focused ? 'var(--rust-red, #8B2500)' : 'var(--dark-brown, #5D4037)',
          backgroundColor: 'white',
          boxShadow: focused ? '0 0 0 3px rgba(139,37,0,0.08)' : undefined,
        }}
        aria-label="Search KalaKart"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
      />
      <button
        type="button"
        onClick={() => commitSearch(query)}
        className={`absolute ${mobile ? 'right-2 top-1/2 -translate-y-1/2' : 'right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:opacity-70'} transition-opacity`}
        style={mobile ? undefined : { backgroundColor: 'var(--cream-bg, #FFF8E7)' }}
        aria-label="Submit search"
      >
        <Search className={`${mobile ? 'w-5 h-5' : 'w-5 h-5'}`} style={{ color: 'var(--dark-brown, #5D4037)' }} />
      </button>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-[#DEB887] overflow-hidden z-50"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              role="option"
              aria-selected={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={e => {
                e.preventDefault();
                navigate(s.href);
                setFocused(false);
              }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[#DEB887]/30 last:border-0 transition-colors ${
                i === activeIdx ? 'bg-[#FFF0D0]' : 'hover:bg-[#FFF8E7]'
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.type === 'product' ? '#FEF3E2' : '#E8F5E9' }}
              >
                {s.type === 'product'
                  ? <Search size={13} className="text-[#8B2500]" />
                  : <User size={13} className="text-[#2E7D32]" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#4A2C2A] truncate">{s.label}</p>
                <p className="text-xs text-[#8B4513] truncate">{s.sublabel}</p>
              </div>
            </button>
          ))}
          {/* "See all results" footer */}
          <button
            onMouseDown={e => { e.preventDefault(); commitSearch(query); }}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#8B2500] bg-[#FFF8E7] hover:bg-[#FFF0D0] transition-colors flex items-center gap-2"
          >
            <Search size={12} />
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}

// ── Header component ──────────────────────────────────────────────────────────
export function Header({ cartCount, wishlistCount }: HeaderProps) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);
  const location                    = useLocation();
  const navigate                    = useNavigate();
  const { isLoggedIn, currentUser, logout } = useAppContext();

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 gap-2">
            <img src={logoImage} alt="KalaKart Logo" className="h-10" />
            <span
              className="font-bold text-2xl hidden sm:block"
              style={{ color: 'var(--rust-red)', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
            >
              KALAKART
            </span>
          </Link>

          {/* Search Bar – Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <SearchBox />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* User / Profile */}
            {isLoggedIn && currentUser ? (
              <div ref={dropdownRef} className="relative">
                <button
                  id="profile-avatar-btn"
                  onClick={() => setDropdown(v => !v)}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#8B2500] focus:ring-offset-1 overflow-hidden shadow-md border-2 border-[#DAA520]"
                  style={{ backgroundColor: '#F4C95D' }}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  <UserAvatar name={currentUser.name} photoURL={currentUser.photoURL} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border border-[#DEB887] overflow-hidden z-50"
                    style={{ backgroundColor: '#FFF8E7' }}
                  >
                    <div className="px-4 py-3 border-b border-[#DEB887]/60 bg-[#FFF0D0]">
                      <p className="text-xs text-[#8B4513] font-serif">Signed in as</p>
                      <p className="text-sm font-bold text-[#4A2C2A] truncate">{currentUser.name}</p>
                      <p className="text-xs text-[#8B4513] truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.userType === 'seller' && (
                      <button
                        id="go-to-dashboard"
                        onClick={() => { setDropdown(false); navigate('/seller-dashboard'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#4A2C2A] font-serif hover:bg-[#FFF0D0] transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-[#8B2500]" />
                        Dashboard
                      </button>
                    )}

                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C03030] font-serif hover:bg-red-50 transition-colors border-t border-[#DEB887]/40"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                id="profile-icon-btn"
                to="/auth"
                className="w-11 h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#F4C95D' }}
                aria-label="Sign in"
              >
                <User className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative w-11 h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--dark-brown)' }}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-white" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-11 h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#D77A3F' }}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle mobile menu"
            >
              {menuOpen
                ? <X className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />
                : <Menu className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBox mobile />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/artisans', label: 'Artisans' },
                { to: '/about', label: 'About' },
                ...(currentUser?.userType === 'seller'
                  ? [{ to: '/seller-dashboard', label: 'Seller Dashboard' }]
                  : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2 transition-colors ${isActive(to) ? 'font-semibold' : ''}`}
                  style={{ color: isActive(to) ? 'var(--rust-red)' : 'var(--text-dark)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="py-2 text-left font-semibold"
                  style={{ color: '#C03030' }}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="py-2 transition-colors"
                  style={{ color: 'var(--text-dark)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}