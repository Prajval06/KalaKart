import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  const { products, loading, error, meta } = useProducts({
    category: selectedCategory,
    search,
    per_page: 70,
  });

  const { categories } = useCategories();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Loading products...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-red-500">Error: {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Shop Handicrafts</h1>
          <p>Discover unique handcrafted products from India's finest artisans</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-full border-2"
            style={{ borderColor: 'var(--beige)' }}
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <h3>Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className="px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: selectedCategory === '' ? 'var(--saffron)' : 'white',
                color: selectedCategory === '' ? 'white' : 'var(--text-dark)',
                border: `2px solid ${selectedCategory === '' ? 'var(--saffron)' : 'var(--beige)'}`,
              }}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className="px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: selectedCategory === category.name ? 'var(--saffron)' : 'white',
                  color: selectedCategory === category.name ? 'white' : 'var(--text-dark)',
                  border: `2px solid ${selectedCategory === category.name ? 'var(--saffron)' : 'var(--beige)'}`,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Count */}
        <div className="mb-6">
          <p style={{ color: 'var(--text-gray)' }}>
            Showing {products.length} of {meta?.total || 0} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-4 h-4" style={{ color: 'var(--text-gray)' }} />
                </button>
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: 'var(--saffron)' }}
                >
                  {product.specialty || product.category}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>
                  {product.category?.name || product.category}
                </p>
                <h3 className="text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-gray)' }}>
                  by {product.artisanName}
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-xl mb-2">No products found</p>
            <p style={{ color: 'var(--text-gray)' }}>
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
