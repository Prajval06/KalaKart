import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Phase 3 & 4: In-memory token storage
let memoryAccessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('i18nextLng') || 'en';
  if (memoryAccessToken) {
    config.headers.Authorization = `Bearer ${memoryAccessToken}`;
  }
  config.headers['Accept-Language'] = lang;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response?.status === 401 && 
      originalRequest && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await authAPI.refresh();
        const newToken = res.data?.data?.access_token;
        if (!newToken) throw new Error('No token returned');
        
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Custom event for AppContext to handle forced logout if needed
        window.dispatchEvent(new Event('kk_unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  // Sends no body — relies on kk_refresh HttpOnly cookie being present (withCredentials: true)
  refresh: () => api.post('/auth/refresh', {}),
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
