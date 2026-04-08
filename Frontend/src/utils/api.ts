import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kk_token');
  const lang = localStorage.getItem('i18nextLng') || 'en';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = lang;
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; new_password: string }) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/users/me'),
};

export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProductById: (id: string) => api.get(`/products/${id}`),
};

export const categoriesAPI = {
  getCategories: () => api.get('/products/categories'),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data: { product_id: string; quantity: number }) => api.post('/cart/items', data),
  updateItem: (itemId: string, data: { quantity: number }) => api.patch(`/cart/items/${itemId}`, data),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId: string) => api.post(`/users/wishlist/${productId}`),
};

export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  placeOrder: (data: any) => api.post('/orders', data),
};

export const usersAPI = {
  getArtisans: () => api.get('/users/artisans'),
};

export const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    'Something went wrong'
  );
};
