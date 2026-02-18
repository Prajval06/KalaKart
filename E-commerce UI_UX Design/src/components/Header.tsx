import { ShoppingCart, Menu, X, User, Heart, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
}

export function Header({ cartCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
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
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for handicrafts, artisans..."
                className="w-full px-4 py-3 pr-12 rounded-full border-2 focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--dark-brown)',
                  backgroundColor: 'white'
                }}
              />
              <button 
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:opacity-70 transition-opacity"
                style={{ backgroundColor: 'var(--cream-bg)' }}
              >
                <Search className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Icon */}
            <Link to="/auth" className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: '#F4C95D' }}>
              <User className="w-6 h-6" style={{ color: 'var(--dark-brown)' }} />
            </Link>
            
            {/* Wishlist Icon */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--dark-brown)' }}>
              <Heart className="w-6 h-6 text-white" />
            </button>
            
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
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 pr-10 rounded-full border-2 focus:outline-none"
              style={{ 
                borderColor: 'var(--dark-brown)',
                backgroundColor: 'white'
              }}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
            </button>
          </div>
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}