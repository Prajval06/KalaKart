import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastProps } from '../components/Toast';
import { products as staticProducts } from '../data/products';
import type { Product } from '../data/products';
import { artisans } from '../data/artisans';

import type {
  CartItem, OrderItem, Order, ArtisanProduct, SellerOrderStatus, SellerOrder,
  AuthUser, AddressData, ArtisanProfile, AppContextType
} from './types';

const LS_USER      = 'kk_user';
const LS_TOKEN     = 'kk_token';
const LS_SAVED_ADDR = 'kk_address';
const LS_ORDERS     = 'kk_orders';
const LS_PRODUCTS   = 'kk_artisan_products';
const LS_PROFILES   = 'kk_artisan_profiles';

import {
  authAPI, productsAPI, cartAPI, wishlistAPI, ordersAPI, usersAPI, getErrorMessage
} from '../utils/api';

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ── Types for Backend sync (internal only) ──────────────────────────────────
interface BackendCart {
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    name: string;
    price: number;
    image_url?: string;
  }>;
  total_amount: number;
}

// ── LocalStorage helpers ─────────────────────────────────────────────────────
const loadJSON = <T,>(key: string, defaultValue: T): T => {
  const s = localStorage.getItem(key);
  if (!s) return defaultValue;
  try { return JSON.parse(s) as T; } catch { return defaultValue; }
};

