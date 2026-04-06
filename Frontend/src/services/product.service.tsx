import { api } from '../lib/api';

export const productService = {
  async getProducts(params?: Record<string, any>) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProductByIdentifier(identifier: string) {
    const res = await api.get(`/products/${identifier}`);
    return res.data;
  },
};