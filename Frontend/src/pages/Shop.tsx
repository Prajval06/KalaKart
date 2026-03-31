import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Filter } from 'lucide-react';
import { categories } from '../data/products';
import { useAppContext } from '../context/AppContext';

export default function Shop() {
  const { getAllProducts } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allProducts = getAllProducts();
  const filteredProducts = selectedCategory === 'All'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Shop Handicrafts</h1>
          <p>Discover unique handcrafted products from India's finest artisans</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            <h3>Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: selectedCategory === category ? 'var(--saffron)' : 'white',
                  color: selectedCategory === category ? 'white' : 'var(--text-dark)',
                  border: `2px solid ${selectedCategory === category ? 'var(--saffron)' : 'var(--beige)'}`,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Count */}
        <div className="mb-6">
          <p style={{ color: 'var(--text-gray)' }}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
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
                  {product.state}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>
                  {product.category}
                </p>
                <h3 className="text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-gray)' }}>
                  by {product.artisan}
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
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
