import { useParams, Link } from 'react-router';
import { MapPin, Award } from 'lucide-react';
import { artisans } from '../data/artisans';
import { products } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';

export default function ArtisanDetail() {
  const { artisanId } = useParams();
  const artisan = artisans.find(a => a.id === artisanId);
  const artisanProducts = products.filter(p => p.artisanId === artisanId);

  if (!artisan) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <h2 className="mb-4">Artisan not found</h2>
        <Link
          to="/artisans"
          className="inline-flex items-center font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--saffron)' }}
        >
          Back to Artisans
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Artisans', href: '/artisans' },
          { label: artisan.name },
        ]}
      />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Artisan Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              <img 
                src={artisan.image} 
                alt={artisan.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div 
                className="inline-block px-3 py-1 rounded-full text-sm mb-4 self-start"
                style={{ backgroundColor: 'var(--cream)', color: 'var(--saffron)' }}
              >
                Master Artisan
              </div>
              
              <h1 className="mb-4">{artisan.name}</h1>
              
              <p 
                className="text-2xl font-semibold mb-6"
                style={{ color: 'var(--saffron)' }}
              >
                {artisan.specialization}
              </p>

              <p className="text-lg mb-8">
                {artisan.bio}
              </p>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--beige)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                    <p className="text-sm font-semibold">Location</p>
                  </div>
                  <p>{artisan.state}, India</p>
                </div>

                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--beige)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                    <p className="text-sm font-semibold">Experience</p>
                  </div>
                  <p>{artisan.yearsOfExperience} Years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products by Artisan */}
          {artisanProducts.length > 0 && (
            <div>
              <h2 className="mb-8">Products by {artisan.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {artisanProducts.map((product) => (
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
                    </div>
                    <div className="p-4">
                      <p className="text-xs mb-1" style={{ color: 'var(--saffron)' }}>
                        {product.category}
                      </p>
                      <h3 className="text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Story Section */}
          <div 
            className="mt-16 p-8 rounded-xl"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            <h2 className="mb-4">The Art of {artisan.craft}</h2>
            <p className="mb-4">
              {artisan.name} represents the {artisan.yearsOfExperience}th year of dedication to preserving the traditional craft of {artisan.craft.toLowerCase()}. 
              Working from {artisan.state}, each piece is meticulously handcrafted using techniques passed down through generations.
            </p>
            <p>
              By supporting {artisan.name}'s work, you're not just purchasing a product – you're investing in the preservation of India's rich cultural heritage 
              and supporting sustainable livelihoods for artisan communities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}