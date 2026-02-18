import { Link } from 'react-router';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { useState } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProducts = products.slice(0, 6);
  
  // Premium products for hero slider
  const premiumProducts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0JTIwcG90dGVyeXxlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Handcrafted Pottery Collection',
      description: 'Traditional ceramic art from Gujarat artisans'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1759738096144-b43206226765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZXh0aWxlJTIwZmFicmljJTIwd2VhdmluZ3xlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Premium Textile & Fabrics',
      description: 'Handwoven masterpieces from skilled weavers'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGpld2Vscnl8ZW58MXx8fHwxNzcxMTY2NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Traditional Jewelry',
      description: 'Exquisite pieces crafted by master artisans'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnQlMjBwYWludGluZyUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTE2Njc4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Indian Art & Paintings',
      description: 'Authentic traditional art forms'
    }
  ];
  
  const categories = [
    {
      name: 'Pottery & Ceramics',
      image: 'https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBwb3R0ZXJ5JTIwY2VyYW1pY3MlMjBjcmFmdHxlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Textiles & Fabrics',
      image: 'https://images.unsplash.com/photo-1759738096144-b43206226765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZXh0aWxlJTIwZmFicmljJTIwd2VhdmluZ3xlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1678378819861-158c3ff303d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGpld2Vscnl8ZW58MXx8fHwxNzcxMTY2NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Art & Paintings',
      image: 'https://images.unsplash.com/photo-1661708729813-e7cb3909755b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnQlMjBwYWludGluZyUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTE2Njc4Mnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Home Decor',
      image: 'https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBob21lJTIwZGVjb3IlMjBoYW5kaWNyYWZ0c3xlbnwxfHx8fDE3NzExNjY3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  const regions = [
    'Maharashtra',
    'Rajasthan',
    'Karnataka',
    'Assam',
    'Uttar Pradesh',
    'Gujarat'
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % premiumProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + premiumProducts.length) % premiumProducts.length);
  };
  
  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Side Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Hero Slider */}
          <div className="lg:col-span-9 rounded-3xl overflow-hidden relative min-h-[400px] hero-slider">
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={premiumProducts[currentSlide].image}
                alt={premiumProducts[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ height: '400px' }}
              />
              <div 
                className="absolute inset-0"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(127, 169, 155, 0.9) 0%, rgba(127, 169, 155, 0.7) 100%)'
                }}
              />
              <div className="relative z-10 p-12 flex flex-col justify-center" style={{ height: '400px' }}>
                <h1 className="text-white mb-4" style={{ fontSize: '3rem' }}>
                  Discover Authentic
                  <br />
                  Indian Handicrafts
                </h1>
                <p className="text-white text-xl mb-2 max-w-2xl opacity-90 font-semibold">
                  {premiumProducts[currentSlide].title}
                </p>
                <p className="text-white text-lg mb-8 max-w-2xl opacity-80">
                  {premiumProducts[currentSlide].description}
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity self-start"
                  style={{ backgroundColor: 'var(--rust-red)' }}
                >
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
              <button
                className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
                onClick={nextSlide}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shop by Region */}
          <div
            className="lg:col-span-3 rounded-3xl overflow-hidden relative min-h-[400px]"
            style={{ backgroundColor: 'var(--sage-green)' }}
          >
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-white" />
                <h3 className="text-white font-semibold" style={{ fontSize: '1.25rem' }}>
                  Shop by Region
                </h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-3">
                {regions.map((region) => (
                  <Link
                    key={region}
                    to="/shop"
                    className="px-4 py-3 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {region}
                  </Link>
                ))}
              </div>
              
              <Link
                to="/shop"
                className="mt-4 text-center py-3 text-white font-medium hover:opacity-70 transition-opacity"
              >
                View All Regions →
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="mb-6" style={{ color: 'var(--dark-brown)' }}>Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to="/shop"
                className="rounded-2xl overflow-hidden relative min-h-[120px] hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <img 
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(127, 169, 155, 0.8) 0%, rgba(127, 169, 155, 0.6) 100%)'
                  }}
                />
                <div className="relative z-10 p-6 flex items-center justify-center text-center h-full">
                  <h3 
                    className="font-semibold"
                    style={{ 
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ color: 'var(--dark-brown)' }}>Featured Products</h2>
            <Link 
              to="/shop"
              className="hidden md:flex items-center font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--rust-red)' }}
            >
              View All
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square relative group"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(232, 189, 177, 0.9), rgba(232, 189, 177, 0.3))'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <h3 className="text-white text-sm font-semibold line-clamp-2">{product.name}</h3>
                  <p className="text-white text-xs mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link 
              to="/shop"
              className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--rust-red)' }}
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* About Section */}
        <div 
          className="mt-16 rounded-3xl overflow-hidden relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1762173886363-de541417e48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMGJhbm5lcnxlbnwxfHx8fDE3NzExNjY3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Supporting Artisans"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(135deg, rgba(127, 169, 155, 0.9) 0%, rgba(127, 169, 155, 0.8) 100%)'
            }}
          />
          <div className="relative z-10 p-12 text-center">
            <h2 className="text-white mb-4">Supporting Indian Artisans</h2>
            <p className="text-white text-lg mb-8 max-w-3xl mx-auto opacity-90">
              Every purchase helps preserve traditional crafts and provides sustainable livelihoods 
              to artisan communities across India
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/artisans"
                className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--rust-red)' }}
              >
                Meet Our Artisans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 rounded-full font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
