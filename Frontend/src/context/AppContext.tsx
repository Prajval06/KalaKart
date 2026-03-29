import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastProps } from '../components/Toast';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  artisan: string;
  category: string;
}

export interface Order {
  id: string;           // e.g. KK12345678
  placedAt: string;     // ISO date string
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

export interface AuthUser {
  email: string;
  name: string;
  photoURL?: string; // Google profile photo
  userType?: 'buyer' | 'seller';
}

export interface AddressData {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

// ── Stored user record (includes hashed-ish password for mock) ──────────────
interface StoredUserRecord {
  email: string;
  name: string;
  password: string; // plain text for mock purposes only
  photoURL?: string;
  userType?: 'buyer' | 'seller';
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
  login: (email: string, password: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string; success?: string }>;
  loginWithGoogle: (userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  logout: () => void;
  // ── Saved Address ──
  savedAddress: AddressData | null;
  setSavedAddress: (addr: AddressData) => void;
  // ── Orders ──
  orders: Order[];
  placeOrder: (items: OrderItem[], total: number, orderId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ── LocalStorage keys ────────────────────────────────────────────────────────
const LS_USER      = 'kk_user';
const LS_REGISTRY  = 'kk_registry';  // { [email]: StoredUserRecord }
const LS_ADDRESS   = 'kk_address';
const LS_ORDERS    = 'kk_orders';

function loadOrders(): Order[] {
  try { const r = localStorage.getItem(LS_ORDERS); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

function loadUser(): AuthUser | null {
  try { const r = localStorage.getItem(LS_USER); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function saveUser(user: AuthUser | null) {
  if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
  else localStorage.removeItem(LS_USER);
}

function loadRegistry(): Record<string, StoredUserRecord> {
  try { const r = localStorage.getItem(LS_REGISTRY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

function saveRegistry(reg: Record<string, StoredUserRecord>) {
  localStorage.setItem(LS_REGISTRY, JSON.stringify(reg));
}

function loadSavedAddress(): AddressData | null {
  try { const r = localStorage.getItem(LS_ADDRESS); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

const mockDelay = () => new Promise<void>(r => setTimeout(r, 800));

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { const s = localStorage.getItem('cart'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    try { const s = localStorage.getItem('wishlist'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  // ── Auth state ──
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);
  const isLoggedIn = currentUser !== null;

  // ── Saved Address ──
  const [savedAddress, setSavedAddressState] = useState<AddressData | null>(loadSavedAddress);

  // ── Orders ──
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }, [orders]);

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

  // ── Auth actions ──

  /**
   * LOGIN: checks registry; returns proper inline errors.
   */
  const login = async (
    email: string,
    password: string,
    userType?: 'buyer' | 'seller'
  ): Promise<{ error?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();

    if (!registry[key]) {
      return { error: 'This email is not registered. Please sign up first.' };
    }
    if (registry[key].password !== password) {
      return { error: 'Incorrect password.' };
    }

    const rec = registry[key];
    // userType passed at login overrides stored value (e.g. buyer tab selected)
    const resolvedType = userType ?? rec.userType ?? 'buyer';
    const user: AuthUser = { email: rec.email, name: rec.name, photoURL: rec.photoURL, userType: resolvedType };
    setCurrentUser(user);
    saveUser(user);
    return {};
  };

  /**
   * SIGN UP: prevents duplicate emails.
   */
  const signup = async (
    email: string,
    password: string,
    name: string,
    userType?: 'buyer' | 'seller'
  ): Promise<{ error?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();

    if (registry[key]) {
      return { error: 'An account with this email already exists. Please log in.' };
    }

    const record: StoredUserRecord = { email, name: name.trim(), password, userType: userType ?? 'buyer' };
    registry[key] = record;
    saveRegistry(registry);

    // Don't auto-login after signup — caller switches to login view
    return {};
  };

  /**
   * FORGOT PASSWORD: validates email exists, simulates sending reset email.
   */
  const forgotPassword = async (
    email: string
  ): Promise<{ error?: string; success?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();

    if (!registry[key]) {
      return { error: 'No account found with this email.' };
    }

    // In production this would call your backend/Firebase.
    // Mock: just return success message.
    return { success: 'Password reset email sent. Please check your inbox.' };
  };

  /**
   * GOOGLE SIGN IN: simulates OAuth with a mock Google profile.
   * In production, replace with Firebase/Auth0 Google provider.
   */
  const loginWithGoogle = async (userType?: 'buyer' | 'seller'): Promise<{ error?: string }> => {
    await mockDelay();

    // Mock Google user — in production this comes from OAuth callback
    const googleUser: AuthUser = {
      email: 'google.user@gmail.com',
      name: 'Google User',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      userType: userType ?? 'buyer',
    };

    const registry = loadRegistry();
    const key = googleUser.email.toLowerCase();

    // Auto-register Google user if first time
    if (!registry[key]) {
      registry[key] = {
        email: googleUser.email,
        name: googleUser.name,
        password: '__google_oauth__',
        photoURL: googleUser.photoURL,
        userType: googleUser.userType,
      };
      saveRegistry(registry);
    }

    setCurrentUser(googleUser);
    saveUser(googleUser);
    return {};
  };

  const logout = () => {
    setCurrentUser(null);
    saveUser(null);
  };

  const setSavedAddress = (addr: AddressData) => {
    setSavedAddressState(addr);
    localStorage.setItem(LS_ADDRESS, JSON.stringify(addr));
  };

  const placeOrder = (items: OrderItem[], total: number, orderId: string) => {
    const newOrder: Order = {
      id: orderId,
      placedAt: new Date().toISOString(),
      items,
      total,
      status: 'Processing',
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        cartItems, wishlistItems, toasts,
        addToCart, updateQuantity, removeItem, clearCart, toggleWishlist, removeToast,
        isLoggedIn, currentUser, login, signup, forgotPassword, loginWithGoogle, logout,
        savedAddress, setSavedAddress,
        orders, placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}