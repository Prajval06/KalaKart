import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastProps } from '../components/Toast';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface AuthUser {
  email: string;
  name: string;
  role: 'buyer' | 'seller';
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
  signup: (email: string, password: string, name: string, role?: 'buyer' | 'seller') => Promise<{ error?: string }>;
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

// ── Stored user record ────────────────────────────────────────────────────────
interface StoredUser {
  email: string;
  name: string;
  password: string; // stored plaintext (demo/mock only)
  role: 'buyer' | 'seller';
}

function loadRegistry(): StoredUser[] {
  try {
    const raw = localStorage.getItem('kk_users');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRegistry(users: StoredUser[]) {
  localStorage.setItem('kk_users', JSON.stringify(users));
}

// ── Auth session helpers ──────────────────────────────────────────────────────
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

// Simulate network latency for mock auth
const mockDelay = () => new Promise<void>(r => setTimeout(r, 700));

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

  // ── Auth state ──
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);
  const isLoggedIn = currentUser !== null;

  // ── Saved Address ──
  const [savedAddress, setSavedAddressState] = useState<AddressData | null>(loadSavedAddress);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);

  // ── Cart actions ──
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

  const clearCart = () => {
    setCartItems([]);
  };

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

  // ── Auth actions ──────────────────────────────────────────────────────────

  /**
   * Login: verifies the email exists in the registry, then checks the password.
   * Returns a descriptive error if the email was never registered.
   */
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    await mockDelay();
    if (!email.includes('@')) return { error: 'Please enter a valid email address.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

    const registry = loadRegistry();
    const found = registry.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return {
        error:
          'No account found with this email. Please sign up first to create an account.',
      };
    }

    if (found.password !== password) {
      return { error: 'Incorrect password. Please try again.' };
    }

    const user: AuthUser = { email: found.email, name: found.name, role: found.role };
    setCurrentUser(user);
    saveUser(user);
    return {};
  };

  /**
   * Signup: registers a new user in the registry with their chosen role.
   * Returns an error if the email is already taken.
   */
  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'buyer' | 'seller' = 'buyer',
  ): Promise<{ error?: string }> => {
    await mockDelay();
    if (!email.includes('@')) return { error: 'Please enter a valid email address.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    if (!name.trim()) return { error: 'Please enter your name.' };

    const registry = loadRegistry();
    const alreadyExists = registry.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
      return {
        error:
          'An account with this email already exists. Please log in instead.',
      };
    }

    const newRecord: StoredUser = { email, name: name.trim(), password, role };
    saveRegistry([...registry, newRecord]);

    const user: AuthUser = { email, name: name.trim(), role };
    setCurrentUser(user);
    saveUser(user);
    return {};
  };

  const logout = () => {
    setCurrentUser(null);
    saveUser(null);
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