import { Link } from 'react-router';
import { MapPin, Award, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usersAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

type ArtisanCard = {
  id: string;
  name: string;
  image: string;
  specialization: string;
  state: string;
  yearsOfExperience: number;
  bio: string;
};

export default function Artisans() {
  const { t } = useTranslation();
  const [artisans, setArtisans] = useState<ArtisanCard[]>([]);

  useEffect(() => {
    const loadArtisans = async () => {
      try {
        const res = await usersAPI.getArtisans();
        const list = res?.data?.data?.artisans || [];

        const mapped = list.map((a: any) => ({
          id: String(a.id || a._id || ''),
          name: a.full_name || 'KalaKart Artisan',
          image: a.profileImage || '',
          specialization: a.specialty || 'Independent Artisan',
          state: a.location || 'India',
          yearsOfExperience: Number(a.yearsOfExperience || 1),
          bio: a.bio || '',
        }));

        setArtisans(mapped.filter((a: ArtisanCard) => !!a.id));
      } catch (error) {
        console.error('Failed to load artisans:', error);
        setArtisans([]);
      }
    };

    loadArtisans();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Breadcrumb
        items={[
          { label: t('header.home'), href: '/' },
          { label: t('header.artisans') },
        ]}
      />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4">{t('artisans.meetOurArtisans')}</h1>
            <p className="text-xl max-w-3xl mx-auto">
              {t('artisans.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-xs text-white px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              {t('artisans.ourCreators')}
            </span>
            <h2 className="text-lg" style={{ color: 'var(--dark-brown)' }}>
              {t('artisans.traditionalIndependent')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artisans.map((artisan) => {
              const imageSrc = artisan.image
                ? `${artisan.image}${artisan.image.includes('?') ? '&' : '?'}v=kk-artisans-20260408`
                : '';

              return (
                <Link
                  key={artisan.id}
                  to={`/artisan/${artisan.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
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
                          <span className="text-sm">{t('artisans.yearsOfExperience', { count: artisan.yearsOfExperience })}</span>
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
              );
            })}
          </div>

          {/* Support Banner */}
          <div
            className="mt-16 p-8 rounded-xl text-center"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            <h2 className="mb-4">{t('artisans.supportTraditionalCrafts')}</h2>
            <p className="max-w-2xl mx-auto mb-6">
              {t('artisans.supportDesc')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              {t('artisans.shopNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}