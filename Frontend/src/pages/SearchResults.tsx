import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SearchX, Package, Users } from 'lucide-react';
import { products } from '../data/products';
import { artisans } from '../data/artisans';

// ── Search helpers ────────────────────────────────────────────────────────────
function normalize(s: string) {
  return s.toLowerCase().replace(/[&]/g, 'and');
}

function matchesProduct(q: string, p: (typeof products)[0]) {
  const hay = normalize(
    [p.name, p.category, p.description, p.artisan, p.state].join(' ')
  );
  return q.split(' ').every(word => hay.includes(word));
}

function matchesArtisan(q: string, a: (typeof artisans)[0]) {
  const hay = normalize(
    [a.name, a.craft, a.state, a.bio, a.specialization].join(' ')
  );
  return q.split(' ').every(word => hay.includes(word));
}

// ── Highlight matched text ────────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#DAA520]/30 text-[#4A2C2A] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, query }: { product: (typeof products)[0]; query: string }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white font-semibold"
          style={{ backgroundColor: 'var(--saffron, #E07A2F)' }}
        >
          {product.state}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--saffron, #E07A2F)' }}>
          {product.category}
        </p>
        <h3 className="text-base font-bold mb-1 line-clamp-2 text-[#4A2C2A]">
          <Highlight text={product.name} query={query} />
        </h3>
        <p className="text-sm mb-3 text-[#8B4513]">
          by <Highlight text={product.artisan} query={query} />
        </p>
        <p className="font-bold text-[#8B2500] text-lg">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  );
}

// ── Artisan card ──────────────────────────────────────────────────────────────
function ArtisanCard({ artisan, query }: { artisan: (typeof artisans)[0]; query: string }) {
  return (
    <Link
      to={`/artisan/${artisan.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex gap-4 p-4 items-center"
    >
      <img
        src={artisan.image}
        alt={artisan.name}
        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-[#DAA520]"
      />
      <div className="min-w-0">
        <h3 className="font-bold text-[#4A2C2A] text-base truncate">
          <Highlight text={artisan.name} query={query} />
        </h3>
        <p className="text-sm text-[#8B4513]">
          <Highlight text={artisan.craft} query={query} />
        </p>
        <p className="text-xs text-[#8B4513]/70 mt-0.5">
          {artisan.state} · {artisan.yearsOfExperience} yrs experience
        </p>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') ?? '';
  const q = normalize(rawQuery.trim());

  const matchedProducts = useMemo(
    () => (q ? products.filter(p => matchesProduct(q, p)) : []),
    [q]
  );

  const matchedArtisans = useMemo(
    () => (q ? artisans.filter(a => matchesArtisan(q, a)) : []),
    [q]
  );

  const totalResults = matchedProducts.length + matchedArtisans.length;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--cream-bg, #FFF8E7)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-[#4A2C2A] mb-1">
            {rawQuery ? (
              <>Search Results for "<span className="text-[#8B2500]">{rawQuery}</span>"</>
            ) : (
              'Search KalaKart'
            )}
          </h1>
          {q && (
            <p className="text-[#8B4513] text-sm">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {/* Empty query nudge */}
        {!q && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#FFF0D0', border: '2px dashed #DAA520' }}>
              <SearchX className="w-10 h-10 text-[#DAA520]" />
            </div>
            <p className="text-xl font-serif text-[#4A2C2A] mb-2">Start searching…</p>
            <p className="text-[#8B4513] max-w-sm">
              Use the search bar above to find handicrafts, artisans, categories, or Indian states.
            </p>
          </div>
        )}

        {/* No results */}
        {q && totalResults === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#FFF0D0', border: '2px dashed #DAA520' }}>
              <SearchX className="w-10 h-10 text-[#DAA520]" />
            </div>
            <p className="text-xl font-serif text-[#4A2C2A] mb-2">No results found</p>
            <p className="text-[#8B4513] mb-6 max-w-sm">
              We couldn't find anything for "<strong>{rawQuery}</strong>".
              Try a different keyword, category, or artisan name.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link
                to="/shop"
                className="px-5 py-2 rounded-full text-white font-semibold text-sm shadow hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #8B2500, #A52A2A)' }}
              >
                Browse All Products
              </Link>
              <Link
                to="/artisans"
                className="px-5 py-2 rounded-full text-[#4A2C2A] font-semibold text-sm shadow bg-white border border-[#DEB887] hover:bg-[#FFF8DC] transition"
              >
                Meet Artisans
              </Link>
            </div>
          </div>
        )}

        {/* Products section */}
        {matchedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <Package className="w-5 h-5 text-[#8B2500]" />
              <h2 className="text-xl font-bold font-serif text-[#4A2C2A]">
                Products
                <span className="ml-2 text-sm font-normal text-[#8B4513]">({matchedProducts.length})</span>
              </h2>
              <div className="flex-1 h-px bg-[#DAA520]/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {matchedProducts.map(p => (
                <ProductCard key={p.id} product={p} query={rawQuery} />
              ))}
            </div>
          </section>
        )}

        {/* Artisans section */}
        {matchedArtisans.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <Users className="w-5 h-5 text-[#8B2500]" />
              <h2 className="text-xl font-bold font-serif text-[#4A2C2A]">
                Artisans
                <span className="ml-2 text-sm font-normal text-[#8B4513]">({matchedArtisans.length})</span>
              </h2>
              <div className="flex-1 h-px bg-[#DAA520]/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedArtisans.map(a => (
                <ArtisanCard key={a.id} artisan={a} query={rawQuery} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
