import { Outlet } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

interface RootProps {
  cartItems: any[];
}

export default function Root({ cartItems }: RootProps) {
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <Header cartCount={cartCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}