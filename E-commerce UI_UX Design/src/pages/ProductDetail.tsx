import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Heart, MapPin, Award } from 'lucide-react';
import { products } from '../data/products';
import { artisans } from '../data/artisans';

interface ProductDetailProps {
  onAddToCart: (productId: string) => void;
}

export default function ProductDetail({ onAddToCart }: ProductDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const artisan = product ? artisans.find(a => a.id === product.artisanId) : null;

  if (!product) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <h2 className="mb-4">Product not found</h2>
        <Link 
          to="/shop"
          className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--saffron)' }}
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product.id);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/shop"
          className="inline-flex items-center mb-8 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--saffron)' }}
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Shop
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button 
              className="absolute top-4 right-4 p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              <Heart className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div 
              className="inline-block px-3 py-1 rounded-full text-sm mb-4 self-start"
              style={{ backgroundColor: 'var(--cream)', color: 'var(--saffron)' }}
            >
              {product.category}
            </div>
            
            <h1 className="mb-4">{product.name}</h1>
            
            <p 
              className="text-3xl font-bold mb-6"
              style={{ color: 'var(--saffron)' }}
            >
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            <p className="mb-8 text-lg">
              {product.description}
            </p>

            {/* Artisan Info */}
            {artisan && (
              <Link
                to={`/artisan/${artisan.id}`}
                className="flex items-center gap-4 p-4 rounded-lg mb-8 hover:shadow-lg transition-shadow"
                style={{ backgroundColor: 'var(--cream)' }}
              >
                <img 
                  src={artisan.image} 
                  alt={artisan.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-gray)' }}>
                    Crafted by
                  </p>
                  <p className="font-semibold mb-1">{artisan.name}</p>
                  <p className="text-sm" style={{ color: 'var(--saffron)' }}>
                    {artisan.specialization}
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180" style={{ color: 'var(--saffron)' }} />
              </Link>
            )}

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--beige)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  <p className="text-sm font-semibold">Origin</p>
                </div>
                <p>{product.state}</p>
              </div>
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--beige)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  <p className="text-sm font-semibold">Authenticity</p>
                </div>
                <p>100% Handcrafted</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                className="px-6 py-4 rounded-lg font-semibold border-2 hover:opacity-70 transition-opacity"
                style={{ borderColor: 'var(--saffron)', color: 'var(--saffron)' }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>
                      {relatedProduct.category}
                    </p>
                    <h3 className="text-lg mb-2 line-clamp-1">{relatedProduct.name}</h3>
                    <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      ₹{relatedProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
