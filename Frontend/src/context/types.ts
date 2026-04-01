import { ToastProps } from '../components/Toast';
import type { Product } from '../data/products';

// ── Buyer types ──────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  quantity: number;
  itemId?: string; // Backend ID
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

// ── Artisan Profile (public-facing) ─────────────────────────────────────────
export interface ArtisanProfile {
  userId: string;        // email (unique)
  name: string;          // display name
  profileImage: string;  // base64 or URL
  description: string;   // artisan bio
  isComplete: boolean;   // true after setup
  specialty?: string;
  location?: string;
  yearsOfExperience?: number;
}

// ── Context shape ────────────────────────────────────────────────────────────
export interface AppContextType {
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
  authToken: string | null;
  login: (email: string, password: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, userType?: 'buyer' | 'seller') => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string; success?: string }>;
  loginWithGoogle: (userType?: 'buyer' | 'seller') => void;          // redirects browser — no return value
  loginWithGoogleToken: (token: string, user: AuthUser) => void;    // called by AuthSuccess after redirect
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