const saveJSON = <T,>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const loadUser = (): AuthUser | null => loadJSON<AuthUser | null>(LS_USER, null);
const cartKey = (email: string) => `kk_cart_${email}`;
const wishlistKey = (email: string) => `kk_wish_${email}`;
const sellerOrdersKey = (email: string) => `kk_seller_orders_${email}`;

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(LS_TOKEN));
  const isLoggedIn = !!currentUser && !!authToken;

  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  // Buyer state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const u = loadUser();
    return u?.email ? loadJSON<CartItem[]>(cartKey(u.email), []) : [];
  });

  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    const u = loadUser();
    return u?.email ? loadJSON<string[]>(wishlistKey(u.email), []) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => loadJSON<Order[]>(LS_ORDERS, []));
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(() => loadJSON<AddressData | null>(LS_SAVED_ADDR, null));

  // Artisan state
  const [artisanProducts, setArtisanProducts] = useState<ArtisanProduct[]>(() => loadJSON<ArtisanProduct[]>(LS_PRODUCTS, []));
  
  const [artisanOrders, setArtisanOrders] = useState<SellerOrder[]>(() => {
    const u = loadUser();
    return u?.email && u.userType === 'seller'
      ? loadJSON<SellerOrder[]>(sellerOrdersKey(u.email), [])
      : [];
  });

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbArtisans, setDbArtisans] = useState<ArtisanProfile[]>([]);

  // Derived: artisan has no activity at all
  const isNewArtisan = artisanProducts.length === 0 && artisanOrders.length === 0;

  // ── Backend sync helpers ──
  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getProducts();
      if (res.data.success) {
        setDbProducts(res.data.data.map((p: any) => ({
          ...p,
          artisan: p.artisanName
        })));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchArtisans = async () => {
    try {
      const res = await usersAPI.getArtisans();
      if (res.data.success) {
        setDbArtisans(res.data.data.artisans.map((a: any) => ({
          userId: a.email,
          name: a.full_name,
          profileImage: a.profileImage,
          description: a.bio,
          isComplete: true,
          specialty: a.specialty,
          location: a.location
        })));
      }
    } catch (err) {
      console.error('Error fetching artisans:', err);
    }
  };

  const fetchUserCart = async () => {
    try {
      const res = await cartAPI.getCart();
      if (res.data.success && res.data.data.cart) {
        const backendItems = res.data.data.cart.items.map((it: any) => ({
          productId: it.product_id,
          quantity: it.quantity,
          itemId: it.id
        }));
        setCartItems(backendItems);
      }
    } catch (err) {
      console.error('Error fetching cart from backend:', err);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setWishlistItems(res.data.data.wishlist.map((p: any) => p.id || p._id));
      }
    } catch (err) {
      console.error('Error fetching wishlist from backend:', err);
    }
  };

  // Sync state on initial load / login
  useEffect(() => {
    fetchProducts();
    fetchArtisans();
  }, []);

  useEffect(() => {
    if (isLoggedIn && authToken) {
      fetchUserCart();
      fetchUserWishlist();
    }
  }, [isLoggedIn, authToken]);

  // ── Persist: buyer cart & wishlist (per-user) ──
  useEffect(() => {
    if (currentUser?.email) saveJSON(cartKey(currentUser.email), cartItems);
  }, [cartItems, currentUser]);

  useEffect(() => {
    if (currentUser?.email) saveJSON(wishlistKey(currentUser.email), wishlistItems);
  }, [wishlistItems, currentUser]);

  // ── Persist: buyer orders ──
  useEffect(() => {
    saveJSON(LS_ORDERS, orders);
  }, [orders]);

  // ── Persist: artisan products & orders ──
  useEffect(() => {
    saveJSON(LS_PRODUCTS, artisanProducts);
  }, [artisanProducts]);

  useEffect(() => {
    if (currentUser?.email && currentUser.userType === 'seller') {
      saveJSON(sellerOrdersKey(currentUser.email), artisanOrders);
    }
  }, [artisanOrders, currentUser]);

  // ── Buyer Cart actions ──
  const addToCart = async (productId: string, productName: string) => {
    if (isLoggedIn) {
      try {
        const res = await cartAPI.addItem({ product_id: productId, quantity: 1 });
        if (res.data.success) {
          const backendItems = res.data.data.cart.items.map((it: any) => ({
            productId: it.product_id,
            quantity: it.quantity,
            itemId: it.id
          }));
          setCartItems(backendItems);
        }
      } catch (err) {
        console.error('Failed to add to backend cart:', err);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { productId, quantity: 1 }];
      });
    }

    setToasts(prev => [
      ...prev,
      { id: `cart-${Date.now()}-${Math.random()}`, type: 'cart', productName },
    ]);
  };

  const updateQuantity = async (productId: string, change: number) => {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + change);

    if (isLoggedIn && (item as any).itemId) {
      try {
        const res = await cartAPI.updateItem((item as any).itemId, { quantity: newQty });
        if (res.data.success) {
          const backendItems = res.data.data.cart.items.map((it: any) => ({
            productId: it.product_id,
            quantity: it.quantity,
            itemId: it.id
          }));
          setCartItems(backendItems);
        }
      } catch (err) {
        console.error('Failed to update backend quantity:', err);
      }
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const removeItem = async (productId: string) => {
    const item = cartItems.find(i => i.productId === productId);
    if (isLoggedIn && item && item.itemId) {
      try {
        const res = await cartAPI.removeItem(item.itemId);
        if (res.data.success) {
          const backendItems = (res.data.data.cart?.items || []).map((it: any) => ({
            productId: it.product_id,
            quantity: it.quantity,
            itemId: it.id
          }));
          setCartItems(backendItems);
        }
      } catch (err) {
        console.error('Failed to remove from backend cart:', err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    }
  };

  const clearCart = () => { setCartItems([]); };

  const toggleWishlist = async (productId: string, productName: string) => {
    const isAdding = !wishlistItems.includes(productId);

    if (isLoggedIn) {
      try {
        const res = await wishlistAPI.toggleWishlist(productId);
        if (res.data.success) {
          setWishlistItems(res.data.data.wishlist.map((id: any) => id.toString()));
        }
      } catch (err) {
        console.error('Failed to toggle backend wishlist:', err);
      }
    } else {
      setWishlistItems(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
    }

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
  const login = async (email: string, password: string, userType?: 'buyer' | 'seller') => {
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;

      if (!data.success) {
        return { error: data.error?.message || 'Login failed' };
      }

      const user: AuthUser = {
        email: data.data.user.email,
        name: data.data.user.full_name,
        userType: data.data.user.role === 'artisan' ? 'seller' : 'buyer',
      };

      setCurrentUser(user);
      setAuthToken(data.data.access_token);
      saveJSON(LS_USER, user);
      localStorage.setItem(LS_TOKEN, data.data.access_token);

      return {};
    } catch (err) {
      return { error: getErrorMessage(err) };
    }
  };

  const signup = async (email: string, password: string, name: string, userType?: 'buyer' | 'seller') => {
    try {
      const role = userType === 'seller' ? 'artisan' : 'customer';
      const res = await authAPI.register({ email, password, full_name: name, role });
      const data = res.data;

      if (!data.success) {
        return { error: data.error?.message || 'Signup failed' };
      }

      const user: AuthUser = {
        email: data.data.user.email,
        name: data.data.user.full_name,
        userType: data.data.user.role === 'artisan' ? 'seller' : 'buyer',
      };

      setCurrentUser(user);
      setAuthToken(data.data.access_token);
      saveJSON(LS_USER, user);
      localStorage.setItem(LS_TOKEN, data.data.access_token);

      return {};
    } catch (err) {
      return { error: getErrorMessage(err) };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKEN);
    setCartItems([]);
    setWishlistItems([]);
    setOrders([]);
    // window.location.href = '/';
  };

  const forgotPassword = async (email: string) => {
    await new Promise(res => setTimeout(res, 1000));
    return { success: `If ${email} is registered, a reset link has been sent.` };
  };

  const loginWithGoogle = (userType?: 'buyer' | 'seller') => {
    // 1. Store userType preference for post-google-auth
    if (userType) localStorage.setItem('kk_pending_user_type', userType);
    // 2. Redirect to backend auth
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const loginWithGoogleToken = (token: string, user: AuthUser) => {
    const pendingType = localStorage.getItem('kk_pending_user_type') as 'buyer' | 'seller';
    const finalUser = { ...user, userType: pendingType || 'buyer' };
    
    setCurrentUser(finalUser);
    setAuthToken(token);
    saveJSON(LS_USER, finalUser);
    localStorage.setItem(LS_TOKEN, token);
    localStorage.removeItem('kk_pending_user_type');
  };

  // ── Artisan Account Profile ──
  const artisanProfile: ArtisanProfile | null = currentUser?.email
    ? loadJSON<Record<string, ArtisanProfile>>(LS_PROFILES, {})[currentUser.email] || null
    : null;

  const saveArtisanProfile = (profileImage: string, description: string) => {
    if (!currentUser?.email) return;
    const profiles = loadJSON<Record<string, ArtisanProfile>>(LS_PROFILES, {});
    profiles[currentUser.email] = {
      userId: currentUser.email,
      name: currentUser.name,
      profileImage,
      description,
      isComplete: true,
    };
    saveJSON(LS_PROFILES, profiles);
    // Trigger re-render by updating currentUser slightly or a dedicated profile state if needed,
    // but context load happens on render.
    setCurrentUser({ ...currentUser });
  };

  const getCompletedArtisanProfiles = (): ArtisanProfile[] => {
    const localProfiles = loadJSON<Record<string, ArtisanProfile>>(LS_PROFILES, {});
    const combined = [...dbArtisans, ...Object.values(localProfiles)];
    // deduplicate by userId
    const unique = Array.from(new Map(combined.map(p => [p.userId, p])).values());
    return unique.filter(p => p.isComplete);
  };

  const addArtisanProduct = (data: Omit<ArtisanProduct, 'id'>) => {
    const newProduct = { ...data, id: `art-${Date.now()}` };
    setArtisanProducts(prev => [...prev, newProduct as ArtisanProduct]);
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

  const getAllProducts = (): Product[] => {
    const artisanProductsList = artisanProducts.map(ap => {
      const p: Product = {
        id: ap.id,
        name: ap.name,
        price: ap.price,
        description: ap.description,
        category: ap.category,
        image: ap.image,
        images: ap.images,
        artisan: currentUser?.name || 'Local Artisan',
        rating: 0,
        numReviews: 0,
        isAvailable: ap.status === 'active'
      };
      return p;
    });

    return [...staticProducts, ...dbProducts, ...artisanProductsList];
  };

  return (
    <AppContext.Provider value={{
      cartItems, wishlistItems, toasts, addToCart, updateQuantity, removeItem, clearCart, toggleWishlist, removeToast,
      isLoggedIn, currentUser, authToken, login, signup, forgotPassword, logout, loginWithGoogle, loginWithGoogleToken,
      savedAddress, setSavedAddress, orders, placeOrder,
      artisanProducts, artisanOrders, isNewArtisan, addArtisanProduct, updateArtisanProduct, deleteArtisanProduct, updateArtisanOrder,
      artisanProfile, saveArtisanProfile, getCompletedArtisanProfiles,
      getAllProducts
    }}>
      {children}
    </AppContext.Provider>
  );
};