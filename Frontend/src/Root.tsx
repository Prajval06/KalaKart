import { Outlet } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';
import { ScrollToTop } from './components/ScrollToTop';
import { useAppContext } from './context/AppContext';
import { DiscoveryWidget } from './components/DiscoveryWidget';

export default function Root() {
  const { cartItems, wishlistItems } = useAppContext();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <ScrollToTop />
      <AnnouncementBar />
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <DiscoveryWidget />
    </div>
  );
}
