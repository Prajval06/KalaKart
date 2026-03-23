import { Link, useSearchParams } from 'react-router';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const lower = query.toLowerCase();

  const results = query
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.artisan.toLowerCase().includes(lower) ||
          p.state.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      )
    : [];

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Back + heading */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--rust-red)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <Search className="w-6 h-6 shrink-0" style={{ color: 'var(--dark-brown)' }} />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--dark-brown)' }}>
              {query ? `Results for "${query}"` : 'Search Products'}
            </h1>
          </div>
          {query && (
            <p className="mt-1 text-sm" style={{ color: 'var(--text-gray)' }}>
              {results.length === 0
                ? 'No products found. Try a different keyword.'
                : `${results.length} ${results.length === 1 ? 'product' : 'products'} found`}
            </p>
          )}
        </div>

        {/* Empty state — no query */}
        {!query && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--beige)' }} />
            <p className="text-lg" style={{ color: 'var(--text-gray)' }}>
              Start typing to search for products, artisans, or categories.
            </p>
          </div>
        )}

        {/* No results */}
        {query && results.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--beige)' }} />
            <p className="text-xl font-semibold mb-2" style={{ color: 'var(--dark-brown)' }}>
              No results for "{query}"
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-gray)' }}>
              Try searching by product name, category (e.g. Jewelry), artisan name, or state.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--rust-red)' }}
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {results.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform shadow"
                    onClick={e => e.preventDefault()}
                  >
                    <Heart className="w-4 h-4" style={{ color: 'var(--text-gray)' }} />
                  </button>
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs text-white font-semibold"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    {product.state}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs mb-1 font-medium" style={{ color: 'var(--saffron)' }}>
                    {product.category}
                  </p>
                  <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: 'var(--dark-brown)' }}>
                    {product.name}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-gray)' }}>
                    by {product.artisan}
                  </p>
                  <p className="font-bold" style={{ color: 'var(--dark-brown)' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
