import { Link } from 'react-router';
import { MapPin, Award, User } from 'lucide-react';
import { artisans } from '../data/artisans';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAppContext } from '../context/AppContext';
import type { ArtisanProfile } from '../context/types';

export default function Artisans() {
  const { getCompletedArtisanProfiles } = useAppContext();
  const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

  // Use backend artisan identities for this public listing to avoid stale local profile images.
  const registeredProfiles: ArtisanProfile[] = getCompletedArtisanProfiles()
    .filter((profile: ArtisanProfile) => isMongoObjectId(profile.userId));

  // Deduplicate by name to guarantee the UI never shows the same artisan twice
  const uniqueProfiles = registeredProfiles.reduce((acc: ArtisanProfile[], current: ArtisanProfile) => {
    const exists = acc.find(p => p.name === current.name);
    if (!exists) acc.push(current);
    return acc;
  }, [] as ArtisanProfile[]);

  const unifiedArtisans = uniqueProfiles.map((p: ArtisanProfile) => {
    const original = artisans.find(a => a.name === p.name);
    return {
      id: p.userId,
      name: p.name,
      image: p.profileImage || original?.image || '',
      specialization: p.specialty || original?.specialization || 'Independent Artisan',
      state: p.location || original?.state || 'India',
      yearsOfExperience: p.yearsOfExperience || original?.yearsOfExperience || 1,
      bio: p.description || original?.bio || ''
    };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Artisans' },
        ]}
      />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4">Meet Our Artisans</h1>
            <p className="text-xl max-w-3xl mx-auto">
              The talented craftspeople preserving India's rich heritage through their exceptional skills and dedication
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-xs text-white px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              Our Creators
            </span>
            <h2 className="text-lg" style={{ color: 'var(--dark-brown)' }}>
              Traditional & Independent Craftspeople
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {unifiedArtisans.map((artisan: any) => (
              <Link
                key={artisan.id}
                to={`/artisan/${artisan.id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  {artisan.image ? (
                    <img
                      src={artisan.image}
                      alt={artisan.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="mb-2 text-white">{artisan.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{artisan.state}</span>
                    </div>
                    {artisan.yearsOfExperience > 1 && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{artisan.yearsOfExperience} years of experience</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <p
                    className="text-sm font-semibold mb-2"
                    style={{ color: 'var(--saffron)' }}
                  >
                    {artisan.specialization}
                  </p>
                  <p
                    className="text-sm line-clamp-3"
                    style={{ color: 'var(--text-gray)' }}
                  >
                    {artisan.bio}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Support Banner */}
          <div
            className="mt-16 p-8 rounded-xl text-center"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            <h2 className="mb-4">Support Traditional Crafts</h2>
            <p className="max-w-2xl mx-auto mb-6">
              Every purchase helps preserve centuries-old traditions and provides sustainable livelihoods to artisan communities across India.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}