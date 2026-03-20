import { Link } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--cream)' }}
        >
          <span className="text-5xl">🔍</span>
        </div>
        <h1 className="mb-4">404 - Page Not Found</h1>
        <p className="text-xl mb-8" style={{ color: 'var(--text-gray)' }}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--saffron)' }}
        >
          <Home className="mr-2 w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
