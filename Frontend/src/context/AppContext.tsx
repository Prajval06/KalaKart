import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastProps } from '../components/Toast';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface AddressData {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

interface AppContextType {
  cartItems: CartItem[];
  wishlistItems: string[];
  toasts: Omit<ToastProps, 'onClose'>[];
  addToCart: (productId: string, productName: string) => void;
  updateQuantity: (productId: string, change: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName: string) => void;
  removeToast: (id: string) => void;
  // ── Auth ──
  isLoggedIn: boolean;
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => void;
  // ── Saved Address ──
  savedAddress: AddressData | null;
  setSavedAddress: (addr: AddressData) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

const BASE_URL = 'http://localhost:5000/api/v1';
function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('kk_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(user: AuthUser | null) {
  if (user) localStorage.setItem('kk_user', JSON.stringify(user));
  else localStorage.removeItem('kk_user');
}

function loadSavedAddress(): AddressData | null {
  try {
    const raw = localStorage.getItem('kk_address');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);
  const isLoggedIn = currentUser !== null;

  const [savedAddress, setSavedAddressState] = useState<AddressData | null>(loadSavedAddress);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);

  const addToCart = (productId: string, productName: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    setToasts(prev => [
      ...prev,
      { id: `cart-${Date.now()}-${Math.random()}`, type: 'cart', productName },
    ]);
  };

  const updateQuantity = (productId: string, change: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => { setCartItems([]); };

  const toggleWishlist = (productId: string, productName: string) => {
    const isAdding = !wishlistItems.includes(productId);
    setWishlistItems(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    if (isAdding) {
      setToasts(prev => [
        ...prev,
        { id: `wishlist-${Date.now()}-${Math.random()}`, type: 'wishlist', productName },
      ]);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const signup = async (email: string, password: string, name: string, role: 'buyer' | 'seller' = 'buyer'): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name, role: role === 'seller' ? 'admin' : 'customer' }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.message || json.error?.message || 'Registration failed.' };
      const { user: userData, access_token, refresh_token } = json.data;
      const user: AuthUser = { email: userData.email, name: userData.full_name, role: userData.role === 'admin' ? 'seller' : 'buyer' };
      setCurrentUser(user);
      saveUser(user);
      localStorage.setItem('kk_token', access_token);
      localStorage.setItem('kk_refresh_token', refresh_token);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Network error. Please try again.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.message || json.error?.message || 'Login failed.' };
      const { user: userData, access_token, refresh_token } = json.data;
      const user: AuthUser = { email: userData.email, name: userData.full_name, role: userData.role === 'admin' ? 'seller' : 'buyer' };
      setCurrentUser(user);
      saveUser(user);
      localStorage.setItem('kk_token', access_token);
      localStorage.setItem('kk_refresh_token', refresh_token);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    saveUser(null);
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_refresh_token');
  };

  const setSavedAddress = (addr: AddressData) => {
    setSavedAddressState(addr);
    localStorage.setItem('kk_address', JSON.stringify(addr));
  };

  return (
    <AppContext.Provider
      value={{
        cartItems, wishlistItems, toasts,
        addToCart, updateQuantity, removeItem, clearCart, toggleWishlist, removeToast,
        isLoggedIn, currentUser, login, signup, logout,
        savedAddress, setSavedAddress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}