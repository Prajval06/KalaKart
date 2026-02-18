import { Heart, Users, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="mb-6">About ArtisanBazaar</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connecting India's talented artisans with the world, one handcrafted masterpiece at a time
          </p>
        </div>

        {/* Story */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 p-8 rounded-xl"
          style={{ backgroundColor: 'var(--cream)' }}
        >
          <div>
            <h2 className="mb-4">Our Story</h2>
            <p className="mb-4">
              ArtisanBazaar was born from a simple yet powerful vision: to preserve India's rich heritage of traditional crafts while 
              empowering the artisans who keep these age-old traditions alive.
            </p>
            <p className="mb-4">
              We recognized that despite their exceptional skills and dedication, many artisans struggle to find fair markets for their work. 
              Our platform bridges this gap, connecting master craftspeople directly with customers who appreciate authentic, handcrafted products.
            </p>
            <p>
              Every purchase on ArtisanBazaar directly supports artisan families and helps preserve traditional Indian crafts for future generations.
            </p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1663082076072-838f8dafec13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnRpc2FuJTIwd29ya2luZ3xlbnwxfHx8fDE3NzA5MTYzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Indian artisan at work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--saffron)', color: 'white' }}
              >
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="mb-3">Authenticity</h3>
              <p>
                Every product is 100% handcrafted by verified artisans using traditional techniques passed down through generations.
              </p>
            </div>

            <div className="text-center p-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--marigold)', color: 'white' }}
              >
                <Users className="w-8 h-8" />
              </div>
              <h3 className="mb-3">Community</h3>
              <p>
                We're committed to fair trade practices and creating sustainable livelihoods for artisan communities across India.
              </p>
            </div>

            <div className="text-center p-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--green)', color: 'white' }}
              >
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="mb-3">Heritage</h3>
              <p>
                Preserving India's cultural heritage by supporting traditional crafts and ensuring they thrive for future generations.
              </p>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div 
          className="p-8 rounded-xl mb-16"
          style={{ backgroundColor: 'var(--beige)' }}
        >
          <h2 className="text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p 
                className="text-4xl font-bold mb-2"
                style={{ color: 'var(--saffron)' }}
              >
                500+
              </p>
              <p>Artisans Supported</p>
            </div>
            <div>
              <p 
                className="text-4xl font-bold mb-2"
                style={{ color: 'var(--saffron)' }}
              >
                15
              </p>
              <p>States Covered</p>
            </div>
            <div>
              <p 
                className="text-4xl font-bold mb-2"
                style={{ color: 'var(--saffron)' }}
              >
                10,000+
              </p>
              <p>Products Sold</p>
            </div>
            <div>
              <p 
                className="text-4xl font-bold mb-2"
                style={{ color: 'var(--saffron)' }}
              >
                25+
              </p>
              <p>Traditional Crafts</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div 
          className="text-center p-12 rounded-xl"
          style={{ backgroundColor: 'var(--cream)' }}
        >
          <h2 className="mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of preserving India's cultural heritage. Every purchase makes a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/shop"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              Shop Now
            </a>
            <a
              href="/artisans"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold border-2 hover:opacity-70 transition-opacity"
              style={{ borderColor: 'var(--saffron)', color: 'var(--saffron)' }}
            >
              Meet Our Artisans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
