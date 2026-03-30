import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastProps } from '../components/Toast';
import { products as staticProducts } from '../data/products';
import type { Product } from '../data/products';

// ── Buyer types ──────────────────────────────────────────────────────────────
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

// ── Artisan / Seller types ───────────────────────────────────────────────────
export interface ArtisanProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;       // primary thumbnail (first uploaded image or fallback URL)
  images: string[];    // all uploaded images as base64 data-URLs
  category: string;
  description: string;
  status: 'active' | 'draft';
}

export type SellerOrderStatus = 'new' | 'processing' | 'completed';

export interface SellerOrder {
  id: string;
  product: string;
  productImage: string;
  customer: string;
  amount: number;
  date: string;             // ISO date string
  status: SellerOrderStatus;
}

// ── Auth types ───────────────────────────────────────────────────────────────
export interface AuthUser {
  email: string;
  name: string;
  photoURL?: string;
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

interface StoredUserRecord {
  email: string;
  name: string;
  password: string;
  photoURL?: string;
  userType?: 'buyer' | 'seller';
}

// ── Artisan Profile (public-facing) ─────────────────────────────────────────
export interface ArtisanProfile {
  userId: string;        // email (unique)
  name: string;          // display name
  profileImage: string;  // base64 or URL
  description: string;   // artisan bio
  isComplete: boolean;   // true after setup
}

// ── Context shape ────────────────────────────────────────────────────────────
interface AppContextType {
  // Buyer cart
  cartItems: CartItem[];
  wishlistItems: string[];
  toasts: Omit<ToastProps, 'onClose'>[];
  addToCart: (productId: string, productName: string) => void;
  updateQuantity: (productId: string, change: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName: string) => void;
  removeToast: (id: string) => void;
  // Auth
  isLoggedIn: boolean;
  currentUser: AuthUser | null;
  login: (email: string, password: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string; success?: string }>;
  loginWithGoogle: (userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  logout: () => void;
  // Saved Address
  savedAddress: AddressData | null;
  setSavedAddress: (addr: AddressData) => void;
  // Buyer Orders
  orders: Order[];
  placeOrder: (items: OrderItem[], total: number, orderId: string) => void;
  // Artisan / Seller data
  artisanProducts: ArtisanProduct[];
  artisanOrders: SellerOrder[];
  isNewArtisan: boolean;
  addArtisanProduct: (data: Omit<ArtisanProduct, 'id'>) => void;
  updateArtisanProduct: (updated: ArtisanProduct) => void;
  deleteArtisanProduct: (id: string) => void;
  updateArtisanOrder: (id: string, status: SellerOrderStatus) => void;
  // Artisan Profile
  artisanProfile: ArtisanProfile | null;
  saveArtisanProfile: (profileImage: string, description: string) => void;
  getCompletedArtisanProfiles: () => ArtisanProfile[];
  // Global catalog
  getAllProducts: () => Product[];
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ── LocalStorage key helpers ─────────────────────────────────────────────────
const LS_USER     = 'kk_user';
const LS_REGISTRY = 'kk_registry';
const LS_ADDRESS  = 'kk_address';
const LS_ORDERS   = 'kk_orders';

const cartKey            = (email: string) => `kk_cart_${email.toLowerCase().trim()}`;
const wishlistKey        = (email: string) => `kk_wishlist_${email.toLowerCase().trim()}`;
const ordersKey          = (email: string) => `kk_orders_${email.toLowerCase().trim()}`;
const sellerProductsKey  = (email: string) => `kk_seller_products_${email.toLowerCase().trim()}`;
const sellerOrdersKey    = (email: string) => `kk_seller_orders_${email.toLowerCase().trim()}`;
const sellerProfileKey   = (email: string) => `kk_seller_profile_${email.toLowerCase().trim()}`;
// Global registry: all completed artisan profiles (keyed by email)
const LS_PROFILES = 'kk_artisan_profiles';

// ── ArtisanProduct category → canonical Product category map ─────────────────
// The dashboard modal uses short names; the shop uses full canonical names.
const CATEGORY_MAP: Record<string, string> = {
  'Paintings':  'Art & Paintings',
  'Pottery':    'Pottery & Ceramics',
  'Textiles':   'Textiles & Fabrics',
  'Jewelry':    'Jewelry',
  'Woodwork':   'Home Decor',
  'Other':      'Home Decor',
  // Pass-through for any already-canonical name
  'Art & Paintings':    'Art & Paintings',
  'Pottery & Ceramics': 'Pottery & Ceramics',
  'Textiles & Fabrics': 'Textiles & Fabrics',
  'Home Decor':         'Home Decor',
  'Clothing':           'Clothing',
  'Crafts & Weaving':   'Crafts & Weaving',
  'Miniatures':         'Miniatures',
};

// ── Generic load/save helpers ────────────────────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; }
  catch { return fallback; }
}
function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadUser(): AuthUser | null {
  return loadJSON<AuthUser | null>(LS_USER, null);
}
function saveUser(user: AuthUser | null) {
  if (user) saveJSON(LS_USER, user);
  else localStorage.removeItem(LS_USER);
}

function loadRegistry(): Record<string, StoredUserRecord> {
  return loadJSON<Record<string, StoredUserRecord>>(LS_REGISTRY, {});
}
function saveRegistry(reg: Record<string, StoredUserRecord>) {
  saveJSON(LS_REGISTRY, reg);
}

function loadSavedAddress(): AddressData | null {
  return loadJSON<AddressData | null>(LS_ADDRESS, null);
}

const mockDelay = () => new Promise<void>(r => setTimeout(r, 800));

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {

  // ── Initialise state from the already-logged-in user (if any) ──
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const u = loadUser();
    return u?.email ? loadJSON<CartItem[]>(cartKey(u.email), []) : [];
  });

  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    const u = loadUser();
    return u?.email ? loadJSON<string[]>(wishlistKey(u.email), []) : [];
  });

  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);
  const isLoggedIn = currentUser !== null;

  const [savedAddress, setSavedAddressState] = useState<AddressData | null>(loadSavedAddress);

  const [orders, setOrders] = useState<Order[]>(() => {
    const u = loadUser();
    return u?.email ? loadJSON<Order[]>(ordersKey(u.email), []) : loadJSON<Order[]>(LS_ORDERS, []);
  });

  // ── Artisan / Seller state ──
  const [artisanProducts, setArtisanProducts] = useState<ArtisanProduct[]>(() => {
    const u = loadUser();
    return u?.email && u.userType === 'seller'
      ? loadJSON<ArtisanProduct[]>(sellerProductsKey(u.email), [])
      : [];
  });

  // ── Artisan Profile state ──
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(() => {
    const u = loadUser();
    return u?.email && u.userType === 'seller'
      ? loadJSON<ArtisanProfile | null>(sellerProfileKey(u.email), null)
      : null;
  });

  const [artisanOrders, setArtisanOrders] = useState<SellerOrder[]>(() => {
    const u = loadUser();
    return u?.email && u.userType === 'seller'
      ? loadJSON<SellerOrder[]>(sellerOrdersKey(u.email), [])
      : [];
  });

  // Derived: artisan has no activity at all
  const isNewArtisan = artisanProducts.length === 0 && artisanOrders.length === 0;

  // ── Persist: buyer cart & wishlist (per-user) ──
  useEffect(() => {
    if (currentUser?.email) saveJSON(cartKey(currentUser.email), cartItems);
  }, [cartItems, currentUser]);

  useEffect(() => {
    if (currentUser?.email) saveJSON(wishlistKey(currentUser.email), wishlistItems);
  }, [wishlistItems, currentUser]);

  useEffect(() => {
    if (currentUser?.email) saveJSON(ordersKey(currentUser.email), orders);
    else saveJSON(LS_ORDERS, orders);
  }, [orders, currentUser]);

  // ── Persist: artisan data (per-user) ──
  useEffect(() => {
    if (currentUser?.email && currentUser.userType === 'seller') {
      saveJSON(sellerProductsKey(currentUser.email), artisanProducts);
    }
  }, [artisanProducts, currentUser]);

  useEffect(() => {
    if (currentUser?.email && currentUser.userType === 'seller') {
      saveJSON(sellerOrdersKey(currentUser.email), artisanOrders);
    }
  }, [artisanOrders, currentUser]);

  // ── Buyer Cart actions ──
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
  const login = async (
    email: string,
    password: string,
    userType?: 'buyer' | 'seller'
  ): Promise<{ error?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();

    if (!registry[key]) return { error: 'This email is not registered. Please sign up first.' };
    if (registry[key].password !== password) return { error: 'Incorrect password.' };

    const rec = registry[key];
    const resolvedType = userType ?? rec.userType ?? 'buyer';
    const user: AuthUser = { email: rec.email, name: rec.name, photoURL: rec.photoURL, userType: resolvedType };

    setCurrentUser(user);
    saveUser(user);

    // Restore buyer data
    setCartItems(loadJSON<CartItem[]>(cartKey(key), []));
    setWishlistItems(loadJSON<string[]>(wishlistKey(key), []));
    setOrders(loadJSON<Order[]>(ordersKey(key), []));

    // Restore artisan data (only if seller)
    if (resolvedType === 'seller') {
      setArtisanProducts(loadJSON<ArtisanProduct[]>(sellerProductsKey(key), []));
      setArtisanOrders(loadJSON<SellerOrder[]>(sellerOrdersKey(key), []));
    } else {
      setArtisanProducts([]);
      setArtisanOrders([]);
    }

    return {};
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    userType?: 'buyer' | 'seller'
  ): Promise<{ error?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();

    if (registry[key]) return { error: 'An account with this email already exists. Please log in.' };

    const record: StoredUserRecord = { email, name: name.trim(), password, userType: userType ?? 'buyer' };
    registry[key] = record;
    saveRegistry(registry);
    return {};
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ error?: string; success?: string }> => {
    await mockDelay();
    const registry = loadRegistry();
    const key = email.toLowerCase().trim();
    if (!registry[key]) return { error: 'No account found with this email.' };
    return { success: 'Password reset email sent. Please check your inbox.' };
  };

  const loginWithGoogle = async (userType?: 'buyer' | 'seller'): Promise<{ error?: string }> => {
    await mockDelay();

    const googleUser: AuthUser = {
      email: 'google.user@gmail.com',
      name: 'Google User',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      userType: userType ?? 'buyer',
    };

    const registry = loadRegistry();
    const key = googleUser.email.toLowerCase();

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

    setCartItems(loadJSON<CartItem[]>(cartKey(key), []));
    setWishlistItems(loadJSON<string[]>(wishlistKey(key), []));
    setOrders(loadJSON<Order[]>(ordersKey(key), []));

    if ((userType ?? 'buyer') === 'seller') {
      setArtisanProducts(loadJSON<ArtisanProduct[]>(sellerProductsKey(key), []));
      setArtisanOrders(loadJSON<SellerOrder[]>(sellerOrdersKey(key), []));
    } else {
      setArtisanProducts([]);
      setArtisanOrders([]);
    }

    return {};
  };

  const logout = () => {
    if (currentUser?.email) {
      saveJSON(cartKey(currentUser.email), cartItems);
      saveJSON(wishlistKey(currentUser.email), wishlistItems);
      if (currentUser.userType === 'seller') {
        saveJSON(sellerProductsKey(currentUser.email), artisanProducts);
        saveJSON(sellerOrdersKey(currentUser.email), artisanOrders);
        if (artisanProfile) saveJSON(sellerProfileKey(currentUser.email), artisanProfile);
      }
    }
    setCurrentUser(null);
    saveUser(null);
    setCartItems([]);
    setWishlistItems([]);
    setArtisanProducts([]);
    setArtisanOrders([]);
    setArtisanProfile(null);
  };

  // ── Artisan Profile actions ──
  const saveArtisanProfile = (profileImage: string, description: string) => {
    if (!currentUser?.email) return;
    const profile: ArtisanProfile = {
      userId: currentUser.email,
      name: currentUser.name,
      profileImage,
      description,
      isComplete: true,
    };
    setArtisanProfile(profile);
    // Save to user's own key
    saveJSON(sellerProfileKey(currentUser.email), profile);
    // Also update the global profiles registry so Artisans page can read it
    const all = loadJSON<Record<string, ArtisanProfile>>(LS_PROFILES, {});
    all[currentUser.email.toLowerCase()] = profile;
    saveJSON(LS_PROFILES, all);
  };

  const getCompletedArtisanProfiles = (): ArtisanProfile[] => {
    const all = loadJSON<Record<string, ArtisanProfile>>(LS_PROFILES, {});
    return Object.values(all).filter(p => p.isComplete);
  };

  const setSavedAddress = (addr: AddressData) => {
    setSavedAddressState(addr);
    saveJSON(LS_ADDRESS, addr);
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

  // ── Artisan / Seller actions ──
  const addArtisanProduct = (data: Omit<ArtisanProduct, 'id'>) => {
    setArtisanProducts(prev => {
      const id = `P${String(Date.now()).slice(-6)}`;
      return [...prev, { id, ...data }];
    });
  };

  const updateArtisanProduct = (updated: ArtisanProduct) => {
    setArtisanProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteArtisanProduct = (id: string) => {
    setArtisanProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateArtisanOrder = (id: string, status: SellerOrderStatus) => {
    setArtisanOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // ── Global product catalog ──
  // Read every seller's product list from localStorage, convert to Product shape,
  // then merge with static products. Only 'active' products are published.
  const getAllProducts = (): Product[] => {
    const registry = loadJSON<Record<string, { email: string; name: string; userType?: string }>>(LS_REGISTRY, {});
    const sellerEmails = Object.values(registry)
      .filter(u => u.userType === 'seller')
      .map(u => u.email);

    const artisanProductsList: Product[] = [];
    const seenIds = new Set<string>();

    sellerEmails.forEach(email => {
      const prods = loadJSON<ArtisanProduct[]>(sellerProductsKey(email), []);
      const profile = loadJSON<ArtisanProfile | null>(sellerProfileKey(email), null);
      const artisanName = profile?.name || email.split('@')[0];

      prods
        .filter(p => p.status === 'active')
        .forEach(p => {
          const pid = `artisan_${email}_${p.id}`;
          if (seenIds.has(pid)) return;
          seenIds.add(pid);
          artisanProductsList.push({
            id: pid,
            name: p.name,
            price: p.price,
            category: CATEGORY_MAP[p.category] ?? 'Home Decor',
            artisan: artisanName,
            artisanId: email,
            image: p.image,
            description: p.description,
            state: 'India',
          });
        });
    });

    return [...staticProducts, ...artisanProductsList];
  };

  return (
    <AppContext.Provider
      value={{
        cartItems, wishlistItems, toasts,
        addToCart, updateQuantity, removeItem, clearCart, toggleWishlist, removeToast,
        isLoggedIn, currentUser, login, signup, forgotPassword, loginWithGoogle, logout,
        savedAddress, setSavedAddress,
        orders, placeOrder,
        artisanProducts, artisanOrders, isNewArtisan,
        addArtisanProduct, updateArtisanProduct, deleteArtisanProduct, updateArtisanOrder,
        artisanProfile, saveArtisanProfile, getCompletedArtisanProfiles,
        getAllProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}