import { ShoppingCart, Menu, X, User, Heart, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import logoImage from '../assets/6894975ff7bda70b68315fd77903bff02141295f.png';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
}

export function Header({ cartCount, wishlistCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser, logout } = useAppContext();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isActive = (path: string) => location.pathname === path;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      // Not signed in → go to auth page (signup mode by default)
      navigate('/auth');
    } else {
      setProfileOpen(prev => !prev);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 gap-2">
            <img 
              src={logoImage}
              alt="Kalakart Logo"
              className="h-10"
            />
            <span 
              className="font-bold text-2xl"
              style={{ 
                color: 'var(--rust-red)',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.05em'
              }}
            >
              KALAKART
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form className="relative w-full" onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for handicrafts, artisans..."
                className="w-full px-4 py-3 pr-12 rounded-full border-2 focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--dark-brown)',
                  backgroundColor: 'white'
                }}
              />
              <button 
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:opacity-70 transition-opacity"
                style={{ backgroundColor: 'var(--cream-bg)' }}
              >
                <Search className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
              </button>
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User / Profile Icon */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={handleProfileClick}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity relative"
                style={{ backgroundColor: '#F4C95D' }}
                aria-label={isLoggedIn ? 'Profile menu' : 'Sign in'}
                title={isLoggedIn ? currentUser?.name : 'Sign up / Login'}
              >
                {isLoggedIn && currentUser ? (
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--dark-brown)' }}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />
                )}
              </button>

              {/* Profile Dropdown (only when logged in) */}
              {isLoggedIn && profileOpen && (
                <div
                  className="absolute right-0 top-14 w-52 rounded-xl shadow-lg overflow-hidden z-50"
                  style={{ backgroundColor: '#FFFDF8', border: '1.5px solid var(--beige)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--beige)' }}>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--dark-brown)' }}>
                      {currentUser?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-gray)' }}>
                      {currentUser?.email}
                    </p>
                    <span
                      className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: currentUser?.role === 'seller' ? 'rgba(180,140,90,0.15)' : 'rgba(74,140,74,0.1)',
                        color: currentUser?.role === 'seller' ? 'var(--saffron)' : '#4A8C4A',
                      }}
                    >
                      {currentUser?.role === 'seller' ? 'Artisan / Seller' : 'Buyer'}
                    </span>
                  </div>

                  {/* Dashboard link (sellers only) */}
                  {currentUser?.role === 'seller' && (
                    <Link
                      to="/seller-dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-amber-50 transition-colors"
                      style={{ color: 'var(--dark-brown)' }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Artisan Dashboard
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 transition-colors"
                    style={{ color: '#C03030' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--dark-brown)' }}>
              <Heart className="w-6 h-6 text-white" />
              {wishlistCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: '#D77A3F' }}>
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form className="relative w-full" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 pr-10 rounded-full border-2 focus:outline-none"
              style={{ 
                borderColor: 'var(--dark-brown)',
                backgroundColor: 'white'
              }}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`py-2 transition-colors ${isActive('/') ? 'font-semibold' : ''}`}
                style={{ color: isActive('/') ? 'var(--rust-red)' : 'var(--text-dark)' }}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`py-2 transition-colors ${isActive('/shop') ? 'font-semibold' : ''}`}
                style={{ color: isActive('/shop') ? 'var(--rust-red)' : 'var(--text-dark)' }}
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/artisans" 
                className={`py-2 transition-colors ${isActive('/artisans') ? 'font-semibold' : ''}`}
                style={{ color: isActive('/artisans') ? 'var(--rust-red)' : 'var(--text-dark)' }}
                onClick={() => setMenuOpen(false)}
              >
                Artisans
              </Link>
              <Link 
                to="/about" 
                className={`py-2 transition-colors ${isActive('/about') ? 'font-semibold' : ''}`}
                style={{ color: isActive('/about') ? 'var(--rust-red)' : 'var(--text-dark)' }}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              {isLoggedIn && currentUser?.role === 'seller' && (
                <Link 
                  to="/seller-dashboard" 
                  className={`py-2 transition-colors ${isActive('/seller-dashboard') ? 'font-semibold' : ''}`}
                  style={{ color: isActive('/seller-dashboard') ? 'var(--rust-red)' : 'var(--text-dark)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Artisan Dashboard
                </Link>
              )}
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="py-2 text-left transition-colors"
                  style={{ color: '#C03030' }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="py-2 transition-colors font-semibold"
                  style={{ color: 'var(--rust-red)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up / Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}