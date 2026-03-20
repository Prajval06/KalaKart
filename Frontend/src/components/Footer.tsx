import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-white border-t-2 mt-16" style={{ borderTopColor: 'var(--sage-green)', backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span 
                className="font-bold text-xl"
                style={{ 
                  color: 'var(--rust-red)',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '0.05em'
                }}
              >
                KARIGARKART
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
              Celebrating India's rich heritage through authentic handcrafted products by local artisans.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-gray)' }}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/artisans" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-gray)' }}>
                  Meet Our Artisans
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-gray)' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-gray)' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              Categories
            </h3>
            <ul className="space-y-2">
              <li className="text-sm" style={{ color: 'var(--text-gray)' }}>Pottery & Ceramics</li>
              <li className="text-sm" style={{ color: 'var(--text-gray)' }}>Textiles & Fabrics</li>
              <li className="text-sm" style={{ color: 'var(--text-gray)' }}>Jewelry</li>
              <li className="text-sm" style={{ color: 'var(--text-gray)' }}>Home Decor</li>
              <li className="text-sm" style={{ color: 'var(--text-gray)' }}>Art & Paintings</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
                <span className="text-sm" style={{ color: 'var(--text-gray)' }}>
                  hello@karigarkart.in
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
                <span className="text-sm" style={{ color: 'var(--text-gray)' }}>
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" style={{ color: 'var(--rust-red)' }} />
                <span className="text-sm" style={{ color: 'var(--text-gray)' }}>
                  Mumbai, Maharashtra, India
                </span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex space-x-3 mt-4">
              <a href="#" className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ backgroundColor: 'var(--sage-green)' }}>
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ backgroundColor: 'var(--sage-green)' }}>
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ backgroundColor: 'var(--sage-green)' }}>
                <Twitter className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8" style={{ borderTopColor: 'var(--sage-green)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--text-gray)' }}>
            © 2026 KARIGARKART. Crafted with love for Indian heritage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}